<template>
  <!-- ===============  CRICKET + AGRICULTURE PRELOADER  =============== -->
  <transition name="fade">
    <div v-if="loading" class="cricket-preloader">
      <!-- SVG SUN -->
      <svg class="sun-svg" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="40" fill="#f1c40f"/>
        <g class="rays">
          <line x1="100" y1="20" x2="100" y2="50" stroke="#f1c40f" stroke-width="5"/>
          <line x1="155" y1="45" x2="135" y2="65" stroke="#f1c40f" stroke-width="5"/>
          <line x1="180" y1="100" x2="150" y2="100" stroke="#f1c40f" stroke-width="5"/>
          <line x1="155" y1="155" x2="135" y2="135" stroke="#f1c40f" stroke-width="5"/>
          <line x1="100" y1="180" x2="100" y2="150" stroke="#f1c40f" stroke-width="5"/>
          <line x1="45"  y1="155" x2="65"  y2="135" stroke="#f1c40f" stroke-width="5"/>
          <line x1="20"  y1="100" x2="50"  y2="100" stroke="#f1c40f" stroke-width="5"/>
          <line x1="45"  y1="45"  x2="65"  y2="65"  stroke="#f1c40f" stroke-width="5"/>
        </g>
      </svg>

      <!-- SVG CLOUDS -->
      <svg class="cloud cloud1" viewBox="0 0 120 60">
        <path d="M30 60 Q15 60 15 45 Q5 45 5 30 Q5 15 20 15 Q25 5 35 5 Q45 0 55 0 Q70 0 75 10 Q90 10 95 20 Q110 20 110 35 Q110 50 95 50 Q85 60 70 60 Z" fill="#ffffff" opacity="0.85"/>
      </svg>
      <svg class="cloud cloud2" viewBox="0 0 120 60">
        <path d="M30 60 Q15 60 15 45 Q5 45 5 30 Q5 15 20 15 Q25 5 35 5 Q45 0 55 0 Q70 0 75 10 Q90 10 95 20 Q110 20 110 35 Q110 50 95 50 Q85 60 70 60 Z" fill="#ffffff" opacity="0.75"/>
      </svg>

      <!-- CRICKET SCORE-BOARD -->
      <div class="score-board">
        <div class="digit-box" v-for="(d,i) in displayDigits" :key="i">
          <span class="digit">{{ d }}</span>
        </div>
      </div>
    </div>
  </transition>

  <!-- =================  ORIGINAL PAGE CONTENT  ================= -->
  <div class="intro-page" :style="{ backgroundImage: `url('${currentBg}')` }">
    <div class="overlay"></div>
    <h1 class="fade-in">
      <span class="welcome-text">Welcome to</span>
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
      <div class="row top-row">
        <div class="option" @mouseenter="handleSoilHover" @click="handleSelect('soiltest')">
          <img :src="currentSoilImg" alt="Environmental AI Test" />
          <p>Environment AI Test</p>
        </div>
        <div class="option" @mouseenter="handleToolsHover" @click="handleSelect('tools')">
          <img :src="currentToolsImg" alt="Accessory Tools" />
          <p>Accessory Tools</p>
        </div>
        <div class="option" @mouseenter="handleFertilizerHover" @click="handleSelect('fertilizer')">
          <img :src="currentFertilizerImg" alt="Fertilizer & Chemicals" />
          <p>Fertilizer & Chemicals</p>
        </div>
      </div>
      <div class="row bottom-row">
        <div class="option" @mouseenter="handleMarketHover" @click="handleSelect('market')">
          <img :src="currentMarketImg" alt="Buy & Sell" />
          <p>Buy & Sell</p>
        </div>
        <div class="option" @mouseenter="handleFarmHover" @click="handleSelect('guide')">
          <img :src="currentFarmImg" alt="Farming Guide" />
          <p>Farming Guide</p>
        </div>
        <div class="option" @mouseenter="handleChatHover" @click="handleSelect('chat')">
          <img :src="currentChatImg" alt="AI Chat" />
          <p>AI Chat</p>
        </div>
        <div class="option" @mouseenter="handleDiseaseHover" @click="handleSelect('disease')">
          <img :src="currentDiseaseImg" alt="Disease Detection" />
          <p>Disease Detection</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* -----------  PRELOADER STATE  ----------- */
const loading = ref(true)
const progress = ref(0)

/* -----------  CRICKET SCORE-BOARD  ----------- */
const displayDigits = ref(['0','0','0'])
let step = 0
const interval = setInterval(()=>{
  if(step <= 100){
    const s = step.toString().padStart(3,'0')
    displayDigits.value = s.split('')
    step++
  }else{
    clearInterval(interval)
  }
},25)

const defaultBg = '/images/main.jpg'
const bgMap = {
  market: ['/images/Market/1.jpg','/images/Market/2.jpg','/images/Market/3.jpg','/images/Market/4.jpg'],
  guide:  ['/images/Guide/1.jpg','/images/Guide/2.jpg','/images/Guide/3.jpg','/images/Guide/4.jpg','/images/Guide/5.jpg'],
  disease:['/images/Disease/1.jpg','/images/Disease/2.jpg','/images/Disease/3.jpg','/images/Disease/4.jpg'],
  soiltest:['/images/SoilTest/1.jpg','/images/SoilTest/2.jpg','/images/SoilTest/3.jpg'],
  tools:  ['/images/Tools/1.jpg','/images/Tools/2.jpg','/images/Tools/3.jpg','/images/Tools/4.jpg'],
  fertilizer:['/images/Fertilizer/1.jpg','/images/Fertilizer/2.jpg','/images/Fertilizer/3.jpg','/images/Fertilizer/4.jpg'],
  chat:   ['/images/Chat/1.jpg','/images/Chat/2.jpg','/images/Chat/3.jpg']
}
const allImages = [defaultBg, ...Object.values(bgMap).flat()]
let loaded = 0, total = allImages.length

function preloadImage(src){
  return new Promise(res=>{
    const img=new Image()
    img.onload=img.onerror=()=>{ loaded++; progress.value=(loaded/total)*100; res() }
    img.src=src
  })
}
onMounted(async()=>{
  await Promise.all(allImages.map(preloadImage))
  setTimeout(()=>loading.value=false, 400)
})

/* -----------  NAVIGATION  ----------- */
const handleSelect=page=>{
  const external={
    soiltest:'https://farm-arogya-soiltest-ai.pages.dev/',
    chat:'http://13.48.177.178:5000/',
    disease:'https://16.16.202.197/'
  }
  external[page] ? window.location.href=external[page] : router.push(`/${page}`)
}

/* -----------  IMAGES  ----------- */
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
import chat1 from '../assets/chat1.png'
import chat2 from '../assets/chat2.png'
import chat3 from '../assets/chat3.png'
import chat4 from '../assets/chat4.png'

const currentMarketImg=ref(market1), currentFarmImg=ref(farm1), currentDiseaseImg=ref(disease1)
const currentSoilImg=ref(soil1), currentToolsImg=ref(tools1), currentFertilizerImg=ref(fert1), currentChatImg=ref(chat1)

const marketImages=[market1,market2,market3,market4], farmImages=[farm1,farm2,farm3,farm4]
const diseaseImages=[disease1,disease2,disease3,disease4], soilImages=[soil1,soil2,soil3,soil4]
const toolsImages=[tools1,tools2,tools3,tools4], fertilizerImages=[fert1,fert2,fert3,fert4], chatImages=[chat1,chat2,chat3,chat4]

let marketIndex=0, farmIndex=0, diseaseIndex=0, soilIndex=0, toolsIndex=0, fertilizerIndex=0, chatIndex=0

const handleMarketHover=()=>{ setBg('market'); marketIndex=(marketIndex+1)%marketImages.length; currentMarketImg.value=marketImages[marketIndex] }
const handleFarmHover=()=>{ setBg('guide'); farmIndex=(farmIndex+1)%farmImages.length; currentFarmImg.value=farmImages[farmIndex] }
const handleDiseaseHover=()=>{ setBg('disease'); diseaseIndex=(diseaseIndex+1)%diseaseImages.length; currentDiseaseImg.value=diseaseImages[diseaseIndex] }
const handleSoilHover=()=>{ setBg('soiltest'); soilIndex=(soilIndex+1)%soilImages.length; currentSoilImg.value=soilImages[soilIndex] }
const handleToolsHover=()=>{ setBg('tools'); toolsIndex=(toolsIndex+1)%toolsImages.length; currentToolsImg.value=toolsImages[toolsIndex] }
const handleFertilizerHover=()=>{ setBg('fertilizer'); fertilizerIndex=(fertilizerIndex+1)%fertilizerImages.length; currentFertilizerImg.value=fertilizerImages[fertilizerIndex] }
const handleChatHover=()=>{ setBg('chat'); chatIndex=(chatIndex+1)%chatImages.length; currentChatImg.value=chatImages[chatIndex] }

const currentBg=ref(defaultBg)
function setBg(type){
  const opts=bgMap[type]
  currentBg.value=opts&&opts.length?opts[Math.floor(Math.random()*opts.length)]:defaultBg
}

/* -----------  TITLE  ----------- */
const letters='FarmArogya'.split('')
const isStaggered=index=>index%2===0
const getDelay=index=>isStaggered(index)?index*.2:(index+5)*.15
const farmarogyaClass=ref('farmarogya non-firefox')
onMounted(()=>{
  if(navigator.userAgent.toLowerCase().includes('firefox')) farmarogyaClass.value='farmarogya firefox'
})
</script>

<style scoped>
@font-face{
  font-family:'Jejak';
  src:url('../assets/fonts/JejakCintta.otf') format('opentype');
}

/* =========  CRICKET PRELOADER  ========= */
.cricket-preloader{
  position:fixed; inset:0;
  background:linear-gradient(to bottom, #56ccf2 0%, #2f80ed 100%);
  display:flex; align-items:center; justify-content:center;
  z-index:9999; overflow:hidden;
}
/* SUN */
.sun-svg{
  position:absolute; top:10%; right:10%;
  width:clamp(100px, 15vw, 180px);
  animation:sunGlow 3s ease-in-out infinite alternate;
}
@keyframes sunGlow{
  from{ filter:drop-shadow(0 0 10px #f1c40f); }
  to  { filter:drop-shadow(0 0 25px #f1c40f); }
}
.rays{ animation:sunRotate 15s linear infinite; transform-origin:center; }
@keyframes sunRotate{ to{transform:rotate(360deg);} }
/* CLOUDS */
.cloud{
  position:absolute; width:clamp(120px, 18vw, 200px);
  animation:drift 25s linear infinite;
}
.cloud1{ top:20%; animation-duration:25s; }
.cloud2{ top:50%; animation-duration:35s; animation-delay:-8s; }
@keyframes drift{
  from{ transform:translateX(-150%); }
  to  { transform:translateX(150vw); }
}
/* SCORE-BOARD */
.score-board{
  
  display:flex; gap:8px;
  background:#111; padding:15px 20px; border-radius:12px;
  box-shadow:0 0 25px rgba(0,0,0,.5), inset 0 0 15px rgba(255,255,255,.08);
}
.digit-box{
  
  width:clamp(50px, 10vw, 80px); height:clamp(70px, 14vw, 110px);
  background:#0f0f0f; border:3px solid #222; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
}
.digit{
  font-family:'Courier New', monospace; font-weight:900;
  font-size:clamp(2.5rem, 10vw, 5rem); color:#00ff00;
  line-height:1; animation:tickFlip .4s ease;
}
@keyframes tickFlip{
  0%  { transform:translateY(-100%); opacity:0; }
  100%{ transform:translateY(0); opacity:1; }
}
.fade-enter-active,.fade-leave-active{ transition:opacity .6s ease; }
.fade-enter-from,.fade-leave-to{ opacity:0; }

/* ===============  PAGE STYLES (same as before)  =============== */
.intro-page{
  position:relative; min-height:100vh; background-size:cover; background-position:center;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  color:#fff; text-align:center; transition:background-image .5s ease;
  overflow:hidden; padding:20px;
}
.overlay{
  position:absolute; inset:0; backdrop-filter:blur(2.3px) brightness(.7); z-index:0;
}
h1,.subtitle,.options{ position:relative; z-index:1; }
h1{
  font-size:clamp(2rem,4vw,3.5rem); font-weight:bold;
  display:flex; flex-wrap:wrap; justify-content:center; gap:.15em;
  margin-bottom:1rem; font-family:'Lucida Sans',Geneva,Verdana,sans-serif;
}
.welcome-text{
  font-family:'Courier New',Courier,monospace; font-size:clamp(1.8rem,4vw,3rem); margin-right:.3em;
}
.farmarogya.non-firefox,.farmarogya.firefox{
  font-family:'Jejak',cursive; font-size:clamp(2.5rem,5vw,3.2rem); color:#27ae60;
}
.farmarogya.firefox{
  background:linear-gradient(120deg,#0f3d27 20%,#27ae60 40%,#a9dfbf 60%,#27ae60 80%,#0f3d27 100%);
  background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  animation:shineGreen 4s linear infinite;
}
@keyframes shineGreen{ 0%{background-position:-100% center} 100%{background-position:200% center} }
.letter{
  display:inline-block; opacity:0; transform:translateY(-50px);
  animation:fallDown .6s ease forwards;
}
.subtitle{ font-size:clamp(1.1rem,2.5vw,1.5rem); margin-bottom:30px; padding:0 1rem; }
.options{ display:flex; flex-direction:column; gap:30px; max-width:1100px; margin:0 auto; width:100%; }
.row{ display:flex; gap:25px; flex-wrap:wrap; justify-content:center; }
.option{
  background:rgba(255,255,255,.15); backdrop-filter:blur(4px); border-radius:15px;
  padding:18px; width:160px; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,.2);
  text-align:center; transition:all .3s ease;
}
.option:hover{ transform:scale(1.1); box-shadow:0 8px 30px rgba(0,0,0,.35); background:rgba(255,255,255,.25); }
.option img{ width:100%; max-width:130px; height:100px; object-fit:cover; border-radius:10px; margin-bottom:12px; }
.option p{ color:#fff; font-weight:bold; font-size:clamp(.95rem,2.3vw,1.1rem); margin:0; }
@media(max-width:768px){
  .row{ gap:20px; }
  .option{ width:140px; padding:15px; }
  .option img{ height:90px; }
}
@media(max-width:480px){
  .top-row,.bottom-row{ flex-direction:column; align-items:center; }
  .option{ width:80%; max-width:280px; padding:20px; }
  .option img{ height:110px; }
}
@keyframes fallDown{ to{ opacity:1; transform:translateY(0); } }
</style>