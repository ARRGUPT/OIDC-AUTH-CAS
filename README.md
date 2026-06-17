# OIDC Auth CAS

An Express + MongoDB authentication service that supports both traditional user auth and OpenID Connect flows. The app exposes local auth endpoints for registration, login, password reset, avatars, and session handling, plus OIDC discovery, authorization, token, userinfo, JWKS, revocation, and introspection endpoints.

## Features

- User registration, login, logout, and refresh-token flow
- Email verification and password reset support
- Profile access through an authenticated `me` endpoint
- Avatar upload with file validation
- OIDC provider endpoints with authorization code and refresh token support
- JWKS publishing with RSA signing keys
- MongoDB-backed session storage

## Prerequisites

- Node.js 18+ recommended
- MongoDB 8 or compatible
- OpenSSL for key generation
- Docker and Docker Compose if you want to run MongoDB locally

## Setup

1. Install dependencies.

```bash
npm install
```

2. Start MongoDB.

```bash
npm run db:up
```

3. Generate the signing keys used by the OIDC token utilities.

```bash
bash key-gen.sh
```

This creates `cert/private-key.pem` and `cert/public-key.pub`.

4. Create a `.env` file in the project root and set the required variables.

## Environment Variables

The code expects the following environment variables:

| Variable                 | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `PORT`                   | HTTP port for the app                             |
| `NODE_ENV`               | Runtime mode used for cookie security             |
| `MONGODB_URI`            | MongoDB connection string                         |
| `SESSION_SECRET`         | Express session secret                            |
| `JWT_ACCESS_SECRET`      | Secret for access-token signing and verification  |
| `JWT_REFRESH_SECRET`     | Secret for refresh-token signing and verification |
| `JWT_ACCESS_EXPIRES_IN`  | Access-token lifetime, default `15m`              |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime, default `7d`              |
| `OIDC_ISSUER`            | Optional issuer URL for OIDC metadata and tokens  |
| `CLIENT_URL`             | Frontend/client base URL used in email links      |
| `SMTP_HOST`              | SMTP server host                                  |
| `SMTP_PORT`              | SMTP server port                                  |
| `SMTP_USER`              | SMTP username                                     |
| `SMTP_PASS`              | SMTP password                                     |
| `SMTP_FROM_NAME`         | Display name for outgoing mail                    |
| `SMTP_FROM_EMAIL`        | From address for outgoing mail                    |
| `IMAGEKIT_PUBLIC_KEY`    | ImageKit public key                               |
| `IMAGEKIT_PRIVATE_KEY`   | ImageKit private key                              |
| `IMAGEKIT_URL_ENDPOINT`  | ImageKit endpoint URL                             |

Example `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=YOUR_MONGODB_URI
SESSION_SECRET=replace_me
JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me
CLIENT_URL=http://localhost:3000
OIDC_ISSUER=http://localhost:5000
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=OIDC Auth CAS
SMTP_FROM_EMAIL=no-reply@example.com
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

## Run

Start the app in development mode:

```bash
npm run dev
```

Start the app in production mode:

```bash
npm start
```

Stop the local MongoDB container:

```bash
npm run db:down
```

## API Overview

### Auth Routes

Base path: `/api/auth`

- `POST /register`
- `GET /verify-email/:token`
- `POST /forgot-password`
- `PUT /reset-password/:token`

### OIDC Routes

Base path: `/`

- `GET /.well-known/openid-configuration`
- `GET /.well-known/jwks.json`
- `POST /o/login`
- `POST /o/logout`
- `GET /o/authorize`
- `POST /o/token`
- `POST /o/revoke`
- `POST /o/introspect`
- `GET /o/userinfo`

## Project Structure

```text
src/
  app.js                      Express app setup
  common/                     Shared config, middleware, and utilities
  modules/auth/               User auth module
  modules/oidc/               OIDC provider module
public/                       Static auth pages and uploads
cert/                         RSA signing keys
scripts/seed-client.js        Helper for OIDC client seeding
```

## Notes

- The app reads the RSA keys from `cert/private-key.pem` and `cert/public-key.pub` at startup.
- Uploaded avatars are stored under `public/uploads`.
- MongoDB sessions are stored in the `session` collection.
