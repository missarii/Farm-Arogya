// src/router.js
import { createRouter, createWebHistory } from 'vue-router'

// Import components
import Auth from './components/Auth.vue'
import Main from './components/Main.vue'
import MarketPlace from './components/MarketPlace.vue'
import FarmingGuide from './components/FarmingGuide.vue'
import DiseaseDetector from './components/DiseaseDetector.vue'

// Define routes
const routes = [
  { path: '/', component: Auth },                    // First page
  { path: '/main', component: Main },                // After auth
  { path: '/market', component: MarketPlace },       // Inside main navigation
  { path: '/guide', component: FarmingGuide },
  { path: '/disease', component: DiseaseDetector }
]

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
