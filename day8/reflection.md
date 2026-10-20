# Reflection

The most difficult concept in this course was concurrency: what happens when two requests change the same data at the same time. At first I thought it was enough to check that a seat was free and then save the booking. It took me a while to see that another request can slip in between those two steps. I overcame this by drawing a timeline for two users and writing out each step, then rewriting the check and the update as one atomic SQL statement. Adding a UNIQUE constraint as a safety net made it click: the application can have bugs, but the database will not store the same seat twice.

Based on the feedback on my capstone, I would improve my architecture document. I explained what each component does, but I spent too little time on what happens when a component fails, for example when the cache goes down or the database lags. I would add short failure scenarios, show how the system recovers, and back up my load estimates with clearer assumptions. I would also improve my API client by adding automated tests for the validation and error states, so I can change the code without breaking it.

Next, I want to build and deploy a real backend instead of only designing one. I plan to learn Node.js with PostgreSQL, authentication and password hashing, then testing and deploying with Docker on a cloud service. After that, I want to learn about monitoring and load testing, so I can check that a design really survives a busy day instead of only calculating it.

