# Cipher Store – Frontend

Minimal React frontend for the Cipher Store password manager.

## Setup

```bash
npm install
```

## Run

Start the backend first (from repo root: `cd backend && npm run dev`). Then:

```bash
npm run dev
```

The app runs at `http://localhost:5173` and proxies API requests to `http://localhost:3000` so auth cookies work in development.

## Build

```bash
npm run build
```

For production, set `VITE_API_URL` to your API base URL (e.g. `https://api.example.com`) if it is not served under the same origin.
