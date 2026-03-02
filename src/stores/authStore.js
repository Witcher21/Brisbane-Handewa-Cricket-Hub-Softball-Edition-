/**
 * src/stores/authStore.js
 * ────────────────────────
 * Firebase Authentication — Instagram/Facebook grade persistent sessions.
 * Users stay logged in forever (until they manually logout).
 * Credentials are stored securely in Firebase — server restarts don't affect them.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { firebaseSignIn, firebaseSignUp, firebaseLogout, onAuthChange } from 'src/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────
  const user = ref(null) // Firebase user object
  const loading = ref(true) // true until Firebase resolves auth state
  const error = ref(null)

  // ── Getters ────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!user.value)
  const username = computed(
    () => user.value?.displayName || user.value?.email?.split('@')[0] || 'User',
  )
  const uid = computed(() => user.value?.uid || null)

  // ── Actions ────────────────────────────────────────────────────

  /**
   * initAuth()
   * Called ONCE on App.vue onMounted.
   * Firebase automatically restores session from IndexedDB (like Instagram).
   * Returns a promise that resolves when auth state is known.
   */
  function initAuth() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthChange((firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
        unsubscribe() // Only need it once on startup
        resolve(firebaseUser)
      })
    })
  }

  /**
   * login(username, password)
   * Sign in with username + password via Firebase Auth.
   */
  async function login(usernameVal, password) {
    loading.value = true
    error.value = null
    try {
      const firebaseUser = await firebaseSignIn(usernameVal, password)
      user.value = firebaseUser
      return true
    } catch (err) {
      error.value = _friendlyError(err.code)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * signup(username, password)
   * Create a new account — user is instantly logged in after signup.
   */
  async function signup(usernameVal, password) {
    loading.value = true
    error.value = null
    try {
      const firebaseUser = await firebaseSignUp(usernameVal, password)
      user.value = firebaseUser
      return true
    } catch (err) {
      error.value = _friendlyError(err.code)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * logout()
   * Signs out the user from Firebase. Clears session everywhere.
   */
  async function logout() {
    await firebaseLogout()
    user.value = null
    error.value = null
  }

  // ── Helper: Convert Firebase error codes to human-friendly messages ──
  function _friendlyError(code) {
    const messages = {
      'auth/user-not-found': 'No account found with this username.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Incorrect username or password.',
      'auth/email-already-in-use': 'This username is already taken. Please choose another.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Check your internet connection.',
    }
    return messages[code] || 'Authentication failed. Please try again.'
  }

  return {
    user,
    loading,
    error,
    isLoggedIn,
    username,
    uid,
    initAuth,
    login,
    signup,
    logout,
  }
})
