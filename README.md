 
# Library Management System API

A RESTful Library Management System API built with **NestJS, Prisma ORM 7 and PostgreSQL**. The API supports managing books and genres, user registration and authentication, searching, filtering, pagination, and role-based access control.

## Features

### 1. Authentication and Authorization
- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Role-based authorization with two user roles:
  - `PATRON`
  - `LIBRARIAN`
- Only authenticated librarians can create, update, and delete books.

### 2. Genre Management
- Create new genres.
- Retrieve all genres.
- Retrieve a genre by ID.
- Update existing genres.
- Delete genres.

### 3. Book Management
- Add new books.
- Retrieve all books.
- Retrieve individual books by ID.
- Update book information.
- Delete books.
- Track total and available book copies.
- Associate books with genres.
- Validate ISBN-13 values.

### 4. Search, Filtering and Pagination
- Search books by title or author.
- Filter books by genre.
- Paginate book listings.
- Combine search, filtering, and pagination.

## Technologies Used

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| TypeScript | Programming language |
| Prisma ORM 7 | Database ORM |
| PostgreSQL | Relational database |
| Neon | Hosted PostgreSQL database |
| JWT | Authentication |
| Passport.js | Authentication strategy |
| bcrypt | Password hashing |
| class-validator | Request validation |
| Postman | API testing |

## Project Structure

```text
api/
├── docs/
│   └── postman_collection.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.decorator.ts
│   │   └── roles.guard.ts
│   ├── books/
│   │   ├── dto/
│   │   ├── books.controller.ts
│   │   └── books.service.ts
│   ├── genres/
│   │   ├── genres.controller.ts
│   │   └── genres.service.ts
│   ├── prisma/
│   ├── app.module.ts
│   └── main.ts
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm
- PostgreSQL database or a Neon PostgreSQL database
- Postman (for API testing)

### 1. Clone the repository

```bash
git clone https://github.com/haron2000/library-management-system.git
```

Navigate to the backend directory:

```bash
cd library-management-system/api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `api` directory.

Add the following variables:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_strong_jwt_secret"

LIBRARIAN_EMAIL="librarian@library.com"
LIBRARIAN_PASSWORD="your_strong_librarian_password"
```

Replace the example values with your actual database connection string and secure credentials.

**Important:** Never commit your `.env` file or expose your database credentials, JWT secret, or librarian password.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migrations

If setting up the project against a new database, apply the migrations:

```bash
npx prisma migrate deploy
```

For local development when creating a new migration:

```bash
npx prisma migrate dev --name migration_name
```

### 6. Seed the database

Run:

```bash
npx prisma db seed
```

The seed script creates or reuses four genres:

- Technology
- Fiction
- Science
- Business

It also inserts 16 sample books and creates or updates a librarian account using the credentials supplied in the environment variables.

**Note:** The current seed script deletes existing book records before inserting the sample books. Use it only with a development or test database, not a live library database containing real records.

### 7. Start the development server

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

## API Endpoints

All endpoints use the base URL:

`http://localhost:3000`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new patron |
| POST | `/auth/login` | Authenticate and obtain a JWT |

**Registration example:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Login example:**

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

A successful login returns an access token and user information.

Use the returned token in the Authorization header when accessing protected endpoints:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Genre Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/genres` | Retrieve all genres |
| GET | `/genres/:id` | Retrieve a genre by ID |
| POST | `/genres` | Create a genre |
| PATCH | `/genres/:id` | Update a genre |
| DELETE | `/genres/:id` | Delete a genre |

### Book Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/books` | Retrieve books | Public |
| GET | `/books/:id` | Retrieve a book by ID | Public |
| POST | `/books` | Create a book | Librarian |
| PATCH | `/books/:id` | Update a book | Librarian |
| DELETE | `/books/:id` | Delete a book | Librarian |

### Creating a Book

**POST** `/books`

Example request:

```json
{
  "title": "Introduction to Python",
  "author": "John Smith",
  "isbn": "9780132350884",
  "totalCopies": 5,
  "genreId": 1
}
```

The API validates the submitted information and initializes the available copies to match the total copies.

### Searching and Filtering Books

The books endpoint supports query parameters.

**Search by title or author:**

```http
GET /books?search=python
```

**Filter by genre:**

```http
GET /books?genreId=1
```

**Pagination:**

```http
GET /books?page=1&limit=5
```

**Combine search, filtering and pagination:**

```http
GET /books?search=python&genreId=1&page=1&limit=5
```

The paginated response includes the book data and pagination information.

## Database Models

The database contains three main models:

### User
- `id`
- `name`
- `email`
- `password`
- `role`
- `createdAt`

### Genre
- `id`
- `name`

### Book
- `id`
- `title`
- `author`
- `isbn`
- `totalCopies`
- `availableCopies`
- `genreId`
- `createdAt`

**Relationships:**
- A genre can have multiple books.
- Each book belongs to one genre.
- Users have either the `PATRON` or `LIBRARIAN` role.

## Validation and Error Handling

The API uses `class-validator` and NestJS validation pipes to validate incoming requests.

Examples of validation include:

- Required book titles and author names.
- Valid ISBN-13 values.
- Integer values for book copies and genre IDs.
- Positive values for book quantities and genre IDs.
- Valid email addresses.
- Passwords with a minimum length of eight characters.

Common HTTP status codes:

| Status Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Bad request or