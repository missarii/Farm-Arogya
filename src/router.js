import { createRouter, createWebHistory } from 'vue-router'

// Import components
import Auth from './components/Auth.vue'
import Main from './components/Main.vue'
import MarketPlace from './components/MarketPlace.vue'
import FarmingGuide from './components/FarmingGuide.vue'
import AccessoryTools from './components/AccessoryTools.vue'
import Fertilizer from './components/Fertilizer.vue'
import AdminPanel from './components/AdminPanel.vue'

// Define routes
const routes = [
  { path: '/', component: Auth },
  { path: '/main', component: Main },
  { path: '/market', component: MarketPlace },
  { path: '/guide', component: FarmingGuide },
  { path: '/tools', component: AccessoryTools },
  { path: '/fertilizer', component: Fertilizer },
  { path: '/admin', component: AdminPanel },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

  if (to.path !== '/' && !currentUser) {
    next('/')
  } else if (to.path === '/admin' && currentUser?.role !== 'admin') {
    next('/main')
  } else if (to.path === '/' && currentUser) {
    next('/main')
  } else {
    next()
  }
})

export default router