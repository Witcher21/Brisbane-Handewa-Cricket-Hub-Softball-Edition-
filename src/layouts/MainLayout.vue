<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <!-- ═══ GLOBAL ANIMATED BACKGROUND ═══════════════════════════ -->
    <div class="bg-scene" aria-hidden="true">
      <!-- Aurora mesh gradient -->
      <div class="bg-aurora"></div>
      <!-- Grid overlay -->
      <div class="bg-grid"></div>
      <!-- Floating cricket balls -->
      <div v-for="n in 8" :key="n" class="bg-ball" :class="`ball-${n}`"></div>
      <!-- Scan line glow -->
      <div class="bg-scanline"></div>
    </div>

    <!-- ═══ GLOBAL TOAST NOTIFICATIONS ══════════════════════════= -->
    <teleport to="body">
      <div class="toast-stack">
        <transition-group name="toast">
          <div
            v-for="n in store.notifications.slice(0, 3)"
            :key="n.id"
            class="toast-item"
            :class="`toast-${n.type}`"
            @click="store.dismissNotification(n.id)"
          >
            <span class="toast-icon">{{ toastIcon(n.type) }}</span>
            <div class="toast-body">
              <span class="toast-text">{{ n.text }}</span>
            </div>
          </div>
        </transition-group>
      </div>
    </teleport>

    <!-- ═══ HEADER ════════════════════════════════════════════════ -->
    <q-header class="layout-header" elevated>
      <q-toolbar class="toolbar-inner">
        <router-link to="/" class="brand-logo">
          <div class="brand-icon">🏏</div>
          <div class="brand-text">
            <span class="brand-name">Brisbane Handewa</span>
            <span class="brand-sub brand-sub-hide">Cricket Hub · Softball Edition</span>
          </div>
        </router-link>

        <q-space />

        <!-- Desktop nav — hidden below 1024px -->
        <div class="desktop-nav">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            active-class="nav-active"
          >
            <q-icon :name="link.icon" size="15px" />
            {{ link.label }}
          </router-link>
          <router-link v-if="liveMatch" :to="`/matches/${liveMatch.id}`" class="live-badge-btn">
            <span class="live-dot" />LIVE
          </router-link>

          <!-- User Profile & Logout -->
          <div v-if="auth.isLoggedIn" class="user-profile q-ml-md flex flex-center">
            <q-btn flat no-caps dense class="text-white text-weight-bold row items-center">
              <q-avatar size="28px" class="q-mr-xs bg-primary text-white">
                {{ auth.username?.charAt(0).toUpperCase() }}
              </q-avatar>
              <span class="user-name-text">{{ auth.username }}</span>
              <q-menu transition-show="scale" transition-hide="scale" class="bg-dark text-white">
                <q-list style="min-width: 150px">
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ auth.username }}</q-item-label>
                      <q-item-label caption class="text-grey-5">Member</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator dark />
                  <q-item clickable v-close-popup @click="doLogout">
                    <q-item-section avatar
                      ><q-icon name="logout" color="negative"
                    /></q-item-section>
                    <q-item-section class="text-negative text-weight-bold">Logout</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>

        <!-- Mobile hamburger button — visible below 1024px -->
        <div class="mobile-header-right">
          <q-btn
            v-if="auth.isLoggedIn"
            flat
            round
            dense
            class="mobile-user-btn"
            @click="mobileOpen = !mobileOpen"
          >
            <q-avatar
              size="30px"
              class="bg-primary text-white"
              style="font-size: 13px; font-weight: 800"
            >
              {{ auth.username?.charAt(0).toUpperCase() }}
            </q-avatar>
          </q-btn>
          <q-btn
            flat
            round
            dense
            :icon="mobileOpen ? 'close' : 'menu'"
            class="hamburger-btn"
            color="white"
            @click="mobileOpen = !mobileOpen"
          />
        </div>
      </q-toolbar>

      <div v-if="mobileOpen" class="mobile-nav">
        <!-- User info in mobile nav -->
        <div
          v-if="auth.isLoggedIn"
          class="mobile-user-card text-center q-pa-md q-mb-sm bg-glass rounded-borders-12"
        >
          <q-avatar size="42px" class="q-mb-sm bg-primary text-white shadow-3">
            {{ auth.username?.charAt(0).toUpperCase() }}
          </q-avatar>
          <div class="text-weight-bold text-white text-subtitle1">{{ auth.username }}</div>
          <div class="text-caption text-primary text-uppercase">{{ auth.user?.role }}</div>
        </div>

        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="mobile-nav-link"
          @click="mobileOpen = false"
        >
          <q-icon :name="link.icon" size="18px" />{{ link.label }}
        </router-link>
        <router-link
          v-if="liveMatch"
          :to="`/matches/${liveMatch.id}`"
          class="mobile-live-btn"
          @click="mobileOpen = false"
        >
          <span class="live-dot" />LIVE MATCH
        </router-link>

        <q-btn
          v-if="auth.isLoggedIn"
          outline
          color="negative"
          label="Logout"
          icon="logout"
          class="full-width q-mt-md rounded-borders text-weight-bold"
          @click="doLogout"
        />
      </div>
    </q-header>

    <!-- ═══ PAGE CONTENT ══════════════════════════════════════════ -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- ═══ FOOTER ════════════════════════════════════════════════ -->
    <q-footer class="layout-footer">
      <div class="footer-inner">
        <div class="footer-brand">🏏 Brisbane Handewa Cricket Hub · Softball Edition</div>
        <div class="footer-links">
          <a href="/broadcast-overlay" target="_blank" class="footer-link">📺 OBS Overlay</a>
          <span class="footer-sep">·</span>
          <span class="footer-credit">Built by <strong>GN Sanjana</strong></span>
          <span class="footer-sep">·</span>
          <span>© 2026 GNS CRIC</span>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCricketStore } from 'stores/cricket-store'
import { useAuthStore } from 'stores/authStore'

const store = useCricketStore()
const auth = useAuthStore()
const liveMatch = computed(() => store.liveMatch)
const mobileOpen = ref(false)

async function doLogout() {
  await auth.logout()
  window.location.replace('/login')
}

const navLinks = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Matches', path: '/matches', icon: 'sports_cricket' },
  { label: 'Players', path: '/players', icon: 'groups' },
  { label: 'Teams', path: '/teams', icon: 'emoji_events' },
  { label: 'Manage', path: '/manage', icon: 'manage_accounts' },
  { label: 'Admin', path: '/admin', icon: 'admin_panel_settings' },
  { label: 'Media', path: '/media', icon: 'play_circle' },
]

function toastIcon(type) {
  return (
    {
      wicket: '🔴',
      six: '💥',
      four: '🏏',
      live: '🏆',
      error: '🗑️',
      info: '✅',
      normal: '💬',
    }[type] || '✅'
  )
}
</script>

<style scoped>
/* ── Base layout ──────────────────────────────── */
.main-layout {
  background: #020b1a;
  min-height: 100vh;
  position: relative;
}

/* ── Premium 2026 Animated Background ────────── */
.bg-scene {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Aurora gradient mesh */
.bg-aurora {
  position: absolute;
  inset: -50%;
  background:
    radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0, 80, 255, 0.18) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 80%, rgba(0, 200, 120, 0.1) 0%, transparent 60%),
    radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0, 30, 80, 0.4) 0%, transparent 70%),
    radial-gradient(ellipse 90% 70% at 10% 90%, rgba(0, 150, 255, 0.08) 0%, transparent 50%);
  animation: auroraShift 18s ease-in-out infinite alternate;
}
@keyframes auroraShift {
  0% {
    transform: translate(0%, 0%) scale(1);
  }
  33% {
    transform: translate(3%, -4%) scale(1.05);
  }
  66% {
    transform: translate(-3%, 3%) scale(0.97);
  }
  100% {
    transform: translate(2%, -2%) scale(1.03);
  }
}

/* Grid overlay */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 150, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 150, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridSlide 40s linear infinite;
}
@keyframes gridSlide {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(60px);
  }
}

/* Scan line */
.bg-scanline {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.04) 3px,
    rgba(0, 0, 0, 0.04) 4px
  );
  pointer-events: none;
}

/* Floating cricket balls */
.bg-ball {
  position: absolute;
  border-radius: 50%;
  animation: floatBall linear infinite;
}
.bg-ball::after {
  content: '';
  position: absolute;
  inset: -100%;
  border-radius: 50%;
  background: inherit;
  filter: blur(20px);
  opacity: 0.4;
}
.ball-1 {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 35% 35%, #ff8888, #aa1111);
  top: 15%;
  left: 8%;
  animation-duration: 22s;
  animation-delay: 0s;
}
.ball-2 {
  width: 10px;
  height: 10px;
  background: radial-gradient(circle at 35% 35%, #ff7777, #991111);
  top: 55%;
  left: 85%;
  animation-duration: 28s;
  animation-delay: -6s;
}
.ball-3 {
  width: 18px;
  height: 18px;
  background: radial-gradient(circle at 35% 35%, #ff9999, #bb2222);
  top: 75%;
  left: 20%;
  animation-duration: 32s;
  animation-delay: -11s;
}
.ball-4 {
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at 35% 35%, #ffaaaa, #cc3333);
  top: 30%;
  left: 60%;
  animation-duration: 19s;
  animation-delay: -4s;
}
.ball-5 {
  width: 16px;
  height: 16px;
  background: radial-gradient(circle at 35% 35%, #ff6666, #880000);
  top: 65%;
  left: 50%;
  animation-duration: 26s;
  animation-delay: -9s;
}
.ball-6 {
  width: 12px;
  height: 12px;
  background: radial-gradient(circle at 35% 35%, #ff8888, #aa1111);
  top: 10%;
  left: 70%;
  animation-duration: 35s;
  animation-delay: -15s;
}
.ball-7 {
  width: 9px;
  height: 9px;
  background: radial-gradient(circle at 35% 35%, #ffbbbb, #dd4444);
  top: 85%;
  left: 40%;
  animation-duration: 24s;
  animation-delay: -2s;
}
.ball-8 {
  width: 13px;
  height: 13px;
  background: radial-gradient(circle at 35% 35%, #ff7777, #991111);
  top: 45%;
  left: 5%;
  animation-duration: 30s;
  animation-delay: -18s;
}
@keyframes floatBall {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(120px, -80px) rotate(90deg);
  }
  50% {
    transform: translate(60px, -180px) rotate(180deg);
  }
  75% {
    transform: translate(-60px, -100px) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

/* ── Toast notifications ──────────────────────── */
.toast-stack {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 99999;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  pointer-events: none;
  max-width: 400px;
  width: calc(100vw - 48px);
}
.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  background: rgba(8, 18, 36, 0.95);
  border-left: 4px solid;
  pointer-events: auto;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.2s;
  animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-item:hover {
  opacity: 0.85;
  transform: scale(0.98);
}
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(60px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
.toast-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}
.toast-text {
  line-height: 1.4;
  font-size: 13px;
}
.toast-info {
  border-color: #22c55e;
}
.toast-error {
  border-color: #ff3d57;
  background: rgba(40, 8, 16, 0.95);
}
.toast-live {
  border-color: #ffd700;
  background: rgba(30, 24, 8, 0.95);
  box-shadow:
    0 0 0 1px rgba(255, 215, 0, 0.15),
    0 12px 40px rgba(0, 0, 0, 0.5);
}
.toast-wicket {
  border-color: #ff3d57;
  background: rgba(30, 8, 12, 0.95);
}
.toast-six {
  border-color: #a855f7;
  background: rgba(20, 8, 36, 0.95);
}
.toast-four {
  border-color: #00d4ff;
  background: rgba(2, 18, 36, 0.95);
}
.toast-normal {
  border-color: rgba(255, 255, 255, 0.15);
}

/* Toast enter/leave animations */
.toast-enter-active {
  animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}
.toast-move {
  transition: transform 0.35s ease;
}

/* ── Header ───────────────────────────────────── */
.layout-header {
  background: rgba(3, 11, 24, 0.8) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 100;
}
.toolbar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
}

/* Brand */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.brand-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #00d4ff, #0066cc);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 0 22px rgba(0, 212, 255, 0.4);
  animation: brand-pulse 3s ease infinite;
}
@keyframes brand-pulse {
  0%,
  100% {
    box-shadow: 0 0 18px rgba(0, 212, 255, 0.35);
  }
  50% {
    box-shadow: 0 0 32px rgba(0, 212, 255, 0.6);
  }
}
.brand-name {
  display: block;
  font-size: 15px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.3px;
  line-height: 1.2;
  white-space: nowrap;
}
.brand-sub {
  display: block;
  font-size: 10px;
  color: #00d4ff;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* Desktop nav — hides on < 1024px */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}
/* Mobile hamburger area — hides on >= 1024px */
.mobile-header-right {
  display: none;
  align-items: center;
  gap: 4px;
}
.mobile-user-btn {
  opacity: 0.9;
}

.user-name-text {
  font-size: 13px;
  font-weight: 700;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
}
.nav-link:hover {
  background: rgba(0, 212, 255, 0.08);
  color: #00d4ff;
}
.nav-active {
  background: rgba(0, 212, 255, 0.12) !important;
  color: #00d4ff !important;
}
.live-badge-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 6px;
  padding: 7px 13px;
  background: linear-gradient(135deg, #ff3d57, #cc0030);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 900;
  color: white;
  text-decoration: none;
  letter-spacing: 1px;
  box-shadow: 0 0 20px rgba(255, 0, 64, 0.45);
  animation: pulsered 2s infinite;
}
.live-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: blink 1s infinite;
  flex-shrink: 0;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
@keyframes pulsered {
  0%,
  100% {
    box-shadow: 0 0 16px rgba(255, 0, 64, 0.45);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 0, 64, 0.75);
  }
}

/* Mobile nav */
.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 212, 255, 0.08);
  background: rgba(3, 11, 24, 0.97);
  backdrop-filter: blur(20px);
}
.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}
.mobile-nav-link:hover {
  background: rgba(0, 212, 255, 0.07);
  color: #00d4ff;
}
.mobile-live-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 20px;
  padding: 11px 16px;
  background: linear-gradient(135deg, #ff3d57, #cc0030);
  border-radius: 10px;
  color: white;
  font-weight: 800;
  font-size: 13px;
  text-decoration: none;
  letter-spacing: 1px;
}

/* Footer */
.layout-footer {
  background: rgba(3, 11, 24, 0.92) !important;
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 212, 255, 0.08);
  padding: 10px 0;
  position: relative;
  z-index: 10;
}
.footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}
.footer-brand {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}
.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  flex-wrap: wrap;
}
.footer-link {
  color: #00d4ff;
  text-decoration: none;
  font-weight: 600;
}
.footer-sep {
  opacity: 0.3;
}
.footer-credit {
  color: rgba(255, 255, 255, 0.45);
}
.footer-credit strong {
  color: #00d4ff;
  font-weight: 700;
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Global z-index */
:global(.q-page-container) {
  position: relative;
  z-index: 1;
}
:global(.q-header) {
  z-index: 100 !important;
}
:global(.q-footer) {
  z-index: 10 !important;
}

/* ═══════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   ═══════════════════════════════════════════════ */

/* Tablet: 768px - 1023px */
@media (max-width: 1023px) {
  .desktop-nav {
    display: none !important;
  }
  .mobile-header-right {
    display: flex !important;
  }
  .toolbar-inner {
    padding: 0 16px;
    height: 58px;
  }
  .brand-icon {
    width: 36px;
    height: 36px;
    font-size: 17px;
  }
}

/* Mobile: < 640px */
@media (max-width: 640px) {
  .brand-sub-hide {
    display: none !important;
  }
  .toolbar-inner {
    padding: 0 12px;
    height: 54px;
  }
  .brand-name {
    font-size: 14px;
  }
  .brand-logo {
    gap: 8px;
  }
  .brand-icon {
    width: 32px;
    height: 32px;
    font-size: 15px;
    border-radius: 8px;
  }
  .mobile-nav {
    padding: 4px 0 12px;
  }
  .mobile-nav-link {
    padding: 11px 20px;
    font-size: 14px;
  }
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 8px 16px;
  }
  .footer-links {
    gap: 6px;
  }
  .footer-sep {
    display: none;
  }
  .toast-stack {
    bottom: 16px;
    right: 12px;
    left: 12px;
  }
}

/* Large desktop: >= 1440px */
@media (min-width: 1440px) {
  .nav-link {
    font-size: 13px;
    padding: 7px 14px;
  }
}
</style>
