# Chat App — Frontend (React + Vite)

React (Vite) client for the Nuro chat app: login/register, channels,
direct messages, and live notifications over ActionCable.

## Stack

- React 19 + Vite 8
- `@rails/actioncable` / `react-use-websocket` for the WebSocket connection
- Oxlint for linting

## Prerequisites

- Node.js (18+ recommended)
- The Rails API running locally (see `../chat_app/README.md`)

## Setup

```bash
npm install
```

## Running

```bash
npm run dev
```

Opens on `http://localhost:5173` (Vite's default; check the terminal output
if that port is taken). API and WebSocket calls are proxied to the Rails
server via `vite.config.js` — no `.env` needed for local dev.

**Important:** the dev proxy targets are hardcoded to a specific Rails
port (see the `server.proxy` block in `vite.config.js`). If you run the
API on a different port, update every `target: 'http://localhost:<port>'`
entry in that file to match.

## Project structure

```
src/
  pages/
    AuthPage.jsx          # Login / Register
    ChatApp.jsx            # Protected app shell
  components/
    Sidebar.jsx             # Channels list + DM list + user avatar
    ChannelView.jsx         # Group channel messages
    DMView.jsx               # Private DM messages
    MessageList.jsx         # Shared messages renderer
    MessageInput.jsx        # Shared input + send button
    NotificationBell.jsx    # Badge + dropdown notification feed
    UserSearchModal.jsx     # Find users to DM
    WelcomeScreen.jsx        # Empty-state placeholder
  hooks/
    useAuth.js               # Login/register/logout, token management
    useCable.js               # ActionCable WebSocket hook
  lib/
    api.js                    # fetch wrapper with Authorization header
  App.jsx                    # Router: /auth vs /app
```

## Auth flow

Token is stored in `localStorage` (`chat_token`) and attached as
`Authorization: Bearer <token>` on every API call. The WebSocket connects
as `ws://localhost:<api-port>/cable?token=<token>` (via the dev proxy in
local dev, so the app itself just points at `/cable`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Production build

```bash
npm run build
```

Outputs static assets to `dist/`. Since there's no dev proxy in
production, point the API base URL at the deployed Rails host (the code
in `src/lib/api.js` / `src/hooks/useCable.js` is where that's configured).
