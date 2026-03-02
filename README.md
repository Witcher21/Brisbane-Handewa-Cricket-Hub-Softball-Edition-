# 🏏 Brisbane Handewa Cricket Hub

**Softball Edition**

A modern, high-performance web application designed to manage, track, and broadcast softball cricket tournaments. It provides a complete end-to-end solution for cricket management—from registering teams and players to live scoring and dynamic real-time broadcast overlays for streaming.

Built entirely with Vue 3, Quasar, and Pinia, featuring a beautiful custom glassmorphism design and a live-rendering animated 2D canvas stadium background.

---

## 🌐 Live Application

<table>
  <tr>
    <td>🚀 <strong>Frontend (PWA)</strong></td>
    <td><a href="https://brisbane-handewa-cricket-hub.web.app"><strong>https://brisbane-handewa-cricket-hub.web.app</strong></a></td>
  </tr>
  <tr>
    <td>⚡ <strong>Backend API</strong></td>
    <td><a href="https://brisbane-handewa-cricket-api.onrender.com"><strong>https://brisbane-handewa-cricket-api.onrender.com</strong></a></td>
  </tr>
</table>

> 📱 **Install as App:** Open the link above in Chrome/Edge → Click the install icon (📥) in the address bar → Use it like a native app on Desktop & Mobile!

---

## ✨ Key Features

- **🏆 Full Tournament Management**
  - Create and manage Teams (custom colors, short names, venues).
  - Register Players with detailed roles, jersey numbers, and bowling/batting styles.
  - Automatically enforce squad limits (max 15 players per team) and assign captains.

- **📡 Live Scorer & Match Center**
  - Intuitive, button-driven scorer interface perfectly tailored for fast-paced softball cricket.
  - Granular ball-by-ball tracking (runs, wides, no-balls, byes, leg-byes, and detailed wicket dismissals).
  - Real-time updates to team standings and player statistics (runs, wickets, strike rates, economy).
  - **Auto match endings** — target chase (win by wickets), overs complete (win by runs), and tie detection.
  - Full scorecard display for both innings after match completion.

- **🎛️ Real-Time Broadcast Overlay (OBS Integration)**
  - Dedicated `/broadcast-overlay` route designed strictly as a green-screen source for OBS/vMix live streaming.
  - Automatically syncs with the live scorer via the Pinia store.
  - Features beautiful, dynamic on-screen graphics including:
    - Main Score Bug (Runs/Wickets, Overs, Run Rate)
    - Active Batsmen & Bowler stats
    - "Recent Balls" timeline display
    - Animated Toast Notifications for major events (Wickets, Sixes, Fours)

- **🎨 Premium Visual Experience**
  - Gorgeous animated 2D Canvas background running at 60fps—featuring a procedural cricket pitch, moving floodlights, atmospheric crowd lights, and an actively animating bowler/batsman stick-figure sequence.
  - Advanced glassmorphism UI components, fluid animations, and custom scrollbars.
  - Built-in dynamic notification stacking system.
  - Fully responsive design — Desktop, Tablet, and Mobile.

- **📱 Progressive Web App (PWA)**
  - Installable on Desktop and Mobile as a native-like app.
  - Offline-capable with Service Worker caching.
  - Home screen shortcuts for Live Match, Players, and Teams.

---

## 🛠️ Technology Stack

| Layer                | Technology                                                   |
| -------------------- | ------------------------------------------------------------ |
| **Framework**        | [Vue.js 3](https://vuejs.org/) (Composition API)             |
| **UI Library**       | [Quasar Framework](https://quasar.dev/)                      |
| **State Management** | [Pinia](https://pinia.vuejs.org/) + LocalStorage Persistence |
| **Backend**          | [FastAPI](https://fastapi.tiangolo.com/) (Python) + JWT Auth |
| **Database**         | Firebase Firestore (Real-time sync)                          |
| **Frontend Hosting** | Firebase Hosting (PWA)                                       |
| **Backend Hosting**  | Render.com (Free Tier)                                       |
| **Styling**          | Custom CSS / SCSS with glassmorphism & animations            |
| **Build Tool**       | Vite / Quasar CLI                                            |

---

## 🚀 Getting Started

### Prerequisites

You will need [Node.js](https://nodejs.org/) (v20+) and either `npm` or `yarn` installed.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Witcher21/Brisbane-Handewa-Cricket-Hub-Softball-Edition-.git
cd Brisbane-Handewa-Cricket-Hub-Softball-Edition-
npm install
```

### Development Server

Start the app in development mode (with hot-code reloading, error reporting, etc.):

```bash
npx quasar dev
```

The app will be available at `http://localhost:9000`.

### Building for Production (PWA)

```bash
npx quasar build -m pwa
```

This generates an optimized PWA inside the `dist/pwa` folder.

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📺 Setting up the OBS Broadcast Overlay

1. Run the app or host it online.
2. Open **OBS Studio** (or vMix).
3. Add a new **Browser Source**.
4. Set the URL to `https://brisbane-handewa-cricket-hub.web.app/#/broadcast-overlay`.
5. Set Width to `1920` and Height to `1080` (or your stream resolution).
6. Enable "Transparent Background" if available, or use a Chroma Key filter on the fallback background.
7. As you score the game via the Admin panel on another device, the overlay will update instantly.

---

## 📁 Project Structure

```
├── src/
│   ├── boot/          # Axios config, Pinia setup
│   ├── components/    # Reusable Vue components
│   ├── layouts/       # Main app layout (responsive header/footer)
│   ├── pages/         # Route pages (Home, Matches, Players, Teams, Admin)
│   ├── stores/        # Pinia stores (cricket-store, liveStore)
│   ├── services/      # Firebase config
│   └── router/        # Vue Router setup
├── backend/
│   ├── main.py        # FastAPI app entry point
│   ├── api/           # Auth & user data routes
│   ├── core/          # Security & database helpers
│   └── Dockerfile     # Container config for Cloud Run
├── src-pwa/           # PWA manifest & service worker
├── firebase.json      # Firebase Hosting config
└── quasar.config.js   # Quasar build configuration
```

---

## 👨‍💻 Creator & Maintainer

**Built and Designed by:**

### GN Sanjana

_© 2026 GNS CRIC - All Rights Reserved_
