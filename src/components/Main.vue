<template>
  <div class="intro-page" :style="{ backgroundImage: `url('${currentBg}')` }">
    <div class="overlay"></div>

    <div class="content">
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
        <div class="option" @mouseenter="handleMarketHover" @click="$emit('select', 'market')">
          <div class="media"><img :src="currentMarketImg" alt="Buy & Sell" /></div>
          <p class="label">Buy & Sell</p>
        </div>

        <div class="option" @mouseenter="handleFarmHover" @click="$emit('select', 'guide')">
          <div class="media"><img :src="currentFarmImg" alt="Farming Guide" /></div>
          <p class="label">Farming Guide</p>
        </div>

        <div class="option" @mouseenter="handleDiseaseHover" @click="$emit('select', 'disease')">
          <div class="media"><img :src="currentDiseaseImg" alt="Disease Detection" /></div>
          <p class="label">Disease Detection</p>
        </div>

        <div class="option" @mouseenter="handleGardenHover" @click="$emit('select', 'tools')">
          <div class="media"><img :src="currentGardenImg" alt="Garden Tools" /></div>
          <p class="label">Farming Tools</p>
        </div>

        <div class="option" @mouseenter="handleFertHover" @click="$emit('select', 'fertilizers')">
          <div class="media"><img :src="currentFertImg" alt="Fertilizers & Chemicals" /></div>
          <p class="label">Fertilizers</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Market images
import market1 from "../assets/market1.png";
import market2 from "../assets/market2.png";
import market3 from "../assets/market3.png";
import market4 from "../assets/market4.png";

// Farm images
import farm1 from "../assets/farm1.png";
import farm2 from "../assets/farm2.png";
import farm3 from "../assets/farm3.png";
import farm4 from "../assets/farm4.png";

// Disease images
import disease1 from "../assets/disease1.png";
import disease2 from "../assets/disease2.png";
import disease3 from "../assets/disease3.png";
import disease4 from "../assets/disease4.png";

// Garden images
const gardenImages = [
  new URL("../assets/garden 1.png", import.meta.url).href,
  new URL("../assets/garden 2.png", import.meta.url).href,
  new URL("../assets/garden 3.png", import.meta.url).href,
  new URL("../assets/garden 4.png", import.meta.url).href,
];
const currentGardenImg = ref(gardenImages[0]);
let gardenIndex = 0;
function handleGardenHover() {
  setBg("garden");
  gardenIndex = (gardenIndex + 1) % gardenImages.length;
  currentGardenImg.value = gardenImages[gardenIndex];
}

// Fertilizer images
const fertImages = [
  new URL("../assets/fert1.png", import.meta.url).href,
  new URL("../assets/fert2.png", import.meta.url).href,
  new URL("../assets/fert3.png", import.meta.url).href,
  new URL("../assets/fert4.png", import.meta.url).href,
];
const currentFertImg = ref(fertImages[0]);
let fertIndex = 0;
function handleFertHover() {
  setBg("fertilizers");
  fertIndex = (fertIndex + 1) % fertImages.length;
  currentFertImg.value = fertImages[fertIndex];
}

// Market logic
const marketImages = [market1, market2, market3, market4];
const currentMarketImg = ref(marketImages[0]);
let marketIndex = 0;
function handleMarketHover() {
  setBg("market");
  marketIndex = (marketIndex + 1) % marketImages.length;
  currentMarketImg.value = marketImages[marketIndex];
}

// Farm logic
const farmImages = [farm1, farm2, farm3, farm4];
const currentFarmImg = ref(farmImages[0]);
let farmIndex = 0;
function handleFarmHover() {
  setBg("guide");
  farmIndex = (farmIndex + 1) % farmImages.length;
  currentFarmImg.value = farmImages[farmIndex];
}

// Disease logic
const diseaseImages = [disease1, disease2, disease3, disease4];
const currentDiseaseImg = ref(diseaseImages[0]);
let diseaseIndex = 0;
function handleDiseaseHover() {
  setBg("disease");
  diseaseIndex = (diseaseIndex + 1) % diseaseImages.length;
  currentDiseaseImg.value = diseaseImages[diseaseIndex];
}

// Backgrounds
const defaultBg = "/images/main.jpg";
const currentBg = ref(defaultBg);
const bgMap = {
  market: [
    "/images/Market/1.jpg",
    "/images/Market/2.jpg",
    "/images/Market/3.jpg",
    "/images/Market/4.jpg",
  ],
  guide: [
    "/images/Guide/1.jpg",
    "/images/Guide/2.jpg",
    "/images/Guide/3.jpg",
    "/images/Guide/4.jpg",
    "/images/Guide/5.jpg",
  ],
  disease: [
    "/images/Disease/1.jpg",
    "/images/Disease/2.jpg",
    "/images/Disease/3.jpg",
    "/images/Disease/4.jpg",
  ],
  garden: [
    "/images/Garden/1.jpg",
    "/images/Garden/2.jpg",
    "/images/Garden/3.jpeg",
    "/images/Garden/4.jpeg",
  ],
  fertilizers: [
    "/images/Fertilizers/1.jpg",
    "/images/Fertilizers/2.jpg",
    "/images/Fertilizers/3.jpg",
    "/images/Fertilizers/4.jpg",
  ],
};
const setBg = (type) => {
  const options = bgMap[type];
  if (options && options.length > 0) {
    const randomIndex = Math.floor(Math.random() * options.length);
    currentBg.value = options[randomIndex];
  }
};

// Animation
const letters = "FarmArogya".split("");
const isStaggered = (index) => index % 2 === 0;
const getDelay = (index) =>
  isStaggered(index) ? index * 0.2 : (index + 5) * 0.15;

// Browser detection
const farmarogyaClass = ref("farmarogya non-firefox");
onMounted(() => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("firefox")) {
    farmarogyaClass.value = "farmarogya firefox";
  }
});
</script>

<style scoped>
@font-face {
  font-family: "Jejak";
  src: url("../assets/fonts/JejakCintta.otf") format("opentype");
  font-weight: normal;
  font-style: normal;
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
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  justify-content: center;
  gap: 0.15em;
  margin-bottom: 1rem;
}

.welcome-text {
  font-family: "Courier New", Courier, monospace;
  font-size: clamp(1.8rem, 4vw, 3rem);
  margin-right: 0.3em;
}

/* Non-Firefox browsers */
.farmarogya.non-firefox {
  position: relative;
  top: -5%;
  right: -2%;
  font-family: "Jejak", cursive;
  font-size: clamp(2.5rem, 5vw, 3.2rem);
  color: #27ae60; /* fallback solid color */

  background-size: 200% auto;
  /* No -webkit-background-clip or -webkit-text-fill-color */
}

/* Firefox browsers */
.farmarogya.firefox {
  position: relative;
  top: -5%;
  right: -2%;
  font-family: "Jejak", cursive;
  font-size: clamp(2.5rem, 5vw, 3.2rem);
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

/* ======= STABLE TILE STYLES (no resize on hover) ======= */
.options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  padding: 10px;
  max-width: 1000px;
}

.option {
  /* fixed dimensions to prevent reflow */
  width: 160px;
  height: 260px;
  min-width: 160px;
  min-height: 260px;

  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border-radius: 15px;
  padding: 12px;
  box-sizing: border-box;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

/* media wrapper keeps image size constant */
.option .media {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
}

.option img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* reserve label area so text doesn't shift */
.label,
.option p {
  margin: 8px 0 0 0;
  font-weight: 700;
  color: #fff;
  font-size: clamp(0.95rem, 2vw, 1.05rem);
  line-height: 1.15;
  min-height: 2.2em;
}

/* hover: visual-only (no transform/scale) */
.option:hover,
.option:focus {
  box-shadow: 0 12px 40px rgba(39, 174, 96, 0.18);
  background-color: rgba(255,255,255,0.14);
  border-color: rgba(39,174,96,0.12);
  outline: none;
}

/* Animations (kept) */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
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

/* Mobile adjustments */
@media (max-width: 768px) {
  h1 {
    flex-direction: column;
    text-align: center;
    line-height: 1.2;
  }

  .options {
    flex-direction: column;
    align-items: center;
  }

  .option {
    width: 80%;
    max-width: 300px;
    height: auto;
    min-height: 220px;
  }

  .welcome-text {
    margin: 0;
  }

  .farmarogya {
    top: 0;
    right: 0;
  }
}
</style>