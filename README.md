# 🏔 Peja Tourism Platform

A modern, production-ready tourism and local discovery web application for **Peja & Rugova Valley, Kosovo**.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB) ![Node](https://img.shields.io/badge/Node-18+-339933) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1) ![Socket.io](https://img.shields.io/badge/Socket.io-4-010101)

---

## 🏗 Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | React 18, React Router 6, Recharts, Leaflet, Socket.io-client |
| Backend     | Node.js, Express 4, Socket.io                          |
| Database    | MySQL 8                                                 |
| Auth        | JWT (jsonwebtoken + bcryptjs)                          |
| Real-time   | WebSockets via Socket.io                               |
| HTTP Client | Axios                                                   |

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18.x
- **MySQL** 8.x (running locally or remote)
- **npm**

---

## 🚀 Quick Start (3 steps)

### 1 — Database

```bash
mysql -u root -p < database/schema.sql
```

This creates the `peja_tourism` database, all 9 tables, and seed data:
- Admin user: `admin@pejatourism.com` / `Admin@123`
- 5 sample listings, images, and offers

### 2 — Backend

```bash
cd backend
cp .env.example .env    # then edit DB_PASSWORD
npm install
node setup.js           # verifies DB connection is working
npm run dev
```

Backend runs on **http://localhost:5000**

### 3 — Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

The `"proxy"` setting in `frontend/package.json` automatically forwards `/api` requests to `localhost:5000` during development.

---

## 🔐 Default Accounts

| Role     | Email                   | Password  |
|----------|--------------------------|-----------|
| Admin    | admin@pejatourism.com   | Admin@123 |

### Creating a Business Account

1. Log in as admin → go to `/admin/users`
2. Click **+ New User**, set role to `business`
3. Link their listing by going to `/admin/listings` → Edit → set `owner_id` (currently via the `PUT /api/listings/:id` endpoint body) to the business user's ID

---

## 📁 Project Structure

```
peja-tourism/
├── database/
│   └── schema.sql              ← MySQL schema + seed data
│
├── backend/                    ← Node.js + Express API
│   ├── server.js               ← Entry point (Express + Socket.io)
│   ├── setup.js                ← Verify .env + DB connection
│   ├── .env.example
│   ├── config/db.js            ← MySQL2 pool with friendly errors
│   ├── controllers/            ← 7 controllers (auth, listing, review, offer, analytics, admin, contact)
│   ├── routes/                 ← REST endpoints
│   ├── middleware/             ← JWT auth + role guards + error handler
│   ├── socket/                 ← Real-time viewer tracking
│   └── utils/                  ← Winston logger + response helpers
│
└── frontend/                   ← React 18 SPA
    ├── .env.example
    ├── public/index.html
    └── src/
        ├── App.js              ← Router + auth shell
        ├── styles/global.css   ← Design tokens, utilities
        ├── services/api.js     ← Axios + typed service helpers
        ├── hooks/              ← useAuth + useListingSocket
        ├── utils/helpers.js    ← formatters, CATEGORIES, etc.
        ├── components/         ← Navbar, Footer, Card, Carousel, SearchBar, etc.
        └── pages/              ← 8 full pages (Home, Listings, Detail, Map, Contact, Auth, Admin, Business)
```

---

## 🗺 Routes

### Public Pages

| Path                  | Description                          |
|-----------------------|--------------------------------------|
| `/`                   | Homepage with hero, categories, offers |
| `/listings`           | Grid + filters + pagination         |
| `/listings/:slug`     | Detail page with reviews + live viewers |
| `/map`                | Interactive Leaflet map             |
| `/contact`            | Contact & "Add my business" form    |
| `/login` `/register`  | Auth pages                           |

### Protected Pages

| Path                | Role     | Description              |
|---------------------|----------|--------------------------|
| `/admin`            | admin    | Overview with stats + charts |
| `/admin/listings`   | admin    | Full CRUD                |
| `/admin/users`      | admin    | Manage users             |
| `/admin/offers`     | admin    | Manage offers            |
| `/admin/contacts`   | admin    | Contact form submissions |
| `/business`         | business | Analytics-only dashboard |

### API Endpoints

<details>
<summary>Click to expand full API reference (23 endpoints)</summary>

| Method | Path                                 | Auth           |
|--------|--------------------------------------|----------------|
| POST   | `/api/auth/register`                 | —              |
| POST   | `/api/auth/login`                    | —              |
| GET    | `/api/auth/me`                       | ✓              |
| GET    | `/api/listings`                      | optional       |
| GET    | `/api/listings/search/autocomplete`  | —              |
| GET    | `/api/listings/:slug`                | optional       |
| POST   | `/api/listings`                      | admin          |
| PUT    | `/api/listings/:id`                  | admin          |
| DELETE | `/api/listings/:id`                  | admin          |
| POST   | `/api/listings/:id/click`            | optional       |
| GET    | `/api/listings/:listingId/reviews`   | —              |
| POST   | `/api/listings/:listingId/reviews`   | ✓              |
| DELETE | `/api/reviews/:id`                   | admin or owner |
| GET    | `/api/offers`                        | —              |
| POST   | `/api/offers`                        | admin          |
| GET    | `/api/analytics/overview`            | admin          |
| GET    | `/api/analytics/listing/:id`         | admin/business |
| GET    | `/api/admin/users`                   | admin          |
| POST   | `/api/admin/users`                   | admin          |
| PATCH  | `/api/admin/users/:id`               | admin          |
| GET    | `/api/admin/contacts`                | admin          |
| POST   | `/api/contacts`                      | optional       |
| GET    | `/api/health`                        | —              |

</details>

---

## 🔌 Real-time (Socket.io)

Events:
- **Client → Server:** `join:listing`, `leave:listing`, `heartbeat`
- **Server → Client:** `viewers:update` `{ listingId, count }`

Used on the detail page and business dashboard to show "**X people viewing now**" in real-time. Implemented in `useListingSocket()` (frontend) + `backend/socket/index.js`.

---

## 📊 Analytics Tracked

| Metric           | Table            | How it's captured                        |
|------------------|------------------|------------------------------------------|
| Page views       | `listing_views`  | Auto on `GET /api/listings/:slug`        |
| Unique visitors  | `listing_views`  | SHA-256 hash of IP address               |
| Button clicks    | `listing_clicks` | `POST /api/listings/:id/click`            |
| Contacts/leads   | `contacts`       | Contact form submissions                  |
| Reviews + rating | `reviews`        | User-submitted                            |
| Live viewers     | In-memory        | Socket.io room membership                 |
| Sessions         | `sessions`       | Created on join, updated by heartbeat     |

---

## 🎨 Design System

| Token             | Value                   |
|-------------------|-------------------------|
| Primary           | `#336f70`               |
| Primary Dark      | `#175354`               |
| Accent (gold)     | `#c8a96a`               |
| Display font      | Cormorant Garamond      |
| Body font         | DM Sans                 |

All design tokens live in `frontend/src/styles/global.css` as CSS custom properties.

---

## 🚢 Production Deployment

### Backend

```bash
NODE_ENV=production
npm install -g pm2
pm2 start server.js --name peja-api
pm2 save
```

### Frontend

```bash
cd frontend && npm run build
# serve /build via nginx
```

### Nginx example

```nginx
server {
  listen 80;
  server_name pejatourism.com;

  root /var/www/peja-tourism/frontend/build;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
  }

  location /socket.io {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

---

## 🔒 Security

- JWT secret **must** be changed before production (`JWT_SECRET` in `.env`)
- Passwords hashed with `bcryptjs` (cost 12)
- Rate limiting: 200 requests / 15 min per IP
- Helmet.js security headers
- CORS locked to `CLIENT_URL`
- Role-based guards on sensitive endpoints
- Parameterized SQL queries (no injection risk)

---

## 🐛 Troubleshooting

**`AxiosError: Request failed with status code 500`**
- Check backend terminal for Winston error output — it logs full stack traces
- Run `node setup.js` in the `backend/` folder to verify DB connection

**`MySQL connection error`**
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`
- Ensure MySQL is running: `sudo service mysql start`
- Verify the database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**`bcrypt install fails`**
- This project uses `bcryptjs` (pure JS), NOT `bcrypt`. If you see bcrypt errors, your `package.json` might be cached. Run:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

**Socket not connecting**
- Backend must be running on port 5000
- Check `REACT_APP_SOCKET_URL` in `frontend/.env`
- Real-time features are non-blocking — app works fine without them

**`Cannot GET /api/...` from frontend**
- Verify `"proxy": "http://localhost:5000"` is in `frontend/package.json`
- Restart the React dev server after any proxy change

**Admin login fails with `Invalid credentials`**
- Re-import the schema (the admin password hash is seeded):
  ```bash
  mysql -u root -p -e "DROP DATABASE IF EXISTS peja_tourism;"
  mysql -u root -p < database/schema.sql
  ```

---

## 📝 License

MIT — built for Peja Tourism.
