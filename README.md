# 🏏 Brisbane Handewa Cricket Hub

**Softball Edition**

A modern, high-performance web application designed to manage, track, and broadcast softball cricket tournaments. It provides a complete end-to-end solution for cricket management—from registering teams and players to live scoring and dynamic real-time broadcast overlays for streaming.

Built entirely with Vue 3, Quasar, and Pinia, featuring a beautiful custom glassmorphism design and a live-rendering animated 2D canvas stadium background.

![Cricket Hub Banner](https://via.placeholder.com/1200x600/030b18/00d4ff?text=Brisbane+Handewa+Cricket+Hub)

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
  - Target chasing logic and automatic innings switching.

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

---

## 🛠️ Technology Stack

- **Framework:** [Vue.js 3](https://vuejs.org/) (Composition API)
- **UI Component Library:** [Quasar Framework](https://quasar.dev/)
- **State Management:** [Pinia](https://pinia.vuejs.org/) (with local storage persistence)
- **Styling:** Custom CSS / SCSS with advanced animations and gradients
- **Build Tool:** Vite / Quasar CLI
- **Hosting:** Firebase Hosting

---

## 🚀 Getting Started

### Prerequisites

You will need [Node.js](https://nodejs.org/) (v16+) and either `npm` or `yarn` installed.

### Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd Brisbane-Handewa-Cricket-Hub-Softball-Edition-
yarn install
# or
npm install
```

### Development Server

Start the app in development mode (with hot-code reloading, error reporting, etc.):

```bash
quasar dev
# or
yarn dev
```

The app will typically be available at `http://localhost:9000`.

### Building for Production

Build the app for production deployment:

```bash
quasar build
```

This generates a highly optimized Single Page Application (SPA) inside the `dist/spa` folder, ready to be hosted anywhere.

---

## 📺 Setting up the OBS Broadcast Overlay

1. Run the app or host it online.
2. Open **OBS Studio** (or vmix).
3. Add a new **Browser Source**.
4. Set the URL to `http://<your-ip-or-domain>/#/broadcast-overlay`.
5. Set Width to `1920` and Height to `1080` (or your stream resolution).
6. Enable "Transparent Background" if available, or use a Chroma Key filter on the fallback background `#00ff00` / `#050d1a`.
7. As you score the game via the Admin panel on another device, the overlay will update instantly.

---

## 👨‍💻 Creator & Maintainer

**Built and Designed by:**

### GN Sanjana

_© 2026 GNS CRIC - All Rights Reserved_
