import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default async ({ app }) => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  // Initialize cloud sync after pinia is ready
  // This pulls the latest data from Firebase (if configured) and subscribes to real-time updates
  const { useCricketStore } = await import('stores/cricket-store')
  const store = useCricketStore()
  await store.initCloudSync()
}
