# SnapShare Scaling Plan

## Assumptions

- 10 million registered users.
- 10% of users are active each day.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
- Traffic is spread over 24 hours (86,400 seconds), and peak traffic is 5× the average.
- Sizes use decimal units (1 MB = 1,000,000 bytes; 1 TB = 1,000,000 MB).

## Estimates

**Daily active users (DAU):** 10,000,000 × 10% = **1,000,000**

**Uploads per second**
- Uploads per day: 1,000,000 × 1 = 1,000,000
- Average: 1,000,000 ÷ 86,400 ≈ **12 uploads/s**
- Peak (5×): ≈ **58 uploads/s**

**Feed views per second**
- Feed views per day: 1,000,000 × 50 = 50,000,000
- Average: 50,000,000 ÷ 86,400 ≈ **579 views/s**
- Peak (5×): ≈ **2,900 views/s**

**Storage per year**
- Per photo: 2 MB + 0.05 MB = 2.05 MB
- Per day: 1,000,000 × 2.05 MB = 2.05 TB
- Per year: 2.05 TB × 365 ≈ **748 TB** (about 0.75 PB)
  - Originals: about 730 TB
  - Thumbnails: about 18 TB

## Read-heavy or write-heavy?

SnapShare is **read-heavy**. There are 50 feed views for every 1 upload, a read-to-write ratio of about 50:1. Feed views are also the traffic that spikes at peak (about 2,900/s against 58 uploads/s).

What this means for the design:
- Cache feed data and serve photos through a CDN so most reads never reach the database.
- Add a read replica so feed queries do not compete with writes.
- Keep the upload path simple and move slow work (thumbnails) to a background worker.
- Add more app servers behind a load balancer as read traffic grows.

## Why photos do not go in the database

- At about 748 TB per year, the database would become huge, slow to back up and slow to replicate.
- Databases are built for small structured rows, not large binary files, and database storage is more expensive per GB than object storage.
- Every photo read would use database connections and memory that feed queries need.
- A CDN cannot serve files out of a database directly.

Photos go in **object storage** (such as Amazon S3), which is cheap, durable and built for huge numbers of large files. The database stores only metadata: the photo id, owner, caption, timestamp and the object storage key (the path to the file).

## Architecture

```
                    Users (mobile / web)
                      |              |
        feed & API    |              |  photo / thumbnail images
                      v              v
             +---------------+   +-------+
             | Load Balancer |   |  CDN  |
             +-------+-------+   +---+---+
                     |               | (cache miss)
         +-----------+-----------+   |
         |           |           |   |
         v           v           v   |
     +-------+   +-------+   +-------+   |
     | App   |   | App   |   | App   |   |
     | server|   | server|   | server|   |
     +---+---+   +---+---+   +---+---+   |
         |           |           |       |
   +-----+-----------+-----------+-------+--------------+
   |                 |                   |              |
   v                 v                   v              v
+-------+     +-------------+      +--------------+   +-------+
| Cache |     |  Database   | ---> | Read replica |   | Queue |
|(Redis)|     |  (primary)  | copy |  (feeds)     |   +---+---+
+-------+     +-------------+      +--------------+       |
                                                          v
                                                      +--------+
                                                      | Worker |
                                                      |(thumb- |
                                                      | nails) |
                                                      +---+----+
                                                          |
         +------------------------------+ <---------------+
         |       Object storage         |  reads original,
         | (originals + thumbnails)     |  writes thumbnail
         +------------------------------+
                     ^
                     |  CDN fetches images from here on a miss
                     +--- (and app servers write originals here)
```

Reads: the feed request goes to the load balancer, then an app server, which checks the cache first and falls back to the read replica. Image files are fetched from the CDN, which falls back to object storage.

Writes: an upload goes to an app server, which saves the original to object storage, writes metadata to the database primary and adds a job to the queue.

## What each component does

- **CDN:** serves photos and thumbnails from servers close to the user, which cuts load time and keeps image traffic off our own servers.
- **Load balancer:** spreads incoming requests across the app servers so no single server is overloaded and one failing server does not take the app down.
- **App servers:** run the SnapShare logic (login, uploads, feeds) and can be added or removed to match traffic.
- **Cache (Redis):** keeps frequently read data such as feeds and profiles in memory, so most of the 579+ views per second avoid a database query.
- **Database (primary):** stores users, follows, and photo metadata, and handles every write.
- **Read replica:** holds a copy of the primary and answers feed queries, so heavy reading does not slow down writes.
- **Object storage:** stores the photo files cheaply and durably at the scale of hundreds of terabytes per year.
- **Queue:** holds thumbnail jobs so the upload request can finish quickly without waiting for image processing.
- **Worker:** takes jobs from the queue and creates the 50 KB thumbnails in the background, and more workers can be added if the queue grows.

## Upload flow

1. The user picks a photo and the app sends it to SnapShare through the load balancer.
2. The load balancer forwards the request to one of the app servers.
3. The app server checks that the user is logged in and that the file is a valid image within the size limit.
4. The app server saves the original photo to object storage and gets back its storage key.
5. The app server writes a row to the database primary (photo id, owner, caption, timestamp, storage key, status "processing").
6. The app server adds a "create thumbnail" job, containing the photo id and key, to the queue.
7. The app server replies to the user with success, so the user does not wait for thumbnail creation.
8. A worker takes the job from the queue, downloads the original from object storage and creates a 50 KB thumbnail.
9. The worker saves the thumbnail to object storage and updates the database row with the thumbnail key and status "ready".
10. The worker clears the cached feeds of the uploader's followers (or the cache entries expire), so the new photo shows up on their next feed load.
11. Followers' feeds now load the thumbnail through the CDN. The first request is a cache miss, so the CDN fetches it from object storage and keeps a copy for later requests.

If the worker fails, the job stays in the queue (or goes back to it) and is retried, so no thumbnail is lost.

## Trade-offs

- **Cache speed vs. freshness.** Caching feeds makes reads fast and protects the database, but a cached feed can be a little out of date, so a new photo may take a short time to appear. We accept this because seeing a post a few seconds late matters far less than a slow feed.
- **Read replica vs. consistency.** The replica takes read load off the primary, but it copies data with a small delay (replication lag). A user could upload a photo and not see it on their own feed straight away. This can be reduced by reading the user's own recent photos from the primary.
- **Asynchronous thumbnails vs. simplicity.** Using a queue and worker makes uploads fast and lets us absorb spikes, but it adds more components to run and monitor, and a photo may briefly have no thumbnail. Making thumbnails inside the upload request would be simpler but slower and fragile.
- **CDN cost vs. speed.** A CDN greatly lowers image load times and server load, but it costs money for bandwidth, and an updated or deleted photo may keep being served until the CDN copy expires or is cleared.
