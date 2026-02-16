# Cipher Store – Frontend

Minimal React frontend for the Cipher Store password manager.

## Setup

```bash
npm install
```

## Run (local)

Start the backend first (from repo root: `cd backend && npm run dev`). Then:

```bash
npm run dev
```

The app runs at `http://localhost:5173` and proxies API requests to `http://localhost:3000` so auth works in development.

## Build & deploy

For production (e.g. Vercel, Netlify):

1. **Set the backend URL at build time:**

   ```bash
   VITE_API_URL=https://your-backend-url.com npm run build
   ```

   Replace `https://your-backend-url.com` with your deployed backend URL (no trailing slash). The frontend will send all API requests to this base URL.

2. **Backend env:** On the backend, set `CORS_ORIGIN` to your frontend URL (e.g. `https://your-app.vercel.app`) so the browser allows requests. Use a comma-separated list for multiple origins.

3. **Backend:** Ensure `NODE_ENV=production` so cookies use `SameSite=None` for cross-origin auth. HTTPS is required in production.

Auth works when deployed by sending tokens in the request (Bearer token and refresh token in body); cookies are still used when same-origin.
