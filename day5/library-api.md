# Library Books REST API

Base path: `/api/books`. All bodies and responses are JSON.

## Endpoints

### 1. List books
- **Method:** `GET`
- **Path:** `/api/books`
- **Description:** Returns all books in the library.
- **Request body:** none
- **Success:** `200 OK`

### 2. Get one book
- **Method:** `GET`
- **Path:** `/api/books/{id}`
- **Description:** Returns the book with the given id.
- **Request body:** none
- **Success:** `200 OK`

### 3. Create a book
- **Method:** `POST`
- **Path:** `/api/books`
- **Description:** Adds a new book to the library.
- **Example request body:**
  ```json
  {
    "title": "Dune",
    "author": "Frank Herbert",
    "isbn": "978-0441013593",
    "year": 1965
  }
  ```
- **Success:** `201 Created`

### 4. Update a book
- **Method:** `PUT`
- **Path:** `/api/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**
  ```json
  {
    "title": "Dune",
    "author": "Frank Herbert",
    "isbn": "978-0441013593",
    "year": 1965
  }
  ```
- **Success:** `200 OK`

### 5. Delete a book
- **Method:** `DELETE`
- **Path:** `/api/books/{id}`
- **Description:** Removes the book with the given id.
- **Request body:** none
- **Success:** `204 No Content`

### 6. List books by an author
- **Method:** `GET`
- **Path:** `/api/books?author={name}`
- **Description:** Returns only the books written by the given author.
- **Example:** `GET /api/books?author=Frank%20Herbert`
- **Request body:** none
- **Success:** `200 OK`

## Error codes

- **400 Bad Request**
  - Meaning: the request is malformed or has invalid data.
  - Example: `POST /api/books` with no `title`, or with `year` set to `"abc"`.
- **404 Not Found**
  - Meaning: the requested resource does not exist.
  - Example: `GET /api/books/9999` when no book has id 9999.

