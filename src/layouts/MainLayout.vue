<template>
  <q-layout view="hHh lpR fFf" class="main-layout">

    <!-- ═══ GLOBAL ANIMATED BACKGROUND ═══════════════════════════ -->
    <canvas id="bg-canvas" class="bg-canvas" />
    <div class="bg-orbs">
      <div class="orb orb1" />
      <div class="orb orb2" />
      <div class="orb orb3" />
      <div class="orb orb4" />
    </div>

    <!-- ═══ GLOBAL TOAST NOTIFICATIONS ══════════════════════════= -->
    <teleport to="body">
      <div class="toast-stack">
        <transition-group name="toast">
          <div
            v-for="n in store.notifications.slice(0,5)"
            :key="n.id"
            class="toast-item"
            :class="`toast-${n.type}`"
          >
            <span class="toast-icon">{{ toastIcon(n.type) }}</span>
            <span class="toast-text">{{ n.text }}</span>
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
            <span class="brand-sub">Cricket Hub · Softball Edition</span>
          </div>
        </router-link>

        <q-space />

        <div class="desktop-nav">
          <router-link v-for="link in navLinks" :key="link.path" :to="link.path" class="nav-link" active-class="nav-active">
            <q-icon :name="link.icon" size="15px" />
            {{ link.label }}
          </router-link>
          <router-link v-if="liveMatch" :to="`/matches/${liveMatch.id}`" class="live-badge-btn">
            <span class="live-dot" />LIVE
          </router-link>
        </div>

        <q-btn flat round dense :icon="mobileOpen ? 'close' : 'menu'" class="lt-md q-ml-sm" color="white" @click="mobileOpen = !mobileOpen" />
      </q-toolbar>

      <div v-if="mobileOpen" class="mobile-nav">
        <router-link v-for="link in navLinks" :key="link.path" :to="link.path" class="mobile-nav-link" @click="mobileOpen = false">
          <q-icon :name="link.icon" size="18px" />{{ link.label }}
        </router-link>
        <router-link v-if="liveMatch" :to="`/matches/${liveMatch.id}`" class="mobile-live-btn" @click="mobileOpen = false">
          <span class="live-dot" />LIVE MATCH
        </router-link>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCricketStore } from 'stores/cricket-store'

const store  = useCricketStore()
const liveMatch = computed(() => store.liveMatch)
const mobileOpen = ref(false)

const navLinks = [
  { label: 'Home',    path: '/',        icon: 'home' },
  { label: 'Matches', path: '/matches', icon: 'sports_cricket' },
  { label: 'Players', path: '/players', icon: 'groups' },
  { label: 'Teams',   path: '/teams',   icon: 'emoji_events' },
  { label: 'Manage',  path: '/manage',  icon: 'manage_accounts' },
  { label: 'Admin',   path: '/admin',   icon: 'admin_panel_settings' },
  { label: 'Media',   path: '/media',   icon: 'play_circle' },
]

function toastIcon(type) {
  return { wicket: '🔴', six: '🔵', four: '💙', live: '📡', error: '⚠️', info: '✅', normal: '💬' }[type] || '✅'
}

// ── CRICKET STADIUM CANVAS BACKGROUND ────────────────────────────
let animId = null

onMounted(() => {
  const canvas = document.getElementById('bg-canvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let W = (canvas.width  = window.innerWidth)
  let H = (canvas.height = window.innerHeight)
  const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
  window.addEventListener('resize', onResize)

  // ─ Cricket ball with glowing trail ─────────────────────────────
  const ball = {
    x: 0, y: 0, trail: [], maxTrail: 28, visible: false
  }

  // Animation sequence vars
  let seqTime = 0
  const SEQ_DUR = 3.8
  let hitAngle = 0
  let hitSpeed = 0


  // ─ Floodlights (4 towers) ────────────────────────────────
  const lights = [
    { x: 0.08, y: 0.12 }, { x: 0.92, y: 0.12 },
    { x: 0.15, y: 0.45 }, { x: 0.85, y: 0.45 },
  ]

  // ─ Crowd dots ──────────────────────────────────────────
  const crowd = Array.from({ length: 200 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.38,
    r: Math.random() * 2 + 0.5,
    a: Math.random() * 0.4 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }))

  let t = 0

  function drawStadium() {
    // ─ Sky gradient ─────────────────────────────────────
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0,   '#020810')
    sky.addColorStop(0.4, '#03101f')
    sky.addColorStop(0.7, '#041520')
    sky.addColorStop(1,   '#050d18')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    // ─ Floodlight beams ────────────────────────────────
    lights.forEach((l) => {
      const lx = l.x * W
      const ly = l.y * H
      // Fallback: radial cone effect via triangular fill
      const lightGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly + H * 0.5, H * 0.65)
      lightGrad.addColorStop(0, 'rgba(255,255,220,0.08)')
      lightGrad.addColorStop(0.3, 'rgba(255,255,200,0.03)')
      lightGrad.addColorStop(1, 'rgba(255,255,200,0)')
      ctx.fillStyle = lightGrad
      ctx.beginPath()
      ctx.moveTo(lx, ly)
      ctx.lineTo(lx - W * 0.25, H)
      ctx.lineTo(lx + W * 0.25, H)
      ctx.closePath()
      ctx.fill()

      // Light source dot
      const src = ctx.createRadialGradient(lx, ly, 0, lx, ly, 18)
      src.addColorStop(0, 'rgba(255,255,240,0.9)')
      src.addColorStop(0.4, 'rgba(255,255,200,0.4)')
      src.addColorStop(1, 'rgba(255,255,200,0)')
      ctx.fillStyle = src
      ctx.beginPath()
      ctx.arc(lx, ly, 18, 0, Math.PI * 2)
      ctx.fill()
    })

    // ─ Cricket oval field (ellipse) ──────────────────────────
    const cx = W * 0.5
    const cy = H * 0.72
    const rx = W * 0.44
    const ry = H * 0.22

    // Outer rim (boundary)
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx + 18, ry + 8, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Field gradient
    const field = ctx.createRadialGradient(cx, cy - ry * 0.2, 0, cx, cy, Math.max(rx, ry))
    field.addColorStop(0,   'rgba(20,80,20,0.55)')
    field.addColorStop(0.55,'rgba(15,65,15,0.45)')
    field.addColorStop(0.85,'rgba(10,50,10,0.30)')
    field.addColorStop(1,   'rgba(5,30,5,0)')
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fillStyle = field
    ctx.fill()

    // 30-yard circle
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 8])
    ctx.stroke()
    ctx.setLineDash([])

    // Pitch (rectangle in center)
    const pw = 18
    const ph = 100
    ctx.save()
    ctx.translate(cx, cy - ry * 0.05)
    const pitchG = ctx.createLinearGradient(-pw/2, -ph/2, pw/2, ph/2)
    pitchG.addColorStop(0, 'rgba(200,170,100,0.55)')
    pitchG.addColorStop(1, 'rgba(180,150,80,0.4)')
    ctx.fillStyle = pitchG
    ctx.fillRect(-pw/2, -ph/2, pw, ph)
    // Crease lines
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-pw/2-4, -ph/2+14, pw+8, 1)
    ctx.strokeRect(-pw/2-4,  ph/2-14, pw+8, 1)
    // Stumps
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 5, -ph/2 + 4)
      ctx.lineTo(i * 5, -ph/2 + 18)
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(i * 5,  ph/2 - 4)
      ctx.lineTo(i * 5,  ph/2 - 18)
      ctx.stroke()
    }
    ctx.restore()
  }

  function drawCrowd() {
    crowd.forEach((c) => {
      const flicker = 0.5 + 0.5 * Math.sin(t * 1.5 + c.phase)
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,220,150,${c.a * flicker})`
      ctx.arc(c.x % W, c.y, c.r, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function drawPlayersAndBall() {
    const cx = W * 0.5
    const cy = H * 0.72
    const ry = H * 0.22
    const playY = cy - ry * 0.05 // center of pitch

    // Sequence timing (0.0 to SEQ_DUR)
    seqTime = (seqTime + 0.02) % SEQ_DUR

    // Pitch ends
    const bowlerStartX = cx - 80
    const bowlerReleaseX = cx - 35
    const batsmanX = cx + 40

    // Stick figure styling
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // ── DRAW BOWLER ── (runs from bowlerStartX to bowlerReleaseX)
    let bX = bowlerStartX
    let bArmA = 0
    let bLegA = 0
    if (seqTime < 1.0) {
      // Running up
      const p = seqTime / 1.0
      bX = bowlerStartX + (bowlerReleaseX - bowlerStartX) * p
      bLegA = Math.sin(p * Math.PI * 10) * 0.6 // leg swing
      bArmA = Math.sin(p * Math.PI * 10) * 0.5 // arm swing
    } else if (seqTime >= 1.0 && seqTime < 1.3) {
      // Bowling action
      bX = bowlerReleaseX
      const p = (seqTime - 1.0) / 0.3
      bArmA = -Math.PI * p // windmill arm
      bLegA = 0.5 // front leg planted
    } else {
      // Follow through / resting
      bX = bowlerReleaseX
      bArmA = -Math.PI * 0.8
      bLegA = 0.3
    }

    // Draw Bowler
    ctx.beginPath()
    // head
    ctx.arc(bX, playY - 26, 3.5, 0, Math.PI * 2)
    // body
    ctx.moveTo(bX, playY - 22)
    ctx.lineTo(bX, playY - 10)
    // legs
    ctx.moveTo(bX, playY - 10)
    ctx.lineTo(bX - 5 + bLegA * 10, playY)
    ctx.moveTo(bX, playY - 10)
    ctx.lineTo(bX + 5 - bLegA * 10, playY)
    // arms
    ctx.moveTo(bX, playY - 20)
    ctx.lineTo(bX + Math.sin(bArmA)*12, playY - 20 + Math.cos(bArmA)*12)
    ctx.stroke()

    // ── BALL LOGIC ──
    if (seqTime < 1.1) {
      // Ball in bowler's hand
      ball.visible = false
      ball.trail = []
    } else if (seqTime >= 1.1 && seqTime < 1.5) {
      // Ball travelling to batsman
      if (!ball.visible) {
        ball.visible = true
        ball.x = bowlerReleaseX + Math.sin(-Math.PI)*12
        ball.y = playY - 20 + Math.cos(-Math.PI)*12
      }
      const p = (seqTime - 1.1) / 0.4
      ball.x = bowlerReleaseX + (batsmanX - bowlerReleaseX) * p
      // Add a bounce
      const bounce = Math.sin(Math.PI * p) * -15 // height of arc
      ball.y = playY - 8 + bounce
    } else if (seqTime >= 1.5 && seqTime < 3.2) {
      // Ball hit!
      if (seqTime < 1.55) { // just hit, calc random trajectory
        hitAngle = -(Math.random() * 0.8 + 0.2) // UP and right/left
        if (Math.random() > 0.6) hitAngle = -Math.PI - hitAngle // right or left
        hitSpeed = Math.random() * 8 + 12
      }
      const flightT = (seqTime - 1.5) * 20
      ball.x = batsmanX + Math.cos(hitAngle) * hitSpeed * flightT
      ball.y = playY - 8 + Math.sin(hitAngle) * hitSpeed * flightT + (0.5 * 0.8 * flightT * flightT) // Gravity curve
    } else {
      ball.visible = false
    }

    // ── DRAW BATSMAN ──
    let batAngle = -Math.PI * 0.2 // stance
    if (seqTime >= 1.4 && seqTime < 1.6) {
      // Swinging
      const p = (seqTime - 1.4) / 0.2
      batAngle = -Math.PI * 0.2 + (Math.PI * 0.8) * Math.sin(p * Math.PI)
    } else if (seqTime >= 1.6 && seqTime < 2.0) {
      // Follow through
      batAngle = Math.PI * 0.6
    }

    const batX = batsmanX
    ctx.beginPath()
    // head
    ctx.arc(batX, playY - 26, 3.5, 0, Math.PI * 2)
    // body (slightly leaning)
    ctx.moveTo(batX, playY - 22)
    ctx.lineTo(batX - 2, playY - 10)
    // legs (stance)
    ctx.moveTo(batX - 2, playY - 10)
    ctx.lineTo(batX - 8, playY)
    ctx.moveTo(batX - 2, playY - 10)
    ctx.lineTo(batX + 6, playY)
    ctx.stroke()

    // arms holding bat
    ctx.beginPath()
    ctx.moveTo(batX - 1, playY - 20)
    const handX = batX - 1 + Math.cos(batAngle - Math.PI/2) * 8
    const handY = playY - 20 + Math.sin(batAngle - Math.PI/2) * 8
    ctx.lineTo(handX, handY)
    ctx.stroke()

    // The bat
    ctx.beginPath()
    ctx.moveTo(handX, handY)
    ctx.lineTo(handX + Math.cos(batAngle) * 16, handY + Math.sin(batAngle) * 16)
    ctx.strokeStyle = '#e0a96d' // wood color
    ctx.lineWidth = 3.5
    ctx.stroke()

    // ── DRAW THE BALL ──
    if (ball.visible) {
      // Store trail
      ball.trail.push({ x: ball.x, y: ball.y })
      if (ball.trail.length > ball.maxTrail) ball.trail.shift()

      // Draw trail
      ball.trail.forEach((pt, i) => {
        const frac = i / ball.trail.length
        const r = frac * 6
        const a = frac * 0.45
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 3)
        g.addColorStop(0, `rgba(255,80,80,${a})`)
        g.addColorStop(1, `rgba(255,40,40,0)`)
        ctx.beginPath()
        ctx.fillStyle = g
        ctx.arc(pt.x, pt.y, r * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw ball
      const bg = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 0, ball.x, ball.y, 8)
      bg.addColorStop(0, '#ff8888')
      bg.addColorStop(0.4, '#cc2222')
      bg.addColorStop(1, '#880000')
      ctx.beginPath()
      ctx.fillStyle = bg
      ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2)
      ctx.fill()
      // Glow halo
      const glow = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, 16)
      glow.addColorStop(0, 'rgba(255,60,60,0.3)')
      glow.addColorStop(1, 'rgba(255,60,60,0)')
      ctx.beginPath()
      ctx.fillStyle = glow
      ctx.arc(ball.x, ball.y, 16, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Stars
  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * W, y: Math.random() * H * 0.5,
    r: Math.random() * 1.2 + 0.2,
    a: Math.random() * 0.7 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }))

  function drawStars() {
    stars.forEach((s) => {
      const flicker = 0.6 + 0.4 * Math.sin(t * 0.8 + s.phase)
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,255,255,${s.a * flicker})`
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function frame() {
    ctx.clearRect(0, 0, W, H)
    t += 0.016
    drawStadium()
    drawStars()
    drawCrowd()
    drawPlayersAndBall()
    animId = requestAnimationFrame(frame)
  }
  frame()
})




onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
/* ── Base layout ──────────────────────────────── */
.main-layout { background: #030b18; min-height: 100vh; position: relative; }

/* ── Animated background canvas ──────────────── */
.bg-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  opacity: 0.9;
}

/* ── Gradient orbs ────────────────────────────── */
.bg-orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  animation: float 18s ease-in-out infinite;
}
.orb1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,212,255,0.14), transparent 70%); top: -10%; left: -10%; animation-delay: 0s; }
.orb2 { width: 420px; height: 420px; background: radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%); bottom: 10%; right: -5%; animation-delay: -6s; }
.orb3 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(255,61,87,0.08), transparent 70%); top: 50%; left: 40%; animation-delay: -12s; }
.orb4 { width: 280px; height: 280px; background: radial-gradient(circle, rgba(34,197,94,0.08), transparent 70%); bottom: 30%; left: 10%; animation-delay: -9s; }
@keyframes float {
  0%,100% { transform: translate(0,0) scale(1); }
  25%      { transform: translate(30px,-20px) scale(1.05); }
  50%      { transform: translate(-15px,30px) scale(0.95); }
  75%      { transform: translate(20px,10px) scale(1.02); }
}

/* ── Toast notifications ──────────────────────── */
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 380px;
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08);
  background: rgba(10, 20, 40, 0.88);
  border-left: 3px solid;
  pointer-events: auto;
}
.toast-info    { border-color: #22c55e; }
.toast-error   { border-color: #ff3d57; background: rgba(40,8,16,0.9); }
.toast-live    { border-color: #ff3d57; box-shadow: 0 0 0 1px rgba(255,61,87,0.2), 0 8px 32px rgba(0,0,0,0.4); }
.toast-wicket  { border-color: #ff3d57; }
.toast-six     { border-color: #a855f7; }
.toast-four    { border-color: #00d4ff; }
.toast-normal  { border-color: rgba(255,255,255,0.2); }
.toast-icon { font-size: 16px; flex-shrink: 0; }
.toast-text { line-height: 1.3; }

/* Toast enter/leave animations */
.toast-enter-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { transition: all 0.25s ease-in; }
.toast-enter-from   { opacity: 0; transform: translateX(80px) scale(0.95); }
.toast-leave-to     { opacity: 0; transform: translateX(80px) scale(0.9); }
.toast-move         { transition: transform 0.3s ease; }

/* ── Header ───────────────────────────────────── */
.layout-header {
  background: rgba(3, 11, 24, 0.80) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  box-shadow: 0 4px 40px rgba(0,0,0,0.5);
  position: relative;
  z-index: 100;
}
.toolbar-inner { max-width: 1440px; margin: 0 auto; padding: 0 28px; height: 68px; }

/* Brand */
.brand-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.brand-icon {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #00d4ff, #0066cc);
  border-radius: 11px; display: flex; align-items: center;
  justify-content: center; font-size: 20px;
  box-shadow: 0 0 22px rgba(0,212,255,0.4);
  animation: brand-pulse 3s ease infinite;
}
@keyframes brand-pulse {
  0%,100% { box-shadow: 0 0 18px rgba(0,212,255,0.35); }
  50%      { box-shadow: 0 0 32px rgba(0,212,255,0.6); }
}
.brand-name { display: block; font-size: 16px; font-weight: 900; color: #fff; letter-spacing: -0.3px; line-height: 1.1; }
.brand-sub  { display: block; font-size: 10px; color: #00d4ff; font-weight: 600; letter-spacing: 0.5px; }

/* Nav */
.desktop-nav { display: flex; align-items: center; gap: 2px; }
.nav-link {
  display: flex; align-items: center; gap: 6px; padding: 7px 12px;
  border-radius: 8px; text-decoration: none; font-size: 12.5px;
  font-weight: 600; color: rgba(255,255,255,0.5); transition: all 0.2s;
}
.nav-link:hover { background: rgba(0,212,255,0.08); color: #00d4ff; }
.nav-active { background: rgba(0,212,255,0.12) !important; color: #00d4ff !important; }
.live-badge-btn {
  display: flex; align-items: center; gap: 5px; margin-left: 6px;
  padding: 7px 13px; background: linear-gradient(135deg, #ff3d57, #cc0030);
  border-radius: 8px; font-size: 11px; font-weight: 900; color: white;
  text-decoration: none; letter-spacing: 1px;
  box-shadow: 0 0 20px rgba(255,0,64,0.45);
  animation: pulsered 2s infinite;
}
.live-dot {
  width: 6px; height: 6px; background: white; border-radius: 50%;
  animation: blink 1s infinite; flex-shrink: 0;
}
@keyframes blink     { 0%,100%{opacity:1}50%{opacity:0.2} }
@keyframes pulsered  { 0%,100%{box-shadow:0 0 16px rgba(255,0,64,0.45)}50%{box-shadow:0 0 30px rgba(255,0,64,0.75)} }

/* Mobile nav */
.mobile-nav { display: flex; flex-direction: column; padding: 8px 0; border-top: 1px solid rgba(0,212,255,0.08); background: rgba(3,11,24,0.97); backdrop-filter: blur(20px); }
.mobile-nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 24px; color: rgba(255,255,255,0.65); text-decoration: none; font-size: 14px; font-weight: 600; transition: all 0.2s; }
.mobile-nav-link:hover { background: rgba(0,212,255,0.07); color: #00d4ff; }
.mobile-live-btn { display: flex; align-items: center; gap: 8px; margin: 10px 20px; padding: 11px 16px; background: linear-gradient(135deg,#ff3d57,#cc0030); border-radius: 10px; color: white; font-weight: 800; font-size: 13px; text-decoration: none; letter-spacing: 1px; }

/* Footer */
.layout-footer { background: rgba(3,11,24,0.92) !important; backdrop-filter: blur(20px); border-top: 1px solid rgba(0,212,255,0.08); padding: 10px 0; position: relative; z-index: 10; }
.footer-inner  { max-width: 1440px; margin: 0 auto; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; }
.footer-brand  { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 600; }
.footer-links  { display: flex; align-items: center; gap: 8px; font-size: 11px; color: rgba(255,255,255,0.3); }
.footer-link   { color: #00d4ff; text-decoration: none; font-weight: 600; }
.footer-sep    { opacity: 0.3; }
.footer-credit { color: rgba(255,255,255,0.45); }
.footer-credit strong { color: #00d4ff; font-weight: 700; }

/* Page transition */
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to   { opacity: 0; transform: translateY(-4px); }

/* Ensure page content renders above the background canvas */
:global(.q-page-container) { position: relative; z-index: 1; }
:global(.q-header)         { z-index: 100 !important; }
:global(.q-footer)         { z-index: 10 !important; }
</style>
