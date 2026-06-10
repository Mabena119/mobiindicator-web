# MobiIndicator Web App (iOS Add to Home Screen)

Expo web build of the MobiIndicator mobile app — installable on iPhone/iPad via **Safari → Share → Add to Home Screen**. Connects to **mobiindicator.com** for live MT4/MT5 charts.

## Features

- Email gate + subscription flow
- Save `MK-` license keys locally
- Live chart list with WebSocket updates
- Full-screen chart viewer (embedded chart app)
- Dark/light theme
- PWA manifest + iOS standalone meta tags

## Local development

```bash
npm install
npm run web
```

Open http://localhost:8081 (or the port Expo prints).

Optional overrides:

```bash
EXPO_PUBLIC_API_BASE=http://127.0.0.1:8765 npm run web
```

## Production build

```bash
npm ci
npm run build:web
```

Static output is in `dist/` — serve with any static host (SPA: rewrite all routes to `index.html`).

## Deploy on Render

### Option A — Static Site (recommended)

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
2. Connect **Mabena119/mobiindicator-web**
3. Render applies `render.yaml` automatically (`runtime: static`, publish `dist/`)

### Option B — Web Service

If you already created a **Web Service**, set in the Render dashboard:

| Setting | Value |
|---------|--------|
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |

Do **not** use `node expo-router/entry` — that is the native app entry, not the web export.

`npm start` runs `serve dist` (SPA mode) on `$PORT`.

### Environment (optional)

| Variable | Default |
|----------|---------|
| `EXPO_PUBLIC_API_BASE` | `https://mobiindicator.com/live-api` |
| `EXPO_PUBLIC_CHART_BASE` | `https://mobiindicator.com/chart` |

## iOS install instructions (for users)

1. Open the Render URL in **Safari** (not Chrome).
2. Tap **Share** → **Add to Home Screen**.
3. Launch MobiIndicator from the home screen icon.

## Native iOS (App Store)

For TestFlight / App Store builds, use the same codebase with EAS:

```bash
npm i -g eas-cli
eas build --platform ios --profile production
```

Bundle ID: `com.mobiindicator.app`

## Architecture

- **MT4/MT5 EA** — posts chart JSON to `https://mobiindicator.com/live-api/data`
- **Python API** — mobiindicator.com
- **This web app** — React Native Web + Expo Router
