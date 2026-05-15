# ADNU Athletics Management Hub

ADNU Athletics Management Hub is a React + Vite frontend for university athletics operations. The app now uses clean browser routing with a public landing page, public auth pages, a protected dashboard shell, and dedicated module detail routes.

## Routes

- Public
  - `/`
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/reset-password`
  - `/verification-success`
- Protected
  - `/dashboard`
  - `/athletes`
  - `/athletes/:athleteId`
  - `/coaches`
  - `/coaches/:coachId`
  - `/events`
  - `/events/:eventId`
  - `/inventory`
  - `/inventory/:itemId`
  - `/facilities`
  - `/facilities/:facilityId`
  - `/facilities/reservations/:reservationId`
  - `/reports`
  - `/settings`
- Utility
  - `/unauthorized`
  - `/not-found`

## Auth behavior

Until backend authentication is wired, the app uses a lightweight frontend-only session stored in `localStorage`. Logging in creates the mock session, protected routes redirect unauthenticated users to `/login`, and logout clears the session.

## Local development

```bash
npm install
npm run dev
```

Vite already handles SPA fallback in local development, so refreshing a route like `/athletes/ATH-001` or `/facilities/reservations/RSV-100` should continue to work.

## Production SPA rewrites

Browser routing needs a rewrite rule in production so deep links resolve to `index.html`.

### Vercel

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Netlify

```txt
/* /index.html 200
```

### Render or other static hosts

Configure all non-asset requests to serve `index.html`.
