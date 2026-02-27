<template>
  <q-page class="dark-page">
    <div class="page-container">
      <div class="page-header">
        <div class="section-chip">🎬 MEDIA</div>
        <h1 class="page-title">Highlights & <span class="grad">Media</span></h1>
        <p class="page-sub">Official Brisbane Handewa Cricket Hub channel — Australia's premier softball cricket content</p>
      </div>

      <!-- Channel Banner -->
      <div class="channel-banner">
        <div class="cb-left">
          <div class="cb-logo">🏏</div>
          <div>
            <div class="cb-name">Brisbane Handewa Cricket Hub</div>
            <div class="cb-handle">@BrisbaneHandewa · Softball Edition</div>
            <div class="cb-desc">Official highlights, match replays, and behind-the-scenes content from Queensland's premier softball cricket league.</div>
          </div>
        </div>
        <a href="https://www.youtube.com/@brisbanehandewacrickethub" target="_blank" class="subscribe-btn">
          ▶ Subscribe on YouTube
        </a>
      </div>

      <!-- Embedded YouTube Latest -->
      <h2 class="section-heading">▶ Latest Highlights</h2>
      <div class="video-grid">
        <div v-for="video in youtubeVideos" :key="video.id" class="video-card" @click="openVideo(video)">
          <div class="video-thumb">
            <img :src="video.thumb" :alt="video.title" loading="lazy" />
            <div class="video-play-btn">▶</div>
            <div class="video-duration">{{ video.duration }}</div>
          </div>
          <div class="video-info">
            <div class="video-title">{{ video.title }}</div>
            <div class="video-meta">
              <span>{{ video.views }} views</span>
              <span>{{ video.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Modal -->
      <div v-if="activeVideo" class="video-modal-overlay" @click.self="activeVideo = null">
        <div class="video-modal">
          <button class="modal-close" @click="activeVideo = null">✕</button>
          <div class="modal-iframe-wrap">
            <iframe
              :src="`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`"
              frameborder="0"
              allow="autoplay; encrypted-media"
              allowfullscreen
              class="modal-iframe"
            />
          </div>
          <div class="modal-title">{{ activeVideo.title }}</div>
        </div>
      </div>

      <!-- Social Links -->
      <h2 class="section-heading" style="margin-top:48px">📲 Follow Brisbane Handewa</h2>
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

      <!-- TikTok Embed Section -->
      <h2 class="section-heading" style="margin-top:48px">🎵 TikTok Reels</h2>
      <div class="tiktok-grid">
        <div v-for="clip in tiktokClips" :key="clip.id" class="tiktok-card">
          <div class="tiktok-placeholder">
            <div class="tiktok-icon">🎵</div>
            <div class="tiktok-label">TikTok Reel</div>
            <div class="tiktok-title">{{ clip.title }}</div>
            <a :href="clip.url" target="_blank" class="tiktok-link">Watch on TikTok →</a>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const activeVideo = ref(null)

function openVideo(video) {
  activeVideo.value = video
}

// YouTube videos — using sample Brisbane cricket highlights
const youtubeVideos = [
  {
    id: 'dQw4w9WgXcQ', // Replace with real Brisbane Handewa video IDs
    title: 'Brisbane Handewa vs Colombo Kings — Full Match Highlights 2026',
    thumb: `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
    duration: '18:24',
    views: '12.4K',
    date: '2 days ago',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Nawod Sanjana — 98 Off 64 Balls ⚡ | Season Best Knock',
    thumb: `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
    duration: '8:14',
    views: '8.1K',
    date: '5 days ago',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Kamal Perera Hat-Trick Special | 3 Wickets in 3 Balls!',
    thumb: `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
    duration: '4:51',
    views: '21.7K',
    date: '1 week ago',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Top 10 Sixes of the Season — Softball Cricket Greatest Hits',
    thumb: `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
    duration: '11:03',
    views: '35.2K',
    date: '2 weeks ago',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Brisbane Handewa Season Review 2025 — Champions Journey 🏆',
    thumb: `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
    duration: '28:40',
    views: '47.8K',
    date: '1 month ago',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'How To Play Softball Cricket — Beginners Guide with BHW Coaches',
    thumb: `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
    duration: '15:22',
    views: '9.3K',
    date: '2 months ago',
  },
]

const socials = [
  { name: 'YouTube', handle: '@BrisbaneHandewaCricket', icon: '▶', url: 'https://youtube.com', color: '#ff3d57' },
  { name: 'TikTok',  handle: '@BrisbaneHandewa',        icon: '♪', url: 'https://tiktok.com',  color: '#00d4ff' },
  { name: 'Instagram', handle: '@BrisbaneHandewa',      icon: '📸', url: 'https://instagram.com', color: '#a855f7' },
  { name: 'Facebook', handle: 'Brisbane Handewa Cricket Hub', icon: 'f', url: 'https://facebook.com', color: '#4267B2' },
]

const tiktokClips = [
  { id: 1, title: 'Fastest Fifty of the Season 🔥', url: 'https://tiktok.com' },
  { id: 2, title: 'Best Catches 2025 😱', url: 'https://tiktok.com' },
  { id: 3, title: 'Training Day with BHW Squad 💪', url: 'https://tiktok.com' },
]
</script>

<style scoped>
.dark-page { background: #050d1a; min-height: 100vh; }
.page-container { max-width: 1100px; margin: 0 auto; padding: 60px 32px; }
.page-header { text-align: center; margin-bottom: 40px; }
.section-chip { display: inline-block; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; margin-bottom: 14px; }
.page-title { font-size: clamp(32px,5vw,52px); font-weight: 900; color: white; letter-spacing: -1.5px; margin: 0 0 10px; }
.grad { background: linear-gradient(135deg,#22c55e,#16a34a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; max-width: 500px; margin: 0 auto; }

/* Channel Banner */
.channel-banner { background: rgba(255,61,87,0.05); border: 1px solid rgba(255,61,87,0.15); border-radius: 16px; padding: 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 40px; flex-wrap: wrap; }
.cb-left { display: flex; align-items: center; gap: 20px; }
.cb-logo { width: 64px; height: 64px; background: linear-gradient(135deg,#ff3d57,#ff0040); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; flex-shrink: 0; }
.cb-name { font-size: 18px; font-weight: 900; color: white; margin-bottom: 4px; }
.cb-handle { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
.cb-desc { font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.5; max-width: 380px; }
.subscribe-btn { background: #ff3d57; color: white; font-weight: 800; font-size: 13px; padding: 12px 22px; border-radius: 8px; text-decoration: none; white-space: nowrap; transition: all 0.2s; }
.subscribe-btn:hover { background: #ff0040; transform: translateY(-2px); }

.section-heading { font-size: 20px; font-weight: 900; color: white; margin: 0 0 20px; }

/* Video Grid */
.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; margin-bottom: 40px; }
.video-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; cursor: pointer; transition: all 0.3s; }
.video-card:hover { border-color: rgba(255,61,87,0.25); transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.3); }
.video-thumb { position: relative; aspect-ratio: 16/9; overflow: hidden; background: #111; }
.video-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: all 0.3s; }
.video-card:hover .video-thumb img { opacity: 1; transform: scale(1.04); }
.video-play-btn { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 36px; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.8); opacity: 0; transition: opacity 0.2s; }
.video-card:hover .video-play-btn { opacity: 1; }
.video-duration { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.video-info { padding: 14px 16px; }
.video-title { font-size: 13px; font-weight: 700; color: white; line-height: 1.4; margin-bottom: 8px; }
.video-meta { display: flex; gap: 12px; font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 600; }

/* Video Modal */
.video-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.video-modal { background: #0d1a2e; border-radius: 16px; padding: 24px; max-width: 800px; width: 100%; position: relative; }
.modal-close { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; }
.modal-iframe-wrap { position: relative; padding-bottom: 56.25%; height: 0; margin-bottom: 16px; }
.modal-iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; }
.modal-title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.7); }

/* Social */
.social-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-bottom: 16px; }
.social-card { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: all 0.2s; }
.social-card:hover { border-color: var(--scolor); background: rgba(255,255,255,0.05); transform: translateY(-3px); }
.social-icon { width: 40px; height: 40px; background: var(--scolor); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; font-weight: 900; flex-shrink: 0; }
.social-name { font-size: 14px; font-weight: 800; color: white; }
.social-handle { font-size: 11px; color: rgba(255,255,255,0.35); }

/* TikTok */
.tiktok-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.tiktok-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
.tiktok-placeholder { padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.tiktok-icon { font-size: 40px; }
.tiktok-label { font-size: 10px; color: rgba(255,255,255,0.3); font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.tiktok-title { font-size: 14px; font-weight: 700; color: white; }
.tiktok-link { font-size: 12px; color: #00d4ff; text-decoration: none; font-weight: 700; }
.tiktok-link:hover { text-decoration: underline; }
</style>
