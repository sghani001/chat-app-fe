<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0E27,50:0D9488,100:2563EB&height=200&section=header&text=Nuro&fontSize=48&fontColor=ffffff&fontAlignY=38&desc=Real-Time%20Chat%20Client%20%C2%B7%20React%20%2B%20Vite&descSize=18&descAlignY=58&descColor=99F6E4" width="100%" />

<br/>

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![ActionCable](https://img.shields.io/badge/ActionCable-WebSocket-CC0000?style=for-the-badge&logo=ruby-on-rails&logoColor=white)](https://guides.rubyonrails.org/action_cable_overview.html)
[![Lint](https://img.shields.io/badge/Oxlint-Enabled-FFA500?style=for-the-badge&logo=eslint&logoColor=white)](https://oxc.rs/)

<br/>

> *A single-page React client for the Nuro chat API — channels, private DMs, and live notifications over a native ActionCable WebSocket, zero UI framework dependencies.*

</div>

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **UI Framework** | `React 19` | Component tree & state |
| **Build Tool** | `Vite 8` | Dev server, HMR, production bundling |
| **Real-time Client** | `@rails/actioncable` | Native ActionCable WebSocket consumer |
| **WebSocket Helper** | `react-use-websocket` | Connection lifecycle utilities |
| **Linting** | `Oxlint` | Fast Rust-based lint pass |
| **API Layer** | Hand-rolled `fetch` wrapper (`src/lib/api.js`) | Bearer-token auth on every request |

---

## ✨ Key Features

### 🔐 Token-Based Auth, No Backend Sessions
`src/hooks/useAuth.js` stores the API's opaque token in `localStorage`
(`chat_token`); `src/lib/api.js` attaches it as `Authorization: Bearer <token>`
on every call and redirects to `/auth` automatically on a `401`.

### 💬 Channels & Private DMs, Shared Rendering
`ChannelView` and `DMView` both delegate to the same `MessageList` /
`MessageInput` components — one polymorphic message shape on the backend,
one rendering path on the client.

### 📡 Live Updates Over a Native WebSocket
`src/hooks/useCable.js` opens a single ActionCable consumer per session
(`ws(s)://<host>/cable?token=<token>`) and exposes a `subscribe(identifier, onMessage)`
primitive — components subscribe to a room (`channel_<id>` / `dm_<id>`)
and receive pushed messages with no polling.

### 🔔 Live Notification Badge
`NotificationBell` reflects unread counts pushed over the same WebSocket
connection the moment the API's background jobs create a notification.

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** 18+
* The Nuro Rails API running locally — see `../chat_app/README.md`

### Setup

```bash
npm install
```

### Execution

```bash
npm run dev
```

*Opens on `http://localhost:5173` (Vite's default — check the terminal if
that port is taken). API calls and the `/cable` WebSocket are proxied to
the Rails server through `vite.config.js`, so no `.env` is needed for
local dev.*

> ⚠️ **Proxy targets are hardcoded.** `vite.config.js` points every
> `/auth`, `/channels`, `/direct_conversations`, `/users`, `/notifications`,
> and `/cable` route at a fixed `http://localhost:<port>`. If you run the
> API on a different port, update **all** of those `target` values to match.

### Linting

```bash
npm run lint
```

---

## 📂 Project Structure

```
src/
  pages/
    AuthPage.jsx           # Login / Register
    ChatApp.jsx              # Protected app shell
  components/
    Sidebar.jsx                # Channels list + DM list + user avatar
    ChannelView.jsx            # Group channel messages
    DMView.jsx                   # Private DM messages
    MessageList.jsx             # Shared messages renderer
    MessageInput.jsx            # Shared input + send button
    NotificationBell.jsx        # Badge + dropdown notification feed
    UserSearchModal.jsx         # Find users to DM
    WelcomeScreen.jsx             # Empty-state placeholder
  hooks/
    useAuth.js                   # Login/register/logout, token management
    useCable.js                    # ActionCable WebSocket hook
  lib/
    api.js                         # fetch wrapper with Authorization header
  App.jsx                        # Router: /auth vs /app
```

---

## 📦 Production Build

```bash
npm run build
npm run preview   # sanity-check the dist/ build locally
```

Both `api.js` and `useCable.js` derive the API origin from
`window.location` (relative `fetch` paths and `wss://<host>/cable`
respectively) rather than an env-configured base URL. In production this
means the built frontend must be served from the **same origin** as the
Rails API (e.g. Rails serving `dist/` as static assets, or a reverse
proxy unifying both) — there's no dev-proxy equivalent outside of `vite dev`.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2563EB,50:0D9488,100:0A0E27&height=120&section=footer&fontSize=1" width="100%" />
