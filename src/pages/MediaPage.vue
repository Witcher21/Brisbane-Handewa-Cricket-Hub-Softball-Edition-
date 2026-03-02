<template>
  <q-page class="dark-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="section-chip">🎬 MEDIA HUB</div>
        <h1 class="page-title">Highlights & <span class="grad">Media</span></h1>
        <p class="page-sub">
          Official Brisbane Handewa Cricket Hub — Australia's premier softball cricket content
        </p>
      </div>

      <!-- YouTube Channel Banner -->
      <div class="channel-banner youtube-banner">
        <div class="cb-left">
          <div class="cb-logo yt-logo">▶</div>
          <div>
            <div class="cb-name">Brisbane Handewa Cricket Hub</div>
            <div class="cb-handle">@brisbanehandawa · YouTube Channel</div>
            <div class="cb-desc">
              Official highlights, match replays, shorts & behind-the-scenes softball cricket
              content from Queensland's #1 league.
            </div>
          </div>
        </div>
        <a
          href="https://www.youtube.com/@brisbanehandawa"
          target="_blank"
          class="subscribe-btn yt-btn"
        >
          ▶ Subscribe on YouTube
        </a>
      </div>

      <!-- YouTube Shorts Section -->
      <h2 class="section-heading">🎬 Latest Shorts</h2>
      <div class="shorts-grid">
        <div
          v-for="short in youtubeShorts"
          :key="short.id"
          class="short-card"
          @click="openShort(short)"
        >
          <div class="short-thumb">
            <img
              :src="`https://img.youtube.com/vi/${short.id}/hqdefault.jpg`"
              :alt="short.title"
              loading="lazy"
            />
            <div class="short-overlay">
              <div class="short-play">▶</div>
              <div class="short-badge">Shorts</div>
            </div>
          </div>
          <div class="short-info">
            <div class="short-title">{{ short.title }}</div>
          </div>
        </div>
      </div>

      <!-- Video Modal (Shorts Player) -->
      <transition name="fade">
        <div v-if="activeShort" class="video-modal-overlay" @click.self="activeShort = null">
          <div class="video-modal">
            <button class="modal-close" @click="activeShort = null">✕</button>
            <div class="modal-short-wrap">
              <iframe
                :src="`https://www.youtube.com/embed/${activeShort.id}?autoplay=1&rel=0`"
                frameborder="0"
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="modal-short-iframe"
              />
            </div>
            <div class="modal-title">{{ activeShort.title }}</div>
          </div>
        </div>
      </transition>

      <!-- TikTok Channel Section -->
      <div class="tiktok-section">
        <div class="channel-banner tiktok-banner">
          <div class="cb-left">
            <div class="cb-logo tt-logo">♪</div>
            <div>
              <div class="cb-name">witcher21</div>
              <div class="cb-handle">@21witcher · TikTok Channel</div>
              <div class="cb-desc">
                Cricket highlights, sledging moments, funny clips & behind-the-scenes reels from
                Brisbane Handewa.
              </div>
            </div>
          </div>
          <a href="https://www.tiktok.com/@21witcher" target="_blank" class="subscribe-btn tt-btn">
            ♪ Follow on TikTok
          </a>
        </div>

        <!-- TikTok Reels grid -->
        <h2 class="section-heading">🎵 TikTok Reels</h2>
        <div class="tiktok-grid">
          <div v-for="reel in tiktokReels" :key="reel.id" class="tiktok-card">
            <div class="tiktok-thumb">
              <div class="tiktok-bg">
                <div class="tiktok-emoji">{{ reel.emoji }}</div>
              </div>
              <div class="tiktok-play-overlay">
                <div class="tt-play-btn">▶</div>
              </div>
              <div class="tiktok-badge">TikTok</div>
            </div>
            <div class="tiktok-info">
              <div class="tiktok-title">{{ reel.title }}</div>
              <a :href="reel.url" target="_blank" class="tiktok-watch-btn">Watch on TikTok →</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Follow Section -->
      <h2 class="section-heading" style="margin-top: 48px">📲 Follow Brisbane Handewa</h2>
      <div class="social-grid">
        <a
          v-for="social in socials"
          :key="social.name"
          :href="social.url"
          target="_blank"
          class="social-card"
          :style="{ '--scolor': social.color }"
        >
          <span class="social-icon">{{ social.icon }}</span>
          <div>
            <div class="social-name">{{ social.name }}</div>
            <div class="social-handle">{{ social.handle }}</div>
          </div>
        </a>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const activeShort = ref(null)
function openShort(s) {
  activeShort.value = s
}

// ── Real YouTube Shorts from Brisbane Handewa ────────────────────
const youtubeShorts = [
  { id: 'LIVkJDv9YPE', title: 'Brisbane Handewa 🏏 Cricket Highlights' },
  { id: '19QhOQ1Oc5E', title: 'Best Moments — BHW Softball Edition' },
  { id: 'trIjjaCsZTw', title: 'Amazing Shot 🔥 Brisbane Handewa Cricket' },
  { id: 'UGrg9UfXzD8', title: 'Epic Six! Brisbane Handewa Special Moment' },
  { id: 'Tes2GLDaD1o', title: 'Top Play of the Match ⚡ BHW Cricket 2026' },
]

// ── TikTok Reels (link to @21witcher channel) ────────────────────
const tiktokReels = [
  {
    id: 1,
    title: 'Fastest Fifty of the Season 🔥',
    emoji: '🏏',
    url: 'https://www.tiktok.com/@21witcher',
  },
  {
    id: 2,
    title: 'Best Catches of 2026 😱',
    emoji: '🤩',
    url: 'https://www.tiktok.com/@21witcher',
  },
  {
    id: 3,
    title: 'Training Day with BHW Squad 💪',
    emoji: '💪',
    url: 'https://www.tiktok.com/@21witcher',
  },
  {
    id: 4,
    title: 'Funny Moments — Behind The Scenes 😂',
    emoji: '😂',
    url: 'https://www.tiktok.com/@21witcher',
  },
  {
    id: 5,
    title: 'Six After Six 🚀 Brisbane Handewa',
    emoji: '🚀',
    url: 'https://www.tiktok.com/@21witcher',
  },
  {
    id: 6,
    title: 'Match Day Vibes ⚡ GNS Cricket 2026',
    emoji: '⚡',
    url: 'https://www.tiktok.com/@21witcher',
  },
]

// ── Social Links ─────────────────────────────────────────────────
const socials = [
  {
    name: 'YouTube',
    handle: '@brisbanehandawa',
    icon: '▶',
    url: 'https://www.youtube.com/@brisbanehandawa',
    color: '#ff3d57',
  },
  {
    name: 'TikTok',
    handle: '@21witcher',
    icon: '♪',
    url: 'https://www.tiktok.com/@21witcher',
    color: '#00d4ff',
  },
  {
    name: 'Instagram',
    handle: '@BrisbaneHandawa',
    icon: '📸',
    url: 'https://instagram.com',
    color: '#e1306c',
  },
  {
    name: 'Facebook',
    handle: 'Brisbane Handewa Cricket',
    icon: 'f',
    url: 'https://facebook.com',
    color: '#4267B2',
  },
]
</script>

<style scoped>
.dark-page {
  background: transparent;
  min-height: 100vh;
}
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 32px 80px;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}
.section-chip {
  display: inline-block;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 14px;
}
.page-title {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 900;
  color: white;
  letter-spacing: -1.5px;
  margin: 0 0 10px;
}
.grad {
  background: linear-gradient(135deg, #22c55e, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.page-sub {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  max-width: 520px;
  margin: 0 auto;
}

/* Channel Banners */
.channel-banner {
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}
.youtube-banner {
  background: rgba(255, 61, 87, 0.06);
  border: 1px solid rgba(255, 61, 87, 0.2);
}
.tiktok-banner {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.15);
  margin-bottom: 28px;
}
.cb-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.cb-logo {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
  color: white;
  flex-shrink: 0;
}
.yt-logo {
  background: linear-gradient(135deg, #ff3d57, #ff0040);
}
.tt-logo {
  background: linear-gradient(135deg, #69c9d0, #ee1d52, #010101);
}
.cb-name {
  font-size: 18px;
  font-weight: 900;
  color: white;
  margin-bottom: 4px;
}
.cb-handle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}
.cb-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.5;
  max-width: 420px;
}
.subscribe-btn {
  font-weight: 800;
  font-size: 13px;
  padding: 12px 24px;
  border-radius: 12px;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.25s;
}
.yt-btn {
  background: #ff3d57;
  color: white;
}
.yt-btn:hover {
  background: #ff0040;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 0, 64, 0.4);
}
.tt-btn {
  background: linear-gradient(135deg, #69c9d0, #ee1d52);
  color: white;
}
.tt-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(238, 29, 82, 0.4);
}

.section-heading {
  font-size: 20px;
  font-weight: 900;
  color: white;
  margin: 0 0 20px;
}

/* YouTube Shorts Grid — portrait 9:16 cards */
.shorts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}
.short-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}
.short-card:hover {
  border-color: rgba(255, 61, 87, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}
.short-thumb {
  position: relative;
  aspect-ratio: 9/16;
  overflow: hidden;
  background: #0d1a2e;
}
.short-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: all 0.3s;
}
.short-card:hover .short-thumb img {
  opacity: 1;
  transform: scale(1.05);
}
.short-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}
.short-play {
  font-size: 40px;
  color: white;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
  opacity: 0;
  transition: opacity 0.2s;
}
.short-card:hover .short-play {
  opacity: 1;
}
.short-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff3d57;
  color: white;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 1px;
}
.short-info {
  padding: 10px 12px;
}
.short-title {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}

/* Video Modal */
.video-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.video-modal {
  background: #0d1a2e;
  border-radius: 20px;
  padding: 24px;
  max-width: 420px;
  width: 100%;
  position: relative;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  z-index: 1;
}
.modal-short-wrap {
  position: relative;
  padding-bottom: 177.77%;
  height: 0;
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
}
.modal-short-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
.modal-title {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

/* TikTok Section */
.tiktok-section {
  margin-bottom: 48px;
}
.tiktok-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 16px;
}
.tiktok-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
}
.tiktok-card:hover {
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}
.tiktok-thumb {
  position: relative;
  aspect-ratio: 9/16;
  overflow: hidden;
}
.tiktok-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d1117 0%, #1a0a2e 50%, #0d1a1f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tiktok-emoji {
  font-size: 60px;
  opacity: 0.85;
}
.tiktok-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.2s;
}
.tiktok-card:hover .tiktok-play-overlay {
  opacity: 1;
}
.tt-play-btn {
  font-size: 44px;
  color: white;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
}
.tiktok-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #ee1d52, #69c9d0);
  color: white;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 1px;
}
.tiktok-info {
  padding: 12px 14px;
}
.tiktok-title {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
  margin-bottom: 10px;
}
.tiktok-watch-btn {
  font-size: 11px;
  color: #00d4ff;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s;
}
.tiktok-watch-btn:hover {
  color: #69c9d0;
  text-decoration: underline;
}

/* Social */
.social-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.social-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 16px 18px;
  text-decoration: none;
  transition: all 0.25s;
}
.social-card:hover {
  border-color: var(--scolor);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.social-icon {
  width: 44px;
  height: 44px;
  background: var(--scolor);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  font-weight: 900;
  flex-shrink: 0;
}
.social-name {
  font-size: 15px;
  font-weight: 800;
  color: white;
}
.social-handle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .page-container {
    padding: 40px 16px 60px;
  }
  .shorts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .tiktok-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
