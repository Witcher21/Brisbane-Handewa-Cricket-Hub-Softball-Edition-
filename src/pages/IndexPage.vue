<template>
  <q-page class="home-page">
    <!-- ── 3D INTRO ── -->
    <transition name="intro-fade">
      <div v-if="showIntro" class="intro-overlay">
        <canvas ref="canvas3d" class="canvas-3d" />
        <div class="intro-content">
          <div class="intro-logo-wrap">
            <div class="intro-ball-ring">
              <div class="intro-ball-inner">🏏</div>
            </div>
            <h1 class="intro-title">Brisbane Handewa</h1>
            <p class="intro-tag">Cricket Hub · Softball Edition · Season 2026</p>
          </div>
          <div class="intro-status" :class="{ hit: hitDone }">
            <span v-if="!hitDone">🎳 Ball Incoming…</span>
            <span v-else>💥 SIX! — Entering Hub…</span>
          </div>
          <button class="intro-skip" @click="doSkip">Skip ›</button>
        </div>
        <div v-if="hitDone" class="particle-burst">
          <span v-for="n in 24" :key="n" class="pt" :style="pt(n)" />
        </div>
      </div>
    </transition>

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-orb o1" />
      <div class="hero-orb o2" />
      <div class="hero-grid" />
      <div class="hero-left">
        <div class="hero-chip"><span class="hc-dot" />LIVE · SEASON 2026</div>
        <h1 class="hero-h1">The Ultimate<br /><span class="hero-grad">Cricket Hub</span></h1>
        <p class="hero-p">
          Real-time ball-by-ball scoring, professional TV overlays, Cricbuzz-style profiles — all in
          one platform.
        </p>
        <div class="hero-btns">
          <router-link to="/matches/1" class="btn-cta-primary">📺 Watch Live</router-link>
          <router-link to="/players" class="btn-cta-sec">👥 Players</router-link>
          <router-link to="/manage" class="btn-cta-sec">⚙️ Manage</router-link>
        </div>
        <div v-if="lm" class="ticker">
          <span class="ticker-live">🔴 LIVE</span>
          <span class="ticker-teams"
            >{{ getTeamName(lm.teamAId) }} vs {{ getTeamName(lm.teamBId) }}</span
          >
          <span v-if="lm.innings[0]" class="ticker-score"
            >{{ lm.innings[0].runs }}/{{ lm.innings[0].wickets }} ({{ lm.innings[0].overs }})</span
          >
          <div class="ticker-balls">
            <span
              v-for="(b, i) in lm.recentBalls.slice(0, 6)"
              :key="i"
              class="bc"
              :class="`bc-${bc(b)}`"
              >{{ b }}</span
            >
          </div>
        </div>
      </div>
      <div class="hero-right">
        <div class="stadium-art">
          <div class="sa-bg" />
          <div class="sa-pitch">
            <div class="sa-crease top" />
            <div class="sa-strip" />
            <div class="sa-crease bot" />
          </div>
          <div class="sa-stumps s1">
            <div class="s" />
            <div class="s" />
            <div class="s" />
          </div>
          <div class="sa-stumps s2">
            <div class="s" />
            <div class="s" />
            <div class="s" />
          </div>
          <div class="sa-ball" />
          <div class="sa-glow" />
        </div>
      </div>
    </section>

    <!-- ── LIVE CARD ── -->
    <section v-if="lm" class="live-section">
      <div class="container">
        <div class="sec-chip live-chip">🔴 LIVE NOW</div>
        <div class="live-card">
          <div class="lc-teams">
            <div class="lc-team">
              <div class="lc-badge" :style="{ background: teamColor(lm.teamAId) }">
                {{ store.getTeamById(lm.teamAId)?.shortName }}
              </div>
              <span class="lc-tname">{{ store.getTeamById(lm.teamAId)?.name }}</span>
            </div>
            <div class="lc-center">
              <div v-if="lm.innings[0]" class="lc-score">
                {{ lm.innings[0].runs }}/{{ lm.innings[0].wickets }}
              </div>
              <div v-if="lm.innings[0]" class="lc-overs">{{ lm.innings[0].overs }} overs</div>
            </div>
            <div class="lc-team">
              <div class="lc-badge" :style="{ background: teamColor(lm.teamBId) }">
                {{ store.getTeamById(lm.teamBId)?.shortName }}
              </div>
              <span class="lc-tname">{{ store.getTeamById(lm.teamBId)?.name }}</span>
            </div>
          </div>
          <!-- Batting now -->
          <div class="lc-batters">
            <div v-for="b in currentBatsmen" :key="b.playerId" class="lc-batter">
              <span class="bname">🏏 {{ getPlayer(b.playerId)?.name }}</span>
              <span class="bscore"
                >{{ b.runs }}<small>({{ b.balls }})</small></span
              >
              <span class="bextras">{{ b.fours }}×4 · {{ b.sixes }}×6</span>
            </div>
          </div>
          <!-- Bowler -->
          <div v-if="currentBowlerEntry" class="lc-bowler">
            🎯 <strong>{{ getPlayer(currentBowlerEntry.playerId)?.name }}</strong> &nbsp;{{
              currentBowlerEntry.overs
            }}
            ov · {{ currentBowlerEntry.runs }} runs · {{ currentBowlerEntry.wickets }}/wkt
          </div>
          <!-- Recent balls -->
          <div class="lc-balls">
            <span class="balls-lbl">This over:</span>
            <span
              v-for="(b, i) in lm.recentBalls.slice(0, 6)"
              :key="i"
              class="bc"
              :class="`bc-${bc(b)}`"
              >{{ b }}</span
            >
          </div>
          <router-link to="/matches/1" class="btn-cta-primary lc-btn">Full Scorecard →</router-link>
        </div>
      </div>
    </section>

    <!-- ── STATS BAR ── -->
    <div class="stats-bar">
      <div class="container stats-row">
        <div v-for="s in statBar" :key="s.l" class="sb-item">
          <span class="sb-val">{{ s.v }}</span
          ><span class="sb-lbl">{{ s.l }}</span>
        </div>
      </div>
    </div>

    <!-- ── FEATURES ── -->
    <section class="features-sec">
      <div class="container">
        <div class="sec-chip">⚡ FEATURES</div>
        <h2 class="sec-h2">Everything Cricket in One Hub</h2>
        <div class="feats-grid">
          <router-link v-for="f in feats" :key="f.t" :to="f.to" class="feat-card">
            <div class="feat-icon" :style="{ background: f.g }">{{ f.em }}</div>
            <h3 class="feat-t">{{ f.t }}</h3>
            <p class="feat-d">{{ f.d }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ── TOP PLAYERS ── -->
    <section class="players-sec">
      <div class="container">
        <div class="sec-chip">⭐ SQUAD</div>
        <h2 class="sec-h2">Brisbane Handewa XI</h2>
        <div class="squad-grid">
          <router-link
            v-for="p in bhwPlayers.slice(0, 6)"
            :key="p.id"
            :to="`/players/${p.id}`"
            class="sq-card"
          >
            <div class="sq-av" :style="{ background: roleGrad(p.role) }">
              <span>{{ roleEm(p.role) }}</span>
              <div class="sq-num">#{{ p.number }}</div>
            </div>
            <div class="sq-info">
              <div class="sq-role" :class="`r-${p.role.toLowerCase().replace('-', '')}`">
                {{ p.role }}
              </div>
              <div class="sq-name">{{ p.name }}</div>
              <div class="sq-stat">
                <span v-if="p.role !== 'Bowler'">{{ p.stats.runs }} R</span>
                <span v-if="p.role !== 'Batsman'">{{ p.stats.wickets }} W</span>
                <span>SR {{ ((p.stats.runs / Math.max(p.stats.balls, 1)) * 100).toFixed(1) }}</span>
              </div>
            </div>
          </router-link>
        </div>
        <div class="sec-cta">
          <router-link to="/players" class="btn-cta-sec">View All Players →</router-link>
          <router-link to="/manage" class="btn-cta-sec">+ Manage Squads →</router-link>
        </div>
      </div>
    </section>

    <!-- ── QUICK LINKS ── -->
    <section class="quick-sec">
      <div class="container quick-grid">
        <a href="/broadcast-overlay" target="_blank" class="qc bc-qc">
          <span class="qc-em">📺</span>
          <h3>TV Overlay</h3>
          <p>OBS-ready transparent scoreboard for live streams</p>
        </a>
        <router-link to="/admin" class="qc ad-qc">
          <span class="qc-em">⚡</span>
          <h3>Live Scorer</h3>
          <p>Ball-by-ball input with instant player stat tracking</p>
        </router-link>
        <router-link to="/manage" class="qc mg-qc">
          <span class="qc-em">⚙️</span>
          <h3>Squad Manager</h3>
          <p>Add teams, register up to 15 players per squad</p>
        </router-link>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCricketStore } from 'stores/cricket-store'
import * as THREE from 'three'
import { gsap } from 'gsap'

const store = useCricketStore()
const lm = computed(() => store.liveMatch)
const bhwPlayers = computed(() => store.players.filter((p) => p.teamId === 1))

const currentBatsmen = computed(() =>
  lm.value ? lm.value.battingOrder.filter((b) => b.status === 'batting') : [],
)
const currentBowlerEntry = computed(() =>
  lm.value ? lm.value.bowlingCard.find((b) => b.status === 'current') : null,
)

function getPlayer(id) {
  return store.getPlayerById(id)
}
function getTeamName(id) {
  return store.getTeamById(id)?.name || ''
}
function bc(ball) {
  if (ball === 'W') return 'wkt'
  if (ball === '6') return 'six'
  if (ball === '4') return 'four'
  if (ball === '0') return 'dot'
  if (ball === 'Wd' || ball === 'Nb') return 'extra'
  return 'run'
}
function teamColor(id) {
  const c = {
    1: 'linear-gradient(135deg,#00d4ff,#0066cc)',
    2: 'linear-gradient(135deg,#ffd700,#cc8800)',
    3: 'linear-gradient(135deg,#ff4500,#aa2200)',
  }
  return c[id] || '#333'
}
function roleGrad(r) {
  return (
    {
      Batsman: '#00d4ff15',
      Bowler: '#ff3d5715',
      'All-rounder': '#a855f715',
      'Wicket-keeper': '#22c55e15',
    }[r] || '#ffffff10'
  )
}
function roleEm(r) {
  return { Batsman: '🏏', Bowler: '⚾', 'All-rounder': '⚡', 'Wicket-keeper': '🧤' }[r] || '🏏'
}

// ── 3D Intro ──────────────────────────────────────────────────
const showIntro = ref(true)
const hitDone = ref(false)
const canvas3d = ref(null)
let renderer, rAF

function doSkip() {
  gsap.to('.intro-overlay', {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      showIntro.value = false
    },
  })
}

function pt(n) {
  const a = (n / 24) * 360
  const d = 50 + Math.random() * 120
  return {
    '--a': `${a}deg`,
    '--d': `${d}px`,
    background: `hsl(${a},90%,60%)`,
    animationDelay: `${Math.random() * 0.4}s`,
  }
}

function initThree() {
  const cvs = canvas3d.value
  if (!cvs) return
  renderer = new THREE.WebGLRenderer({ canvas: cvs, alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200)
  camera.position.set(0, 4, 14)

  // Ground
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a5c1a })
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 80), groundMat)
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // Pitch strip
  const pitchMat = new THREE.MeshStandardMaterial({ color: 0xc8a968 })
  const pitchMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 20), pitchMat)
  pitchMesh.rotation.x = -Math.PI / 2
  pitchMesh.position.y = 0.01
  scene.add(pitchMesh)

  // Stumps group
  function makeStumps(z) {
    const g = new THREE.Group()
    const sm = new THREE.MeshStandardMaterial({ color: 0xf0e0c0 })
    ;[-0.4, 0, 0.4].forEach((x) => {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), sm)
      st.position.set(x, 0.5, z)
      g.add(st)
    })
    const bail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), sm)
    bail.rotation.z = Math.PI / 2
    bail.position.set(0, 1.05, z)
    g.add(bail)
    scene.add(g)
  }
  makeStumps(-8)
  makeStumps(8)

  // Ball
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xcc1111,
    roughness: 0.4,
    metalness: 0.15,
  })
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), ballMat)
  ball.position.set(0, 0.22, -10)
  scene.add(ball)

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.4)
  sun.position.set(6, 12, 6)
  scene.add(sun)
  const blueLight = new THREE.PointLight(0x00d4ff, 3, 30)
  blueLight.position.set(-6, 6, 0)
  scene.add(blueLight)
  const redLight = new THREE.PointLight(0xff3d57, 2, 20)
  redLight.position.set(6, 4, -4)
  scene.add(redLight)

  // Animate
  let t = 0,
    hit = false
  const animate = () => {
    rAF = requestAnimationFrame(animate)
    t += 0.02
    if (!hit) {
      ball.position.z = -10 + t * 10
      ball.position.y = 0.22 + Math.abs(Math.sin(t * 1.8)) * 0.9
      ball.rotation.x += 0.2
      camera.position.x = Math.sin(t * 0.2) * 0.6
      if (ball.position.z >= 7 && !hit) {
        hit = true
        hitDone.value = true
        gsap.to(ball.position, { y: 12, z: 18, x: 2, duration: 0.9, ease: 'power2.out' })
        gsap.to(ball.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.9 })
        setTimeout(doSkip, 2200)
      }
    }
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
}

onMounted(initThree)
onUnmounted(() => {
  if (rAF) cancelAnimationFrame(rAF)
  if (renderer) renderer.dispose()
})

const statBar = [
  { v: `${store.players.length}`, l: 'Players' },
  { v: `${store.teams.length}`, l: 'Teams' },
  { v: `${store.matches.length}`, l: 'Matches' },
  { v: '1', l: 'Live Now' },
  { v: '2026', l: 'Season' },
]

const feats = [
  {
    em: '📺',
    t: 'TV Broadcast Overlay',
    d: 'OBS-ready transparent scoreboard for live streaming.',
    to: '/broadcast-overlay',
    g: 'linear-gradient(135deg,#ff3d5730,#ff005020)',
  },
  {
    em: '⚡',
    t: 'Live Ball-by-Ball',
    d: 'Score input synced instantly — batsman & bowler stats auto-updated.',
    to: '/admin',
    g: 'linear-gradient(135deg,#00d4ff30,#0080ff20)',
  },
  {
    em: '👤',
    t: 'Player Profiles',
    d: 'Cricbuzz-style career stats: runs, wickets, SR, economy, graphs.',
    to: '/players',
    g: 'linear-gradient(135deg,#a855f730,#6366f120)',
  },
  {
    em: '🏆',
    t: 'Team Hub',
    d: 'Squad pages, standings, captain info and season stats.',
    to: '/teams',
    g: 'linear-gradient(135deg,#ffd70030,#ff8c0020)',
  },
  {
    em: '⚙️',
    t: 'Squad Manager',
    d: 'Add teams, register 15 players per squad, set batting orders.',
    to: '/manage',
    g: 'linear-gradient(135deg,#22c55e30,#16a34a20)',
  },
  {
    em: '🎬',
    t: 'Media Hub',
    d: 'YouTube highlights and TikTok reels from the official channel.',
    to: '/media',
    g: 'linear-gradient(135deg,#f9731630,#ea580c20)',
  },
]
</script>

<style scoped>
.home-page {
  background: transparent;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── INTRO ── */
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #020810;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas-3d {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.intro-content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}
.intro-logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.intro-ball-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid rgba(0, 212, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin-ring 3s linear infinite;
  box-shadow: 0 0 40px rgba(0, 212, 255, 0.25);
}
@keyframes spin-ring {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.intro-ball-inner {
  font-size: 48px;
  animation: spin-ring 3s linear infinite reverse;
}
.intro-title {
  font-size: clamp(28px, 5vw, 58px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -2px;
  margin: 0;
  text-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
}
.intro-tag {
  font-size: 13px;
  color: #00d4ff;
  letter-spacing: 2px;
  font-weight: 600;
  margin: 0;
}
.intro-status {
  padding: 10px 28px;
  border: 1.5px solid rgba(0, 212, 255, 0.3);
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.5s;
}
.intro-status.hit {
  border-color: #ffd700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}
.intro-skip {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.45);
  padding: 7px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.intro-skip:hover {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}
.particle-burst {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.pt {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  animation: burst 1.1s ease-out forwards;
}
@keyframes burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--a)) translateX(var(--d)) scale(0);
    opacity: 0;
  }
}
.intro-fade-leave-active {
  transition: opacity 0.6s;
}
.intro-fade-leave-to {
  opacity: 0;
}

/* ── HERO ── */
.hero {
  min-height: calc(100vh - 68px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 8vw 60px;
  position: relative;
  gap: 40px;
}
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}
.o1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.12), transparent);
  top: -120px;
  left: -80px;
}
.o2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.1), transparent);
  bottom: -80px;
  right: 5%;
}
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
}
.hero-left {
  position: relative;
  z-index: 1;
  max-width: 600px;
}
.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.2);
  padding: 5px 15px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 700;
  color: #00d4ff;
  letter-spacing: 1.5px;
  margin-bottom: 24px;
}
.hc-dot {
  width: 7px;
  height: 7px;
  background: #00d4ff;
  border-radius: 50%;
  animation: blink 1.2s infinite;
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
.hero-h1 {
  font-size: clamp(38px, 5.5vw, 72px);
  font-weight: 900;
  color: #fff;
  line-height: 1;
  letter-spacing: -2.5px;
  margin: 0 0 20px;
}
.hero-grad {
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.75;
  margin: 0 0 30px;
  max-width: 480px;
}
.hero-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.btn-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, #00d4ff, #0066cc);
  color: #030b18;
  font-weight: 800;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 6px 22px rgba(0, 212, 255, 0.3);
}
.btn-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.45);
}
.btn-cta-sec {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 11px 22px;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-cta-sec:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
.ticker {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 12px 18px;
  flex-wrap: wrap;
}
.ticker-live {
  font-size: 12px;
  font-weight: 800;
  color: #ff3d57;
}
.ticker-teams {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}
.ticker-score {
  font-size: 20px;
  font-weight: 900;
  color: #00d4ff;
}
.ticker-balls {
  display: flex;
  gap: 5px;
}

/* ── STADIUM ART ── */
.hero-right {
  flex-shrink: 0;
  display: none;
}
@media (min-width: 960px) {
  .hero-right {
    display: block;
  }
}
.stadium-art {
  width: 300px;
  height: 480px;
  background: linear-gradient(180deg, #0d2a15, #1e6b2e 35%, #1a5a26);
  border-radius: 24px 24px 140px 140px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 80px rgba(0, 212, 255, 0.12),
    inset 0 0 50px rgba(0, 0, 0, 0.35);
}
.sa-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(0, 212, 255, 0.06), transparent 60%);
}
.sa-pitch {
  position: absolute;
  left: 50%;
  top: 50px;
  bottom: 50px;
  transform: translateX(-50%);
  width: 90px;
  background: #c8a868;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}
.sa-crease {
  height: 3px;
  background: rgba(255, 255, 255, 0.9);
  margin: 0 8px;
  border-radius: 2px;
}
.sa-strip {
  flex: 1;
  background: linear-gradient(180deg, #d4aa72, #c49c60);
  margin: 4px 0;
}
.sa-stumps {
  position: absolute;
  display: flex;
  gap: 6px;
  left: 50%;
  transform: translateX(-50%);
}
.s1 {
  top: 68px;
}
.s2 {
  bottom: 68px;
}
.s {
  width: 5px;
  height: 30px;
  background: #f0e0b0;
  border-radius: 3px;
}
.sa-ball {
  position: absolute;
  width: 22px;
  height: 22px;
  background: radial-gradient(circle at 35% 35%, #ff5555, #8b0000);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: bounce3d 2.2s ease-in-out infinite;
  box-shadow: 0 0 18px rgba(255, 50, 50, 0.6);
}
@keyframes bounce3d {
  0%,
  100% {
    transform: translate(-50%, -200%);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, 60%);
    opacity: 1;
  }
}
.sa-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(transparent, rgba(0, 212, 255, 0.06));
}

/* ── LIVE SECTION ── */
.live-section {
  padding: 60px 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}
.sec-chip {
  display: inline-block;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 20px;
}
.live-chip {
  background: rgba(255, 61, 87, 0.1);
  border-color: rgba(255, 61, 87, 0.3);
  color: #ff3d57;
}
.live-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 61, 87, 0.2);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 0 40px rgba(255, 61, 87, 0.06);
}
.lc-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.lc-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.lc-badge {
  min-width: 64px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}
.lc-tname {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
}
.lc-center {
  text-align: center;
}
.lc-score {
  font-size: clamp(42px, 6vw, 75px);
  font-weight: 900;
  color: #fff;
  line-height: 1;
  letter-spacing: -2px;
}
.lc-overs {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 4px;
}
.lc-batters {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.lc-batter {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 9px 14px;
}
.bname {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}
.bscore {
  font-size: 18px;
  font-weight: 900;
  color: #00d4ff;
}
.bscore small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
.bextras {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}
.lc-bowler {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 14px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}
.lc-balls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.balls-lbl {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
  letter-spacing: 1px;
}
.lc-btn {
  text-decoration: none;
  align-self: flex-start;
}

/* ── BALL CHIPS ── */
.bc {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
}
.bc-wkt {
  background: #ff3d57;
  color: #fff;
}
.bc-six {
  background: #a855f7;
  color: #fff;
}
.bc-four {
  background: #00d4ff;
  color: #030b18;
}
.bc-dot {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.4);
}
.bc-extra {
  background: #ffd700;
  color: #030b18;
}
.bc-run {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

/* ── STATS BAR ── */
.stats-bar {
  background: rgba(0, 212, 255, 0.04);
  border-top: 1px solid rgba(0, 212, 255, 0.08);
  border-bottom: 1px solid rgba(0, 212, 255, 0.08);
  padding: 18px 0;
}
.stats-row {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
}
.sb-item {
  text-align: center;
}
.sb-val {
  display: block;
  font-size: 30px;
  font-weight: 900;
  color: #00d4ff;
}
.sb-lbl {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* ── FEATURES ── */
.features-sec {
  padding: 80px 0;
}
.sec-h2 {
  font-size: clamp(26px, 4vw, 42px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -1.5px;
  margin: 0 0 36px;
}
.feats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.feat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 26px;
  text-decoration: none;
  transition: all 0.3s;
}
.feat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 212, 255, 0.18);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
}
.feat-icon {
  width: 50px;
  height: 50px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
}
.feat-t {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
}
.feat-d {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.6;
  margin: 0;
}

/* ── PLAYERS ── */
.players-sec {
  background: rgba(255, 255, 255, 0.01);
  padding: 80px 0;
}
.squad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}
.sq-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 18px 20px;
  text-decoration: none;
  transition: all 0.3s;
}
.sq-card:hover {
  border-color: rgba(0, 212, 255, 0.2);
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.05);
}
.sq-av {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  position: relative;
}
.sq-num {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 5px;
}
.sq-info {
  flex: 1;
  min-width: 0;
}
.sq-role {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  padding: 2px 8px;
  border-radius: 5px;
  display: inline-block;
  margin-bottom: 5px;
}
.r-batsman {
  background: rgba(0, 212, 255, 0.12);
  color: #00d4ff;
}
.r-bowler {
  background: rgba(255, 61, 87, 0.12);
  color: #ff3d57;
}
.r-allrounder {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
}
.r-wicketkeeper {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.sq-name {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sq-stat {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.38);
  display: flex;
  gap: 8px;
  margin-top: 3px;
}
.sec-cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── QUICK LINKS ── */
.quick-sec {
  padding: 60px 0 80px;
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}
.qc {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 16px;
  padding: 28px;
  text-decoration: none;
  transition: all 0.3s;
  border: 1px solid transparent;
}
.qc:hover {
  transform: translateY(-5px);
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.35);
}
.qc-em {
  font-size: 34px;
}
.qc h3 {
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  margin: 0;
}
.qc p {
  color: rgba(255, 255, 255, 0.42);
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}
.bc-qc {
  background: rgba(255, 61, 87, 0.05);
  border-color: rgba(255, 61, 87, 0.12);
}
.bc-qc:hover {
  border-color: rgba(255, 61, 87, 0.3);
}
.ad-qc {
  background: rgba(0, 212, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.1);
}
.ad-qc:hover {
  border-color: rgba(0, 212, 255, 0.28);
}
.mg-qc {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.1);
}
.mg-qc:hover {
  border-color: rgba(34, 197, 94, 0.28);
}
</style>
