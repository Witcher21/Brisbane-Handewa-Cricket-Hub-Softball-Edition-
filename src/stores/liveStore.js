import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLiveStore = defineStore('live', () => {
  const socket = ref(null)
  const isConnected = ref(false)
  const lastScore = ref(null)

  // Reconnection options
  let reconnectTimer = null
  let reconnectAttempts = 0
  const MAX_RECONNECT_DELAY = 10000 // 10 seconds Max Wait

  /**
   * Connects to the FastAPI WebSocket.
   * Auto-reconnects if the connection drops.
   */
  function connectToLiveMatch(matchId) {
    // If already connected, do nothing
    if (socket.value && socket.value.readyState === WebSocket.OPEN) return

    const wsUrl = `ws://localhost:8000/ws/live/${matchId}`
    console.log(`🔌 Connecting to Live Server: ${wsUrl}`)

    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('✅ Connected to Match Live Stream!')
      isConnected.value = true
      reconnectAttempts = 0 // Reset attempts

      // Stop any pending reconnect timers
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }

    socket.value.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      console.log('📡 Live Data Received:', payload)

      // Update match details based on server data
      if (payload.type === 'init' || payload.type === 'delivery') {
        lastScore.value = payload.data
      }
    }

    socket.value.onclose = (event) => {
      console.warn('❌ WebSocket connection closed', event.reason)
      isConnected.value = false
      scheduleReconnect(matchId)
    }

    socket.value.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error)
      // socket.onerror is usually followed by onclose, so we rely on onclose to reconnect
    }
  }

  function scheduleReconnect(matchId) {
    if (reconnectTimer) clearTimeout(reconnectTimer)

    // Calculate delay with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY)
    reconnectAttempts++

    console.log(`⏳ Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts})`)

    reconnectTimer = setTimeout(() => {
      console.log('🔄 Attempting to reconnect...')
      connectToLiveMatch(matchId)
    }, delay)
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  return {
    socket,
    isConnected,
    lastScore,
    connectToLiveMatch,
    disconnect,
  }
})
