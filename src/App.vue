<template>
  <div id="app">
    <!-- Step 1: Auth page -->
    <Auth v-if="screen === 'auth'" @authSuccess="goToMain" />

    <!-- Step 2: Main page (contains navigation to the rest) -->
    <Main
      v-else-if="screen === 'main'"
      @select="screen = $event"
    />

    <!-- Step 3: Sub pages -->
    <MarketPlace v-if="screen === 'market'" />
    <FarmingGuide v-if="screen === 'guide'" />
    <DiseaseDetector v-if="screen === 'disease'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import './assets/style/ai_style.css'

// Import all components
import Auth from './components/Auth.vue'
import Main from './components/Main.vue'
import MarketPlace from './components/MarketPlace.vue'
import FarmingGuide from './components/FarmingGuide.vue'
import DiseaseDetector from './components/DiseaseDetector.vue'

// Screen controller
const screen = ref('auth') // Default page → Auth first

// Move from Auth to Main after successful login
function goToMain() {
  screen.value = 'main'
}
</script>

<style>
#app {
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}
</style>
