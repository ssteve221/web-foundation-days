# Library API Design: Books

Base path: `/api/v1`. All request and response bodies are JSON.

## Endpoints

### 1. List books
- **Method:** GET
- **Path:** `/books`
- **Description:** Returns all books (supports `?limit=` and `?page=`).
- **Request body:** none
- **Success status:** 200 OK

### 2. Get one book
- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Returns a single book by its id.
- **Request body:** none
- **Success status:** 200 OK

### 3. Create a book
- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Request body:**
  ```json
  {
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "isbn": "9780547928227",
    "year": 1937
  }
  ```
- **Success status:** 201 Created (with a `Location: /api/v1/books/{id}` header)

### 4. Replace a book
- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Replaces all fields of an existing book.
- **Request body:**
  ```json
  {
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "isbn": "9780547928227",
    "year": 1937
  }
  ```
- **Success status:** 200 OK

### 5. Update part of a book
- **Method:** PATCH
- **Path:** `/books/{id}`
- **Description:** Changes only the fields that are sent.
- **Request body:**
  ```json
  { "year": 1951 }
  ```
- **Success status:** 200 OK

### 6. Delete a book
- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Removes a book from the library.
- **Request body:** none
- **Success status:** 204 No Content

### 7. List books by an author
- **Method:** GET
- **Path:** `/books?author=Tolkien`
- **Description:** Returns only the books whose author matches the query parameter.
- **Request body:** none
- **Success status:** 200 OK (an empty list `[]` if the author has no books)

## Error codes

### 400 Bad Request
- **Meaning:** The request is invalid.
- **Example:** `POST /books` with the title missing, or `year` sent as the text "abc" instead of a number.
- **Example response body:**
  ```json
  { "error": "Title is required." }
  ```

### 404 Not Found
- **Meaning:** The requested book does not exist.
- **Example:** `GET /books/9999` when no book has the id 9999 (also for `PUT`, `PATCH` and `DELETE` on a missing id).
- **Example response body:**
  ```json
  { "error": "Book 9999 not found." }
  ```
