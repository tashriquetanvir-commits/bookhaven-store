# BookHaven

BookHaven is an original bookstore starter project built with MongoDB, Express, React, and Node.js. It includes a searchable catalogue, account registration and login, a personal basket, book reviews, and protected admin endpoints for managing books.

## Project structure

```text
backend/   Express API, MongoDB models, authentication, and sample data
frontend/  React and Vite bookstore interface
```

## Requirements

- Node.js 18 or newer
- MongoDB local instance or Atlas connection string

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. In `backend`, run `npm install`, `npm run seed`, and `npm run dev`.
3. In `frontend`, run `npm install` and `npm run dev`.

Vite proxies `/api` requests to `http://localhost:5000`.

## API overview

- `GET /api/health` — API status
- `GET /api/books` and `GET /api/books/:id` — browse the catalogue
- `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me` — accounts
- `GET /api/cart`, `POST /api/cart/:bookId`, and `PATCH /api/cart/:bookId` — basket
- `POST /api/books/:id/reviews` — submit a review
- Admin-only `POST/PATCH/DELETE /api/admin/books` — catalogue management

New accounts are customers by default. To promote a trusted account, update its role to `admin` directly in MongoDB. Keep secrets in `.env`; it is excluded by Git.

This is a learning project starter. Connect a payment provider and review security, validation, and deployment settings before production use.
