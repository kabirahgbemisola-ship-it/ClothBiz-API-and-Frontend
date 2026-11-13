# Cloth & Co. — Cloth Business API + Store Website

This project extends the original Express/Mongoose API and includes a responsive storefront in `frontend/`.

## Features added

### 1. Refresh tokens
- Customer registration/login returns an access token and a refresh token.
- Access tokens are short-lived (`JWT_EXPIRY`, default `15m`).
- Refresh tokens are random, stored only as SHA-256 hashes in MongoDB, expire after `REFRESH_TOKEN_DAYS`, and rotate after each successful refresh.
- Reuse of a rotated refresh token is rejected.
- Customer logout revokes the supplied refresh token.

### 2. Fabric search and filtering
Use `GET /api/all` with any combination of:

| Query parameter | Example | Meaning |
|---|---|---|
| `search` | `?search=ankara` | Search fabric name, material, or colour |
| `name` | `?name=ankara` | Match fabric name |
| `material` | `?material=cotton` | Match material |
| `color` | `?color=blue` | Match colour |
| `tier` | `?tier=premium` | `quality` or `premium` |
| `minPrice` | `?minPrice=1000` | Minimum price per yard |
| `maxPrice` | `?maxPrice=5000` | Maximum price per yard |
| `inStock` | `?inStock=true` | `true` or `false` |
| `page`, `limit` | `?page=1&limit=12` | Pagination |

Example: `/api/all?search=ankara&material=cotton&color=blue&tier=premium&minPrice=1000&maxPrice=5000&inStock=true&page=1&limit=12`.

For public/anonymous visitors, the existing API intentionally limits `/api/all` to `quality` fabrics. A signed-in customer can see both tiers. Existing `/api/premium` still requires customer authentication.

### 3. Customer profile
- `GET /api/customer/profile` — read the authenticated customer's profile.
- `PATCH /api/customer/profile` — update `fullName`, `email`, and/or `phoneNumber` for the authenticated customer only.
- `PUT /api/customer/profile` — alias for profile update.
- Password and role cannot be changed through this endpoint. Passwords are never returned in profile responses.
- Send the access token as `Authorization: Bearer <accessToken>`.

### 4. Frontend website
A responsive fabric store with fabric cards, search/filter controls, pagination, registration, login, profile editing, and refresh-token handling. The backend serves it at `/store/` and `/` redirects there.

## Setup

Requirements: Node.js 20+ recommended, npm, and a MongoDB database (Atlas or local).

1. Extract the project ZIP and open a terminal in the `cloth-biz-api-main` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`. Put your real MongoDB connection string in `MONGODB_URI` and change `JWT_SECRET_KEY` to a unique random secret of at least 32 characters. Do not share or commit your `.env` file.
4. Start the server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3001` to use the website. API routes remain under `http://localhost:3001/api`.

The server will not start until required environment variables are configured and MongoDB is reachable.

## API examples

Register customer (`POST /api/customer/new`):
```json
{
  "fullName": "Ada Example",
  "email": "ada@example.com",
  "password": "example-password-123",
  "phoneNumber": "+2348012345678"
}
```

Login (`POST /api/customer/login`):
```json
{ "email": "ada@example.com", "password": "example-password-123" }
```

Refresh access token (`POST /api/customer/refresh`):
```json
{ "refreshToken": "the-refresh-token-returned-by-login" }
```

Logout (`POST /api/customer/logout`):
```json
{ "refreshToken": "the-current-refresh-token" }
```

Profile requests require `Authorization: Bearer <accessToken>`. Example update body:
```json
{ "fullName": "Ada A. Example", "phoneNumber": "+2348012345678" }
```

## Notes
- Existing staff routes and fabric create/update/delete permissions are retained.
- Fabric search values are escaped before being used as regular expressions.
- The browser website calls the same API origin, so it does not require a separate frontend development server.
- If you deploy the frontend separately, configure the API URL and CORS allow-list for that deployment.
