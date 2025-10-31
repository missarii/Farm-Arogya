import { createRouter, createWebHistory } from 'vue-router'

// Import components
import Auth from './components/Auth.vue'
import Main from './components/Main.vue'
import MarketPlace from './components/MarketPlace.vue'
import FarmingGuide from './components/FarmingGuide.vue'
import AccessoryTools from './components/AccessoryTools.vue'
import Fertilizer from './components/Fertilizer.vue'

// Define routes
const routes = [
  { path: '/', component: Auth },
  { path: '/main', component: Main },
  { path: '/market', component: MarketPlace },
  { path: '/guide', component: FarmingGuide },
  { path: '/tools', component: AccessoryTools },
  { path: '/fertilizer', component: Fertilizer },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router