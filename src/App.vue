<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from 'stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  // Wait for Firebase to resolve auth state (like Instagram on startup)
  const user = await auth.initAuth()

  // If not logged in and not already on login page, redirect
  const currentRoute = router.currentRoute.value
  if (!user && currentRoute.meta.requiresAuth) {
    router.push('/login')
  }
})
</script>
