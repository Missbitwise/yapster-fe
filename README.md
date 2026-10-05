# Yapster Frontend

A real-time one-to-one messaging and nearby friends discovery frontend application for **Yapster**, built with Next.js 14, TypeScript, Tailwind CSS, Axios, and native WebSockets.

---

## Features

### 1. Theme & Design Language
- **Dark Modern Obsidian UI**: Deep slate/obsidian palette (`#0d0e15`, `#141522`, `#1a1b2a`) with borders and card elevations matching the design reference.
- **Vibrant Purple / Violet Accents**: Neon brand purple accents (`#8a3ffc`, `#9333ea`) used for sent message bubbles, active badges, unread notification counters, and primary action buttons.
- **Top Rail**: Horizontal "Currently Active" status avatars with colorful halos and glowing online indicators.
- **Responsive Layout**: Dual/triple pane layout on desktop and fluid responsive screens with back navigation on mobile devices.

### 2. Authentication & Persistence
- Register (`/register`) with name, username, email, and password.
- Login (`/login`) with email and password.
- Session persistence via JWT token with auto-restore on refresh.
- Automatic `Authorization: Bearer <token>` attachment on API requests.
- Automatic redirection for protected routes and logout handling.

### 3. Real-Time WebSocket Communication (Native WebSockets)
- Connects to `ws://localhost:8080?token=<token>` without Socket.IO.
- Centralized `WebSocketContext` with automatic exponential backoff reconnection.
- Supported and handled events:
  - `connection`
  - `unread_count` (syncs server-side unread message counts)
  - `presence` (real-time online / offline / last seen updates)
  - `typing` & `stopped_typing` (real-time typing indicator with 1.5s debouncing)
  - `message` (instant bi-directional messaging with delivered status)
  - `message_read` (instant read receipts `✓✓` in cyan)
  - `message_edited` (in-place message update with `(edited)` tag)
  - `message_deleted_for_me` (removes message for current user)
  - `message_deleted_for_everyone` (removes message for both participants)
  - `error` (toast notifications)

### 4. Chat Interface & Cursor Pagination
- Cursor-based message history pagination: automatically fetches older messages when scrolling to top without duplicating messages or losing scroll position.
- Sent message bubble status ticks (`✓` sent, `✓✓` delivered, `✓✓` read).
- Message editing modal (honoring backend 5-minute window limit).
- Message deletion options (Delete for me & Delete for everyone).
- Pill message input with attachment icon and send button.

### 5. Location-Based Nearby Friends Discovery (Radar)
- Real-time GPS location detection using browser `navigator.geolocation` or manual coordinate input.
- Updates coordinates and locality via `PUT /api/location`.
- Queries nearby users within custom radius (1 km to 100 km) via `GET /api/location/nearby?radius=...`.
- Calculates and renders geographical distance in kilometers (e.g. `1.2 km away`).
- Quick actions: "Add Friend" (sends friend request) or "Chat" (if already friends).

### 6. Friends, Requests & Blocking
- **Friends Directory**: View all friends with online presence and direct messaging.
- **Friend Requests**: Real-time incoming friend requests modal with Accept/Reject actions.
- **Blocking**: Block contacts with immediate message prevention and unblock manager.

---

## Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- Backend running at `http://localhost:8080`

### 2. Environment Configuration
Create or inspect `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### 3. Run Development Server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
pnpm build
pnpm start
```
