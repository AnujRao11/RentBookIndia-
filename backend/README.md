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

## Endpoints

### Health

`GET /api/health`

### Register

`POST /api/auth/register`

```json
{
  "name": "Anuj Rao",
  "email": "anuj@example.com",
  "mobile": "9876543210",
  "password": "StrongPassword123",
  "accountType": "student"
}
```

Public registration creates a `customer` role. Seller, delivery and admin roles must be provisioned through controlled server/admin flows.

### Login

`POST /api/auth/login`

```json
{
  "email": "anuj@example.com",
  "password": "StrongPassword123"
}
```

Returns an access token.

### Current user

`GET /api/auth/me`

Header:

`Authorization: Bearer <accessToken>`

## Security notes

- Passwords are hashed with bcrypt and are never returned by API responses.
- JWT signing secret belongs only in `.env` and must never be committed.
- HTTPS should be used in production.
- Payment verification and webhooks must be implemented server-side before production payments are enabled.
