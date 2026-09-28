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

### Rentals

Rental creation and inventory reservation require a customer token. Dates must be ISO 8601 timestamps with a timezone; rental periods must be at least one hour and no longer than 365 days, billed in rounded-up 24-hour days. The price is snapshotted at booking time. A conditional inventory update atomically reserves available quantity. Payment is not processed by this module.

- `POST /api/rentals` — request a rental. Body: `inventoryId`, `quantity` (optional, default 1), `startAt`, `endAt`, `renterNote` (optional)
- `GET /api/rentals/me` — customer's rentals; optional `status`, `page`, `limit`
- `GET /api/rentals/:id` — rental detail for the renter, listing seller, or admin
- `PATCH /api/rentals/:id/cancel` — customer cancels a requested or accepted future rental. Optional body: `{ "note": "..." }`; reserved quantity is restored
- `GET /api/rentals/seller` — seller's rental requests; optional `status`, `page`, `limit`
- `PATCH /api/rentals/:id/decision` — seller accepts or rejects a request. Body: `decision` (`accept|reject`), optional `note`
- `PATCH /api/rentals/:id/complete` — seller marks an accepted rental as completed and restores quantity

Rental statuses: `requested`, `accepted`, `rejected`, `cancelled`, `completed`. Invalid state changes return `409`. Role provisioning remains restricted to trusted server/admin operations.

## Authentication APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Security notes

- Passwords are hashed with bcrypt and are never returned by API responses.
- JWT signing secret belongs only in `.env` and must never be committed.
- HTTPS should be used in production.
- Payment verification and webhooks must be implemented server-side before production payments are enabled.
