import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { auth } from 'src/services/firebase'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Global Auth Guard — uses Firebase Auth (not localStorage)
  Router.beforeEach((to, from, next) => {
    const firebaseUser = auth.currentUser

    if (to.meta.requiresAuth && !firebaseUser) {
      // Not logged in → go to login
      next('/login')
    } else if (to.meta.requiresGuest && firebaseUser) {
      // Already logged in → go home
      next('/')
    } else {
      next()
    }
  })

  return Router
})
