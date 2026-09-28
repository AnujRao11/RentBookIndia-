# RentBook India Backend

Node.js + Express + MongoDB API for RentBook India.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Required environment variables:

- `PORT`
- `MONGODB_URI`
- `CLIENT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES`

## Marketplace APIs

All successful responses use `{ "success": true, ... }`. Protected routes require `Authorization: Bearer <accessToken>`.

### Sellers

- `GET /api/sellers/me` — seller account profile
- `POST /api/sellers/me` — create seller storefront profile (seller role required)
- `PATCH /api/sellers/me` — update seller storefront profile
- `GET /api/sellers/:id` — public storefront summary

Seller accounts must be provisioned as `role: "seller"` through a trusted administrative process; public registration remains customer-only.

### Books

- `GET /api/books` — public search/filter and paginated available catalog
  - Query: `q`, `category`, `author`, `language`, `city`, `condition`, `minRent`, `maxRent`, `page`, `limit`, `sort` (`newest|title|rent-low|rent-high`)
- `GET /api/books/categories` — available catalog category values
- `GET /api/books/:id` — public book details with active seller offers

### Seller inventory

All inventory operations require an authenticated seller with an active seller profile.

- `GET /api/inventory` — own inventory
- `POST /api/inventory` — add an existing book with `bookId`, or create a catalog entry with `book`, plus `quantity`, `condition`, `rentPricePerDay`, and/or `salePrice`
- `PATCH /api/inventory/:id` — update own quantity, availability, condition, prices, or notes
- `DELETE /api/inventory/:id` — remove own inventory listing

Inventory writes always scope by the authenticated seller profile. Book search only returns books with an active seller offer and positive available quantity.

## Authentication APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Security notes

- Passwords are hashed with bcrypt and are never returned by API responses.
- JWT signing secret belongs only in `.env` and must never be committed.
- HTTPS should be used in production.
- Payment verification and webhooks must be implemented server-side before production payments are enabled.
