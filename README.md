# BookHaven

BookHaven is an original bookstore starter project built with MongoDB, Express, React, and Node.js. It has a searchable book catalogue, account registration and login, a personal basket, book reviews, and protected admin endpoints for managing the catalogue.

## Project structure

```text
backend/   Express API, MongoDB models, authentication, and seed script
frontend/  React and Vite bookstore interface
```

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Run locally

1. In `backend`, copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Install and start the API:

   ```bash
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The Vite development server proxies `/api` requests to `http://localhost:5000`.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API status |
| `GET` | `/api/books` | Search and browse books |
| `GET` | `/api/books/:id` | Book details and reviews |
| `POST` | `/api/books/:id/reviews` | Add a review (signed in) |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in and receive a token |
| `GET` | `/api/auth/me` | Read the signed-in account |
| `GET` | `/api/cart` | Read the signed-in user's basket |
| `POST` | `/api/cart/:bookId` | Add a book to the basket |
| `DELETE` | `/api/cart/:bookId` | Remove a book from the basket |
| `POST` | `/api/admin/books` | Add a book (admin only) |
| `PATCH` | `/api/admin/books/:id` | Edit a book (admin only) |
| `DELETE` | `/api/admin/books/:id` | Remove a book (admin only) |

New accounts receive the `customer` role. To promote a trusted account to admin, update that user's `role` to `admin` directly in MongoDB. Never expose the database or JWT secret in a public repository.

## Notes

- The basket and reviews require a signed-in user through the API.
- Use your own secret values in `.env`; that file is ignored by Git.
- This is a learning project starter, so review and adapt it before production use.
