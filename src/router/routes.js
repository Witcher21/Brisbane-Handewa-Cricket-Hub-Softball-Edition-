const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',           component: () => import('pages/IndexPage.vue') },
      { path: 'players',    component: () => import('pages/PlayersPage.vue') },
      { path: 'players/:id', component: () => import('pages/PlayerProfilePage.vue') },
      { path: 'teams',      component: () => import('pages/TeamsPage.vue') },
      { path: 'teams/:id',  component: () => import('pages/TeamPage.vue') },
      { path: 'matches',    component: () => import('pages/MatchesPage.vue') },
      { path: 'matches/:id', component: () => import('pages/MatchCenterPage.vue') },
      { path: 'admin',      component: () => import('pages/AdminPage.vue') },
      { path: 'manage',     component: () => import('pages/ManagePage.vue') },
      { path: 'media',      component: () => import('pages/MediaPage.vue') },
    ],
  },
  {
    path: '/broadcast-overlay',
    component: () => import('pages/BroadcastOverlay.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
