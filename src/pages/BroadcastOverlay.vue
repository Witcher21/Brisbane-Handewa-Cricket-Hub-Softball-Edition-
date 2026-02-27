<template>
  <!-- TV Broadcast Overlay — transparent background, OBS-ready -->
  <div class="overlay-root">
    <!-- Top Scoreboard Bar -->
    <div class="scoreboard-bar" v-if="match">
      <div class="sb-left">
        <div class="sb-team-badge" :style="{ background: getTeamColor(match.teamAId) }">
          {{ match.teamAShort }}
        </div>
        <div class="sb-score" v-if="match.innings[0]">
          <span class="sb-runs">{{ match.innings[0].runs }}/{{ match.innings[0].wickets }}</span>
          <span class="sb-overs">({{ match.innings[0].overs }} ov)</span>
        </div>
      </div>

      <div class="sb-center">
        <div class="sb-title">BRISBANE HANDEWA CRICKET HUB</div>
        <div class="sb-live-pill" v-if="match.status === 'live'">
          <span class="sb-live-dot" />
          LIVE
        </div>
      </div>

      <div class="sb-right">
        <div class="sb-rr" v-if="match.innings[0]">
          CRR {{ crr }}
        </div>
        <div class="sb-team-badge" :style="{ background: getTeamColor(match.teamBId) }">
          {{ match.teamBShort }}
        </div>
      </div>
    </div>

    <!-- Lower Third — Batsmen -->
    <div class="lower-third lt-batsmen" v-if="match && match.currentBatsmen.length">
      <div class="lt-label">AT THE CREASE</div>
      <div class="lt-batsmen-row">
        <div v-for="batter in match.currentBatsmen" :key="batter.name" class="lt-batter">
          <span class="lt-batter-name">{{ batter.name }}</span>
          <span class="lt-batter-sep">|</span>
          <span class="lt-batter-score">{{ batter.runs }}<span class="lt-batter-balls">({{ batter.balls }})</span></span>
          <span class="lt-batter-extras">{{ batter.fours }}×4 · {{ batter.sixes }}×6</span>
        </div>
      </div>
    </div>

    <!-- Recent Balls Strip -->
    <div class="balls-strip" v-if="match && match.recentBalls.length">
      <div class="bs-label">THIS OVER</div>
      <div class="bs-balls">
        <div
          v-for="(ball, i) in currentOver"
          :key="i"
          class="bs-ball"
          :class="`bs-ball-${getBallClass(ball)}`"
        >{{ ball }}</div>
      </div>
    </div>

    <!-- Milestone Notification -->
    <transition name="milestone-slide">
      <div v-if="milestone" class="milestone-banner">
        <div class="milestone-icon">🎉</div>
        <div class="milestone-text">{{ milestone }}</div>
      </div>
    </transition>

    <!-- Clock -->
    <div class="overlay-clock">{{ currentTime }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCricketStore } from 'stores/cricket-store'

const store = useCricketStore()
const match = computed(() => store.getMatchById(1))
const milestone = ref(null)
const currentTime = ref('')

const currentOver = computed(() => {
  if (!match.value) return []
  return [...match.value.recentBalls].slice(0, 6).reverse()
})

const crr = computed(() => {
  const inn = match.value?.innings[0]
  if (!inn || !inn.overs) return '0.00'
  return (inn.runs / inn.overs).toFixed(2)
})

function getBallClass(ball) {
  if (ball === 'W') return 'wicket'
  if (ball === '6') return 'six'
  if (ball === '4') return 'four'
  if (ball === '0') return 'dot'
  if (ball === 'Wd' || ball === 'Nb') return 'extra'
  return 'run'
}

function getTeamColor(id) {
  const c = { 1: '#00d4ff', 2: '#ffd700', 3: '#ff4500' }
  return c[id] || '#555'
}

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

let clockInterval
onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  // Watch for wickets/boundaries to trigger milestone banners
  store.$onAction(({ name, args }) => {
    if (name === 'addDelivery') {
      const d = args[0]
      if (d.wicket) {
        milestone.value = 'WICKET! 🎯'
        setTimeout(() => { milestone.value = null }, 4000)
      } else if (d.runs === 6) {
        milestone.value = 'SIX! 💥'
        setTimeout(() => { milestone.value = null }, 3000)
      } else if (d.runs === 4) {
        milestone.value = 'FOUR! 🏏'
        setTimeout(() => { milestone.value = null }, 2500)
      }
    }
  })
})

onUnmounted(() => {
  clearInterval(clockInterval)
})
</script>

<style>
/* Make the overlay page itself transparent for OBS */
html, body, #q-app {
  background: transparent !important;
}
</style>

<style scoped>
.overlay-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  font-family: 'Roboto', 'Outfit', sans-serif;
}

/* ── SCOREBOARD BAR (top) ─────────────── */
.scoreboard-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 64px;
  background: rgba(5, 13, 26, 0.95);
  border-bottom: 3px solid #00d4ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  backdrop-filter: blur(10px);
}
.sb-left, .sb-right { display: flex; align-items: center; gap: 12px; }
.sb-right { flex-direction: row-reverse; }
.sb-team-badge {
  padding: 6px 14px; border-radius: 8px;
  font-size: 15px; font-weight: 900; color: white;
  letter-spacing: 0.5px;
}
.sb-score { display: flex; flex-direction: column; }
.sb-runs { font-size: 28px; font-weight: 900; color: white; line-height: 1; }
.sb-overs { font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 600; }
.sb-center { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.sb-title { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; }
.sb-live-pill {
  display: flex; align-items: center; gap: 5px;
  background: #ff3d57; color: white; font-size: 11px; font-weight: 800;
  padding: 3px 10px; border-radius: 20px; letter-spacing: 2px;
}
.sb-live-dot { width: 6px; height: 6px; background: white; border-radius: 50%; animation: blink 1s infinite; }
.sb-rr { font-size: 12px; font-weight: 700; color: #00d4ff; }

/* ── LOWER THIRD — BATSMEN ────────────── */
.lower-third {
  position: absolute;
  left: 0; right: 0;
  background: rgba(5, 13, 26, 0.9);
  border-top: 2px solid #00d4ff;
  padding: 10px 20px;
}
.lt-batsmen { bottom: 80px; }
.lt-label { font-size: 9px; font-weight: 800; color: #00d4ff; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 6px; }
.lt-batsmen-row { display: flex; gap: 32px; }
.lt-batter { display: flex; align-items: center; gap: 8px; }
.lt-batter-name { font-size: 14px; font-weight: 800; color: white; }
.lt-batter-sep { color: rgba(255,255,255,0.2); }
.lt-batter-score { font-size: 18px; font-weight: 900; color: #00d4ff; }
.lt-batter-balls { font-size: 12px; color: rgba(255,255,255,0.4); margin-left: 2px; }
.lt-batter-extras { font-size: 11px; color: rgba(255,255,255,0.4); margin-left: 4px; }

/* ── BALLS STRIP ───────────────────────── */
.balls-strip {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: rgba(5, 13, 26, 0.92);
  padding: 10px 20px;
  display: flex; align-items: center; gap: 14px;
  border-top: 1px solid rgba(0,212,255,0.15);
}
.bs-label { font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.35); letter-spacing: 2px; text-transform: uppercase; }
.bs-balls { display: flex; gap: 7px; }
.bs-ball {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 900;
}
.bs-ball-wicket { background: #ff3d57; color: white; }
.bs-ball-six    { background: #a855f7; color: white; }
.bs-ball-four   { background: #00d4ff; color: #050d1a; }
.bs-ball-dot    { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); }
.bs-ball-extra  { background: #ffd700; color: #050d1a; }
.bs-ball-run    { background: rgba(255,255,255,0.15); color: white; }

/* ── MILESTONE BANNER ─────────────────── */
.milestone-banner {
  position: absolute;
  top: 80px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, #ff3d57, #a855f7);
  color: white; font-size: 28px; font-weight: 900;
  padding: 16px 40px; border-radius: 14px;
  display: flex; align-items: center; gap: 12px;
  letter-spacing: 2px;
  box-shadow: 0 12px 40px rgba(255,61,87,0.5);
}
.milestone-icon { font-size: 36px; }
.milestone-slide-enter-active, .milestone-slide-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.milestone-slide-enter-from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.8); }
.milestone-slide-leave-to   { opacity: 0; transform: translateX(-50%) scale(0.7); }

/* ── CLOCK ────────────────────────────── */
.overlay-clock {
  position: absolute;
  top: 72px; right: 12px;
  font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
}

@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
</style>
