/**
 * src/boot/axios.js
 * ──────────────────
 * Configures a global Axios instance with:
 *  1. The FastAPI backend base URL
 *  2. A REQUEST interceptor that automatically injects the JWT
 *     "Authorization: Bearer <token>" header on every outgoing call
 *  3. A RESPONSE interceptor that auto-logs-out on 401 Unauthorized
 *
 * Usage in components:
 *   import { api } from 'boot/axios'
 *   const { data } = await api.get('/api/my-stats')   // JWT auto-attached
 */

import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// ── Smart API base: production → Render, dev → localhost ──────────
const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://brisbane-handewa-cricket-api.onrender.com'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Boot: runs once at app startup ───────────────────────────────
export default defineBoot(({ app }) => {
  // ── REQUEST interceptor ─────────────────────────────────────
  // Automatically attach JWT to every request if the user is logged in.
  // We import the store lazily here (inside the function) to avoid
  // circular dependency issues at module load time.
  api.interceptors.request.use(
    (config) => {
      // Lazy import avoids circular import issues
      const token = localStorage.getItem('cricket_hub_token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // ── RESPONSE interceptor ────────────────────────────────────
  // Auto-logout: if the server returns 401 (expired/invalid token),
  // clear localStorage and redirect to login.
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired — clear auth state
        localStorage.removeItem('cricket_hub_token')
        localStorage.removeItem('cricket_hub_user')
        // Redirect to login page if not already there
        const currentPath = window.location.pathname
        if (!currentPath.includes('/login')) {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    },
  )

  // Make available globally in Vue components
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
