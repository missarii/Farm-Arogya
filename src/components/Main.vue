<template>
  <div class="intro-page" :style="{ backgroundImage: `url('${currentBg}')` }">
    <div class="overlay"></div>

    <h1 class="fade-in">
      <span class="welcome-text">🌿 Welcome to</span>
      <span :class="farmarogyaClass">
        <template v-for="(char, index) in letters" :key="index">
          <span
            class="letter"
            :class="{ staggered: isStaggered(index) }"
            :style="{ animationDelay: getDelay(index) + 's' }"
          >
            {{ char }}
          </span>
        </template>
      </span>
    </h1>

    <p class="subtitle fade-in">Choose what you want to do:</p>

    <div class="options">
      <!-- First Row: 3 items (now on top) -->
      <div class="row second-row">
        <div class="option" @mouseenter="handleSoilHover" @click="emitSelect('soiltest')">
          <img :src="currentSoilImg" alt="Environmental AI Test" />
          <p>Environmental AI Test</p>
        </div>

        <div class="option" @mouseenter="handleToolsHover" @click="emitSelect('tools')">
          <img :src="currentToolsImg" alt="Accessory Tools" />
          <p>Accessory Tools</p>
        </div>

        <div class="option" @mouseenter="handleFertilizerHover" @click="emitSelect('fertilizer')">
          <img :src="currentFertilizerImg" alt="Fertilizer & Chemicals" />
          <p>Fertilizer & Chemicals</p>
        </div>
      </div>

      <!-- Second Row: 4 items (now below) -->
      <div class="row first-row">
        <div class="option" @mouseenter="handleMarketHover" @click="emitSelect('market')">
          <img :src="currentMarketImg" alt="Buy & Sell" />
          <p>Buy & Sell</p>
        </div>

        <div class="option" @mouseenter="handleFarmHover" @click="emitSelect('guide')">
          <img :src="currentFarmImg" alt="Farming Guide" />
          <p>Farming Guide</p>
        </div>

        <div class="option" @mouseenter="handleToolsHover" @click="emitSelect('tools')">
          <img :src="currentToolsImg" alt="AI Chat" />
          <p>AI Chat</p>
        </div>

        <div class="option" @mouseenter="handleDiseaseHover" @click="emitSelect('disease')">
          <img :src="currentDiseaseImg" alt="Disease Detection" />
          <p>Disease Detection</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['select'])
const emitSelect = (payload) => emit('select', payload)

// -----------------------------
// Import Images
// -----------------------------
import market1 from '../assets/market1.png'
import market2 from '../assets/market2.png'
import market3 from '../assets/market3.png'
import market4 from '../assets/market4.png'

import farm1 from '../assets/farm1.png'
import farm2 from '../assets/farm2.png'
import farm3 from '../assets/farm3.png'
import farm4 from '../assets/farm4.png'

import disease1 from '../assets/disease1.png'
import disease2 from '../assets/disease2.png'
import disease3 from '../assets/disease3.png'
import disease4 from '../assets/disease4.png'

import soil1 from '../assets/soil1.png'
import soil2 from '../assets/soil2.png'
import soil3 from '../assets/soil3.png'
import soil4 from '../assets/soil4.png'

import tools1 from '../assets/tools1.png'
import tools2 from '../assets/tools2.png'
import tools3 from '../assets/tools3.png'
import tools4 from '../assets/tools4.png'

import fert1 from '../assets/fert1.png'
import fert2 from '../assets/fert2.png'
import fert3 from '../assets/fert3.png'
import fert4 from '../assets/fert4.png'

// -----------------------------
// Reactive Current Images
// -----------------------------
const currentMarketImg = ref(market1)
const currentFarmImg = ref(farm1)
const currentDiseaseImg = ref(disease1)
const currentSoilImg = ref(soil1)
const currentToolsImg = ref(tools1)
const currentFertilizerImg = ref(fert1)

// Arrays
const marketImages = [market1, market2, market3, market4]
const farmImages = [farm1, farm2, farm3, farm4]
const diseaseImages = [disease1, disease2, disease3, disease4]
const soilImages = [soil1, soil2, soil3, soil4]
const toolsImages = [tools1, tools2, tools3, tools4]
const fertilizerImages = [fert1, fert2, fert3, fert4]

// Indices
let marketIndex=0, farmIndex=0, diseaseIndex=0, soilIndex=0, toolsIndex=0, fertilizerIndex=0

// Hover Handlers (change image + background)
const handleMarketHover = () => { setBg('market'); marketIndex=(marketIndex+1)%marketImages.length; currentMarketImg.value=marketImages[marketIndex] }
const handleFarmHover = () => { setBg('guide'); farmIndex=(farmIndex+1)%farmImages.length; currentFarmImg.value=farmImages[farmIndex] }
const handleDiseaseHover = () => { setBg('disease'); diseaseIndex=(diseaseIndex+1)%diseaseImages.length; currentDiseaseImg.value=diseaseImages[diseaseIndex] }
const handleSoilHover = () => { setBg('soiltest'); soilIndex=(soilIndex+1)%soilImages.length; currentSoilImg.value=soilImages[soilIndex] }
const handleToolsHover = () => { setBg('tools'); toolsIndex=(toolsIndex+1)%toolsImages.length; currentToolsImg.value=toolsImages[toolsIndex] }
const handleFertilizerHover = () => { setBg('fertilizer'); fertilizerIndex=(fertilizerIndex+1)%fertilizerImages.length; currentFertilizerImg.value=fertilizerImages[fertilizerIndex] }

// -----------------------------
// Background
// -----------------------------
const defaultBg='/images/main.jpg'
const currentBg=ref(defaultBg)
const bgMap={
  market:['/images/Market/1.jpg','/images/Market/2.jpg','/images/Market/3.jpg','/images/Market/4.jpg'],
  guide:['/images/Guide/1.jpg','/images/Guide/2.jpg','/images/Guide/3.jpg','/images/Guide/4.jpg','/images/Guide/5.jpg'],
  disease:['/images/Disease/1.jpg','/images/Disease/2.jpg','/images/Disease/3.jpg','/images/Disease/4.jpg'],
  soiltest:['/images/SoilTest/1.jpg','/images/SoilTest/2.jpg'],
  tools:['/images/Tools/1.jpg','/images/Tools/2.jpg'],
  fertilizer:['/images/Fertilizer/1.jpg','/images/Fertilizer/2.jpg']
}
const setBg=(type)=>{
  const options=bgMap[type]
  if(options && options.length>0){ currentBg.value = options[Math.floor(Math.random()*options.length)] }
  else { currentBg.value=defaultBg }
}

// -----------------------------
// Title animation
// -----------------------------
const letters='FarmArogya'.split('')
const isStaggered=index=>index%2===0
const getDelay=index=>(isStaggered(index)?index*0.2:(index+5)*0.15)
const farmarogyaClass=ref('farmarogya non-firefox')
onMounted(()=>{ if(navigator.userAgent.toLowerCase().includes('firefox')) farmarogyaClass.value='farmarogya firefox' })
</script>





<style scoped>
@font-face {
  font-family: 'Jejak';
  src: url('../assets/fonts/JejakCintta.otf') format('opentype');
}

.intro-page {
  position: relative;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  transition: background-image 0.5s ease;
  overflow: hidden;
  padding: 20px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(2.3px) brightness(0.7);
  z-index: 0;
}

h1,
.subtitle,
.options {
  position: relative;
  z-index: 1;
}

h1 {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: bold;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.15em;
  margin-bottom: 1rem;
  font-family: 'Lucida Sans', Geneva, Verdana, sans-serif;
}

.welcome-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(1.8rem, 4vw, 3rem);
  margin-right: 0.3em;
}

.farmarogya.non-firefox,
.farmarogya.firefox {
  font-family: 'Jejak', cursive;
  font-size: clamp(2.5rem, 5vw, 3.2rem);
  color: #27ae60;
}

.farmarogya.firefox {
  background: linear-gradient(
    120deg,
    #0f3d27 20%,
    #27ae60 40%,
    #a9dfbf 60%,
    #27ae60 80%,
    #0f3d27 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shineGreen 4s linear infinite;
}

@keyframes shineGreen {
  0% {
    background-position: -100% center;
  }
  100% {
    background-position: 200% center;
  }
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(-50px);
  animation-fill-mode: forwards;
  animation-name: fallDown;
  animation-duration: 0.6s;
  animation-timing-function: ease;
}

.subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  margin-bottom: 30px;
  padding: 0 1rem;
}

/* ======================
   Flex layout for 2 rows
====================== */
.options {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.row {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.first-row {
  justify-content: flex-start;
}

.second-row {
  justify-content: center;
}

/* Card */
.option {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border-radius: 15px;
  padding: 15px;
  
  width: 160px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.5s ease;
  margin-bottom: 10px;
}

.option:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.option img {
  width: 100%;
  max-width: 130px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.option p {
  color: #fff;
  font-weight: bold;
  font-size: clamp(1rem, 2.5vw, 1.1rem);
}

/* ---------- Mobile ---------- */
@media (max-width: 768px) {
  .row {
    justify-content: center;
  }
  .option {
    width: 140px;
  }
}

@media (max-width: 480px) {
  .row {
    flex-direction: column;
    align-items: center;
  }
  .option {
    width: 80%;
    max-width: 280px;
  }
}

@keyframes fallDown {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
