<template>
  <div class="auth-root">
    <!-- Full-screen animated cricket canvas background -->
    <canvas ref="bgCanvas" class="auth-canvas"></canvas>

    <!-- Floating particles -->
    <div class="particles">
      <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)">🏏</span>
    </div>

    <!-- Centered auth card -->
    <div class="auth-card-wrapper">
      <div class="auth-card" :class="{ 'card-shake': shaking }">
        <!-- Logo / Brand -->
        <div class="brand-header">
          <div class="logo-ring">
            <div class="logo-inner">
              <span class="logo-emoji">🏏</span>
            </div>
          </div>
          <h1 class="brand-title">Brisbane Handewa</h1>
          <p class="brand-sub">Cricket Hub · Softball Edition</p>
        </div>

        <!-- Mode title with animated transition -->
        <div class="mode-title-wrap">
          <transition name="slide-up" mode="out-in">
            <p :key="isSignUp" class="mode-title">
              {{ isSignUp ? '✨ Create Your Account' : '⚡ Welcome Back' }}
            </p>
          </transition>
        </div>

        <!-- Offline banner -->
        <transition name="fade">
          <div v-if="!isOnline" class="offline-banner">
            <span>📵</span> You're offline — connect to continue
          </div>
        </transition>

        <!-- Error banner -->
        <transition name="fade">
          <div v-if="errorMsg" class="error-banner"><span>⚠️</span> {{ errorMsg }}</div>
        </transition>

        <!-- Form -->
        <form class="auth-form" @submit.prevent="onSubmit">
          <div class="field-group" :class="{ focused: focusedField === 'username' }">
            <span class="field-icon">👤</span>
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              class="auth-input"
              autocomplete="username"
              :disabled="!isOnline || loading"
              @focus="focusedField = 'username'"
              @blur="focusedField = null"
            />
          </div>

          <div class="field-group" :class="{ focused: focusedField === 'password' }">
            <span class="field-icon">🔑</span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password (min 6 chars)"
              class="auth-input"
              autocomplete="current-password"
              :disabled="!isOnline || loading"
              @focus="focusedField = 'password'"
              @blur="focusedField = null"
            />
            <button
              type="button"
              class="toggle-pw"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>

          <button
            type="submit"
            class="auth-btn"
            :class="{ 'btn-loading': loading }"
            :disabled="!isOnline || loading || !username || !password"
          >
            <span v-if="!loading" class="btn-content">
              <span class="btn-icon">{{ isSignUp ? '🚀' : '⚡' }}</span>
              {{ isSignUp ? 'Create Account' : 'Sign In' }}
            </span>
            <span v-else class="btn-spinner">
              <span class="spinner-ring"></span> {{ isSignUp ? 'Creating...' : 'Signing in...' }}
            </span>
          </button>
        </form>

        <!-- Toggle mode -->
        <div class="toggle-mode" @click="toggleMode">
          <transition name="slide-up" mode="out-in">
            <span :key="isSignUp">
              {{ isSignUp ? 'Already a member?' : 'New to the hub?' }}
              <strong>{{ isSignUp ? 'Sign In' : 'Join Now' }}</strong>
            </span>
          </transition>
        </div>

        <!-- Footer -->
        <p class="auth-footer">🏆 GNS CRIC · 2026 · Brisbane</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from 'stores/authStore'

const authStore = useAuthStore()

// Form state
const isSignUp = ref(false)
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const shaking = ref(false)
const showPassword = ref(false)
const focusedField = ref(null)
const isOnline = ref(navigator.onLine)

// Canvas ref
const bgCanvas = ref(null)
let animId = null

// Online status
const updateOnline = () => {
  isOnline.value = navigator.onLine
}
onMounted(() => {
  window.addEventListener('online', updateOnline)
  window.addEventListener('offline', updateOnline)
  startCanvas()
})
onUnmounted(() => {
  window.removeEventListener('online', updateOnline)
  window.removeEventListener('offline', updateOnline)
  if (animId) cancelAnimationFrame(animId)
})

function toggleMode() {
  isSignUp.value = !isSignUp.value
  errorMsg.value = ''
}

function shake() {
  shaking.value = true
  setTimeout(() => (shaking.value = false), 600)
}

// Particle styles
function particleStyle(i) {
  const delay = (i * 0.7) % 8
  const dur = 6 + (i % 5)
  const left = (i * 19) % 100
  const size = 0.6 + (i % 4) * 0.3
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${dur}s`,
    fontSize: `${size}rem`,
    opacity: 0.15 + (i % 3) * 0.08,
  }
}

async function onSubmit() {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = 'Please enter your username and password.'
    shake()
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters.'
    shake()
    return
  }
  if (!isOnline.value) {
    errorMsg.value = 'You need internet to use this app.'
    shake()
    return
  }

  loading.value = true
  let success = false
  try {
    success = isSignUp.value
      ? await authStore.signup(username.value, password.value)
      : await authStore.login(username.value, password.value)
  } catch {
    success = false
  }
  loading.value = false

  if (success) {
    window.location.replace('/')
  } else {
    errorMsg.value = authStore.error || 'Authentication failed. Please try again.'
    shake()
  }
}

// ── ANIMATED CANVAS BACKGROUND ───────────────────────────────────
function startCanvas() {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let W = (canvas.width = window.innerWidth)
  let H = (canvas.height = window.innerHeight)

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth
    H = canvas.height = window.innerHeight
  })

  // Cricket balls
  const balls = Array.from({ length: 6 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 1.8,
    vy: (Math.random() - 0.5) * 1.8,
    r: 8 + Math.random() * 10,
    hue: 0,
    trail: [],
    phase: Math.random() * Math.PI * 2,
  }))

  // Stars
  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.2,
    a: Math.random() * 0.6 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }))

  // Floating text lines (cricket terms)
  const floaters = ['CRICKET', 'BRISBANE', '2026', 'HANDEWA', 'SOFTBALL', 'GNS CRIC'].map((t) => ({
    text: t,
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.15 - Math.random() * 0.2,
    alpha: 0.03 + Math.random() * 0.04,
    size: 18 + Math.random() * 30,
  }))

  let t = 0

  function frame() {
    ctx.clearRect(0, 0, W, H)

    // Deep dark gradient
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#020818')
    bg.addColorStop(0.5, '#050f1f')
    bg.addColorStop(1, '#030a14')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Radial glow center
    const cx = W / 2,
      cy = H / 2
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6)
    glow.addColorStop(0, 'rgba(0,180,255,0.04)')
    glow.addColorStop(0.5, 'rgba(0,80,180,0.02)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(0,200,255,0.03)'
    ctx.lineWidth = 1
    for (let gx = 0; gx < W; gx += 80) {
      ctx.beginPath()
      ctx.moveTo(gx, 0)
      ctx.lineTo(gx, H)
      ctx.stroke()
    }
    for (let gy = 0; gy < H; gy += 80) {
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.lineTo(W, gy)
      ctx.stroke()
    }

    t += 0.015

    // Stars
    stars.forEach((s) => {
      const flicker = 0.5 + 0.5 * Math.sin(t * 1.2 + s.phase)
      ctx.beginPath()
      ctx.arc(s.x + Math.sin(t * 0.3 + s.phase) * 2, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200,220,255,${s.a * flicker})`
      ctx.fill()
    })

    // Floating text
    floaters.forEach((f) => {
      f.x += f.vx
      f.y += f.vy
      if (f.y < -50) {
        f.y = H + 50
        f.x = Math.random() * W
      }
      if (f.x < -100) f.x = W + 100
      if (f.x > W + 100) f.x = -100
      ctx.font = `bold ${f.size}px 'Roboto', sans-serif`
      ctx.fillStyle = `rgba(0,180,255,${f.alpha})`
      ctx.fillText(f.text, f.x, f.y)
    })

    // Cricket balls with glow trails
    balls.forEach((b) => {
      b.x += b.vx
      b.y += b.vy
      b.phase += 0.02
      if (b.x < 0 || b.x > W) b.vx *= -1
      if (b.y < 0 || b.y > H) b.vy *= -1

      b.trail.push({ x: b.x, y: b.y })
      if (b.trail.length > 22) b.trail.shift()

      // Trail glow
      b.trail.forEach((pt, i) => {
        const frac = i / b.trail.length
        const tr = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, b.r * 2 * frac)
        tr.addColorStop(0, `rgba(255,60,60,${frac * 0.3})`)
        tr.addColorStop(1, `rgba(255,0,0,0)`)
        ctx.beginPath()
        ctx.fillStyle = tr
        ctx.arc(pt.x, pt.y, b.r * 2 * frac, 0, Math.PI * 2)
        ctx.fill()
      })

      // Ball
      const ballG = ctx.createRadialGradient(b.x - 2, b.y - 2, 0, b.x, b.y, b.r)
      ballG.addColorStop(0, '#ff9999')
      ballG.addColorStop(0.4, '#cc2222')
      ballG.addColorStop(1, '#6b0000')
      ctx.beginPath()
      ctx.fillStyle = ballG
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()

      // Seam line
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r * 0.8, b.phase, b.phase + Math.PI)
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Outer glow
      const outerG = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 3)
      outerG.addColorStop(0, 'rgba(255,60,60,0.15)')
      outerG.addColorStop(1, 'rgba(255,0,0,0)')
      ctx.beginPath()
      ctx.fillStyle = outerG
      ctx.arc(b.x, b.y, b.r * 3, 0, Math.PI * 2)
      ctx.fill()
    })

    animId = requestAnimationFrame(frame)
  }

  frame()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* {
  box-sizing: border-box;
}

.auth-root {
  position: fixed;
  inset: 0;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* Floating cricket bat particles */
.particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.particle {
  position: absolute;
  top: 110%;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

/* Card wrapper */
.auth-card-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  padding: 16px;
}

/* Card */
.auth-card {
  background: rgba(5, 15, 35, 0.75);
  backdrop-filter: blur(32px) saturate(1.5);
  -webkit-backdrop-filter: blur(32px) saturate(1.5);
  border: 1px solid rgba(0, 180, 255, 0.15);
  border-radius: 28px;
  padding: 48px 40px 36px;
  box-shadow:
    0 0 0 1px rgba(0, 180, 255, 0.05),
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 100, 255, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.2s;
}
@media (max-width: 600px) {
  .auth-card {
    padding: 36px 24px 28px;
  }
}

/* Shake animation */
.card-shake {
  animation: shake 0.5s ease;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}

/* Brand header */
.brand-header {
  text-align: center;
  margin-bottom: 24px;
}
.logo-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #00d4ff, #0066ff, #cc2222, #ff6600, #00d4ff);
  padding: 3px;
  margin: 0 auto 16px;
  animation: spinRing 8s linear infinite;
}
@keyframes spinRing {
  to {
    transform: rotate(360deg);
  }
}
.logo-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #030b18;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-emoji {
  font-size: 2rem;
}
.brand-title {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d4ff 0%, #0088ff 50%, #00ffaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}
.brand-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Mode title */
.mode-title-wrap {
  text-align: center;
  margin-bottom: 20px;
  min-height: 28px;
}
.mode-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Banners */
.offline-banner,
.error-banner {
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.offline-banner {
  background: rgba(255, 60, 60, 0.15);
  border: 1px solid rgba(255, 60, 60, 0.3);
  color: #ff8888;
}
.error-banner {
  background: rgba(255, 140, 0, 0.12);
  border: 1px solid rgba(255, 140, 0, 0.3);
  color: #ffaa44;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.field-group {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0 16px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
  height: 52px;
}
.field-group.focused {
  border-color: rgba(0, 180, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 180, 255, 0.08);
  background: rgba(0, 180, 255, 0.04);
}
.field-icon {
  font-size: 1rem;
  margin-right: 10px;
  flex-shrink: 0;
}
.auth-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e8f4ff;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}
.auth-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
  font-weight: 400;
}
.auth-input:disabled {
  opacity: 0.4;
}
.toggle-pw {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  margin-left: 8px;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.toggle-pw:hover {
  opacity: 1;
}

/* Submit button */
.auth-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #0066ff 0%, #00aaff 50%, #00d4ff 100%);
  color: white;
  letter-spacing: 0.3px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  margin-top: 4px;
}
.auth-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
}
.auth-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 150, 255, 0.4);
}
.auth-btn:active:not(:disabled) {
  transform: translateY(0);
}
.auth-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-icon {
  font-size: 1.1rem;
}
.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.spinner-ring {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Toggle mode */
.toggle-mode {
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition:
    color 0.2s,
    background 0.2s;
  margin-bottom: 12px;
}
.toggle-mode:hover {
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.04);
}
.toggle-mode strong {
  color: #00d4ff;
  font-weight: 700;
}

/* Footer */
.auth-footer {
  text-align: center;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.18);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
