# RentBookIndia-
**RentBook India** is a book-rental marketplace that helps students rent textbooks, reference books, and exam-preparation books at affordable prices. It connects students with local bookstores and student delivery partners, enabling book rental, delivery, returns, and tracking through one platform while creating earning opportunities for students.

## Run locally (Windows)

Requirements: Node.js/npm, MongoDB Community Server running on `127.0.0.1:27017`, and VS Code Live Server (or another static file server).

1. In PowerShell, open the `backend` folder and run `Copy-Item .env.example .env` once.
2. Edit `backend/.env`: set `JWT_ACCESS_SECRET` to a private random string at least 32 characters long. Keep this file private.
3. Start MongoDB, then run `npm install` and `npm run dev` in `backend`. The API is `http://localhost:5000`; `http://localhost:5000/api/health` is its health endpoint.
4. Open the project root in VS Code and start Live Server on port `5500`. Open `http://127.0.0.1:5500/`.
5. Register or log in through the site. The auth forms call the backend, which stores users in MongoDB database `rentbookindia`.

The backend currently implements authentication only. Book search/listings, rentals, orders, delivery, payment and admin workflows still need API routes, MongoDB models, and authorization before those marketplace features can operate on real data.
