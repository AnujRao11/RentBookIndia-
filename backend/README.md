# RentBook India Backend

Node.js + Express + MongoDB API for RentBook India.

## Setup

```bash
cd backend
npm install
npm run dev
```

On Windows PowerShell, create your local configuration first:

```powershell
Copy-Item .env.example .env
```

Replace `JWT_ACCESS_SECRET` with a private random value of at least 32 characters. Keep `.env` private; it is ignored by Git.

Required environment variables:

- `PORT`
- `MONGODB_URI`
- `CLIENT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES`

Start MongoDB locally before starting the API. The default local URI in `.env.example` uses database `rentbookindia` on port `27017`. Serve the static project root with VS Code Live Server (port `5500`) or another local static server; do not open the HTML as a `file://` URL. The login and registration pages call `http://localhost:5000`.

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
- Public registration always creates a customer/student account; elevated roles must be provisioned by a trusted admin workflow.
- Authentication requests are rate limited and request bodies are validated.
- Browser access tokens are kept in `sessionStorage` for this prototype. A production deployment should move to short-lived access tokens with a secure, HttpOnly, SameSite cookie session and CSRF protections.
- JWT signing secret belongs only in `.env` and must never be committed.
- HTTPS should be used in production.
- Payment verification and webhooks must be implemented server-side before production payments are enabled.
