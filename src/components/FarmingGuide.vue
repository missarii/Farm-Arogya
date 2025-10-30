<template>
  <div class="app-container app-container-animated-bg" :style="fallingAssetStyle">
    <div class="falling-leaves" :class="{ visible: showLeaves }">
      <div v-for="n in 5" :key="n" class="leaf" :style="leafStyles[n-1]"></div>
    </div>
    
    <header>
      <h1>🌾 Smart Farming Hub - Sri Lanka</h1>
      <div class="search-filter">
        <input v-model="searchQuery" placeholder="Search plants (e.g., Coconut, Mango)..." class="search-input" />
      </div>
    </header>

    <div v-if="!selectedPlant" class="plant-grid">
      <div v-for="(p, key) in filteredPlants" :key="key" class="plant-card" @click="selectPlant(key)">
        <img :src="`/src/assets/plants/${key}.png`" :alt="p.display" class="plant-img" />
        <div class="plant-info">
          <h2>{{ p.display }}</h2>
          <p>{{ p.short }}</p>
          <div class="quick-stats">
            <span>🌡️ {{ p.idealTemp.min }}–{{ p.idealTemp.max }}°C</span>
            <span>💧 Every {{ p.waterFreqDays }} days</span>
          </div>
        </div>
      </div>
    </div>

    <transition name="details-slide">
      <div v-if="selectedPlant" class="plant-details">
        <button @click="selectedPlant = null" class="back-btn">← Back to Plants</button>
        <div class="details-card">
          <img :src="`/src/assets/plants/${selectedPlant}.png`" :alt="selected.display" class="details-img" />
          <h2>{{ selected.display }}</h2>
          <p class="description">{{ selected.description }}</p>
          <ul>
            <li><b>🌡️ Temperature:</b> {{ selected.idealTemp.min }}°C - {{ selected.idealTemp.max }}°C</li>
            <li><b>💧 Water Every:</b> {{ selected.waterFreqDays }} days</li>
            <li><b>🌞 Light:</b> {{ selected.light }}</li>
            <li><b>🌱 Soil:</b> {{ selected.soil }}</li>
          </ul>
          <div class="data-cards">
            <div class="data-card">
              <h3>Ideal Temperature</h3>
              <p class="big-text">{{ recTemp }}°C</p>
              <div class="bar-bg">
                <div class="bar-fill" :style="tempBarStyle"></div>
              </div>
            </div>
            <div class="data-card">
              <h3>Watering Guide</h3>
              <p class="big-text">{{ wateringAdvice }}</p>
              <div class="controls">
                <input type="range" min="0" max="100" v-model.number="soilMoisture" class="moisture-slider" />
                <button @click="logWater" class="water-btn">💧 Log Watering</button>
              </div>
              <small>Soil Moisture: {{ soilMoisture }}%</small>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <footer>
      Built with 🌱 for sustainable farming in Sri Lanka. Temperatures in Celsius.
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";

export default {
  name: "App",
  setup() {
    const plants = {
      tomato: {
    display: "Tomato",
    short: "Warm climate plant, loves sunlight.",
    description: "Tomatoes thrive in Sri Lanka’s lowlands (18–27°C) with 6–8 hours of sunlight.",
    idealTemp: { min: 18, max: 27 },
    waterFreqDays: 3,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  basil: {
    display: "Basil",
    short: "Aromatic herb, loves warmth.",
    description: "Basil grows well in Sri Lanka’s tropics (20–30°C). Avoid overwatering.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Well-drained soil",
    light: "Full Sun",
  },
  mango: {
    display: "Mango",
    short: "Tropical fruit tree.",
    description: "Mangoes are a Sri Lankan staple, thriving at 24–35°C with full sunlight.",
    idealTemp: { min: 24, max: 35 },
    waterFreqDays: 7,
    soil: "Sandy loam",
    light: "Full Sun",
  },
  cucumber: {
    display: "Cucumber",
    short: "Warm-season vine crop.",
    description: "Cucumbers are common in Sri Lanka, needing 20–30°C and consistent moisture.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  pepper: {
    display: "Pepper",
    short: "Warm-loving fruiting plant.",
    description: "Peppers grow well at 21–29°C with plenty of sunlight.",
    idealTemp: { min: 21, max: 29 },
    waterFreqDays: 3,
    soil: "Loamy, well-drained soil",
    light: "Full Sun",
  },
  eggplant: {
    display: "Eggplant",
    short: "Warm-season fruit.",
    description: "Eggplants are popular in Sri Lanka, thriving at 21–30°C.",
    idealTemp: { min: 21, max: 30 },
    waterFreqDays: 3,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  okra: {
    display: "Okra",
    short: "Warm-season crop.",
    description: "Okra thrives in Sri Lanka at 21–32°C with full sunlight.",
    idealTemp: { min: 21, max: 32 },
    waterFreqDays: 4,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  watermelon: {
    display: "Watermelon",
    short: "Tropical fruit vine.",
    description: "Watermelons grow in Sri Lanka’s dry zones at 21–32°C.",
    idealTemp: { min: 21, max: 32 },
    waterFreqDays: 5,
    soil: "Sandy loam",
    light: "Full Sun",
  },
  pumpkin: {
    display: "Pumpkin",
    short: "Warm-season squash.",
    description: "Pumpkins are common in Sri Lanka, thriving at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  corn: {
    display: "Corn",
    short: "Warm-season grain.",
    description: "Corn grows in Sri Lanka’s lowlands at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Deep, fertile soil",
    light: "Full Sun",
  },
  curry_leaves: {
    display: "Curry Leaves",
    short: "Aromatic tropical herb.",
    description: "Curry leaves are a Sri Lankan staple, thriving at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  jackfruit: {
    display: "Jackfruit",
    short: "Tropical fruit tree.",
    description: "Jackfruit thrives in Sri Lanka at 22–35°C with full sunlight.",
    idealTemp: { min: 22, max: 35 },
    waterFreqDays: 7,
    soil: "Deep, well-drained soil",
    light: "Full Sun",
  },
  coconut: {
    display: "Coconut",
    short: "Iconic tropical palm.",
    description: "Coconuts are essential in Sri Lanka, thriving at 25–35°C.",
    idealTemp: { min: 25, max: 35 },
    waterFreqDays: 7,
    soil: "Sandy, well-drained soil",
    light: "Full Sun",
  },
  banana: {
    display: "Banana",
    short: "Tropical fruit plant.",
    description: "Bananas are widely grown in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  papaya: {
    display: "Papaya",
    short: "Tropical fruit tree.",
    description: "Papayas thrive in Sri Lanka’s tropics at 22–32°C.",
    idealTemp: { min: 22, max: 32 },
    waterFreqDays: 5,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  pineapple: {
    display: "Pineapple",
    short: "Tropical fruit crop.",
    description: "Pineapples grow well in Sri Lanka at 21–32°C.",
    idealTemp: { min: 21, max: 32 },
    waterFreqDays: 5,
    soil: "Sandy loam",
    light: "Full Sun",
  },
  rice: {
    display: "Rice",
    short: "Staple grain crop.",
    description: "Rice is a Sri Lankan staple, thriving at 20–35°C in wet conditions.",
    idealTemp: { min: 20, max: 35 },
    waterFreqDays: 2,
    soil: "Clayey, water-retentive soil",
    light: "Full Sun",
  },
  tea: {
    display: "Tea",
    short: "Major commercial crop.",
    description: "Tea grows in Sri Lanka’s highlands and midlands at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Acidic, well-drained soil",
    light: "Partial Sun",
  },
  cinnamon: {
    display: "Cinnamon",
    short: "Aromatic spice tree.",
    description: "Cinnamon is a Sri Lankan specialty, thriving at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Sandy loam",
    light: "Full Sun",
  },
  cardamom: {
    display: "Cardamom",
    short: "Spice crop.",
    description: "Cardamom grows in Sri Lanka’s wet zones at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Rich, loamy soil",
    light: "Partial Sun",
  },
  clove: {
    display: "Clove",
    short: "Aromatic spice tree.",
    description: "Cloves thrive in Sri Lanka’s tropics at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  nutmeg: {
    display: "Nutmeg",
    short: "Spice tree.",
    description: "Nutmeg grows in Sri Lanka’s wet zones at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Rich, well-drained soil",
    light: "Partial Sun",
  },
  turmeric: {
    display: "Turmeric",
    short: "Medicinal spice crop.",
    description: "Turmeric thrives in Sri Lanka at 20–30°C with moist soil.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Well-drained loamy soil",
    light: "Partial Sun",
  },
  ginger: {
    display: "Ginger",
    short: "Spicy root crop.",
    description: "Ginger grows well in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Rich, moist soil",
    light: "Partial Sun",
  },
  chili: {
    display: "Chili",
    short: "Spicy fruit crop.",
    description: "Chilies are common in Sri Lanka, thriving at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  lemongrass: {
    display: "Lemongrass",
    short: "Aromatic grass.",
    description: "Lemongrass thrives in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Well-drained soil",
    light: "Full Sun",
  },
  rambutan: {
    display: "Rambutan",
    short: "Tropical fruit tree.",
    description: "Rambutans grow in Sri Lanka’s wet zones at 22–32°C.",
    idealTemp: { min: 22, max: 32 },
    waterFreqDays: 5,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  durian: {
    display: "Durian",
    short: "Tropical fruit tree.",
    description: "Durians thrive in Sri Lanka’s tropics at 22–32°C.",
    idealTemp: { min: 22, max: 32 },
    waterFreqDays: 5,
    soil: "Deep, well-drained soil",
    light: "Full Sun",
  },
  mangosteen: {
    display: "Mangosteen",
    short: "Tropical fruit tree.",
    description: "Mangosteens grow in Sri Lanka’s wet zones at 22–32°C.",
    idealTemp: { min: 22, max: 32 },
    waterFreqDays: 5,
    soil: "Rich, well-drained soil",
    light: "Partial Sun",
  },
  avocado: {
    display: "Avocado",
    short: "Tropical fruit tree.",
    description: "Avocados thrive in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Well-drained sandy loam",
    light: "Full Sun",
  },
  guava: {
    display: "Guava",
    short: "Tropical fruit tree.",
    description: "Guavas are common in Sri Lanka, thriving at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  passionfruit: {
    display: "Passionfruit",
    short: "Tropical vine fruit.",
    description: "Passionfruit grows in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  soursop: {
    display: "Soursop",
    short: "Tropical fruit tree.",
    description: "Soursop thrives in Sri Lanka at 22–32°C.",
    idealTemp: { min: 22, max: 32 },
    waterFreqDays: 5,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  dragonfruit: {
    display: "Dragonfruit",
    short: "Tropical cactus fruit.",
    description: "Dragonfruit grows in Sri Lanka’s dry zones at 20–32°C.",
    idealTemp: { min: 20, max: 32 },
    waterFreqDays: 5,
    soil: "Sandy, well-drained soil",
    light: "Full Sun",
  },
  betel_leaf: {
    display: "Betel Leaf",
    short: "Cultural climbing plant.",
    description: "Betel leaves are grown in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Rich, moist soil",
    light: "Partial Sun",
  },
  vanilla: {
    display: "Vanilla",
    short: "Orchid vine spice.",
    description: "Vanilla thrives in Sri Lanka’s wet zones at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Rich, well-drained soil",
    light: "Partial Sun",
  },
  cocoa: {
    display: "Cocoa",
    short: "Tropical crop.",
    description: "Cocoa grows in Sri Lanka’s wet zones at 20–32°C.",
    idealTemp: { min: 20, max: 32 },
    waterFreqDays: 5,
    soil: "Rich, well-drained soil",
    light: "Partial Sun",
  },
  arecanut: {
    display: "Arecanut",
    short: "Tropical palm nut.",
    description: "Arecanuts are common in Sri Lanka at 20–32°C.",
    idealTemp: { min: 20, max: 32 },
    waterFreqDays: 5,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  drumstick: {
    display: "Drumstick",
    short: "Nutritious tree crop.",
    description: "Drumsticks thrive in Sri Lanka at 20–32°C.",
    idealTemp: { min: 20, max: 32 },
    waterFreqDays: 5,
    soil: "Well-drained soil",
    light: "Full Sun",
  },
  bitter_gourd: {
    display: "Bitter Gourd",
    short: "Medicinal vine crop.",
    description: "Bitter gourd grows in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  snake_gourd: {
    display: "Snake Gourd",
    short: "Tropical vine vegetable.",
    description: "Snake gourd thrives in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  winged_bean: {
    display: "Winged Bean",
    short: "Nutritious legume.",
    description: "Winged beans grow in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  green_bean: {
    display: "Green Bean",
    short: "Warm-season legume.",
    description: "Green beans thrive in Sri Lanka at 18–24°C.",
    idealTemp: { min: 18, max: 24 },
    waterFreqDays: 3,
    soil: "Well-drained soil",
    light: "Full Sun",
  },
  sweet_potato: {
    display: "Sweet Potato",
    short: "Tropical root crop.",
    description: "Sweet potatoes grow in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 4,
    soil: "Loose, well-drained soil",
    light: "Full Sun",
  },
  cassava: {
    display: "Cassava",
    short: "Tropical root crop.",
    description: "Cassava thrives in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Well-drained sandy loam",
    light: "Full Sun",
  },
  yam: {
    display: "Yam",
    short: "Tropical tuber crop.",
    description: "Yams grow in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 5,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  colocasia: {
    display: "Colocasia",
    short: "Tropical root crop.",
    description: "Colocasia thrives in Sri Lanka’s wet zones at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Moist, fertile soil",
    light: "Partial Sun",
  },
  long_bean: {
    display: "Long Bean",
    short: "Tropical legume.",
    description: "Long beans grow in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Well-drained loamy soil",
    light: "Full Sun",
  },
  ridge_gourd: {
    display: "Ridge Gourd",
    short: "Tropical vine vegetable.",
    description: "Ridge gourd thrives in Sri Lanka at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Rich, well-drained soil",
    light: "Full Sun",
  },
  gotukola: {
    display: "Gotukola",
    short: "Medicinal leafy green.",
    description: "Gotukola is a Sri Lankan herb, thriving at 20–30°C.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Moist, fertile soil",
    light: "Partial Sun",
  },
  pandan: {
    display: "Pandan",
    short: "Aromatic tropical plant.",
    description: "Pandan grows in Sri Lanka at 20–30°C with moist soil.",
    idealTemp: { min: 20, max: 30 },
    waterFreqDays: 3,
    soil: "Rich, moist soil",
    light: "Partial Sun",
  },
};

const selectedPlant = ref(null); 
const soilMoisture = ref(50);
    const searchQuery = ref("");
    const showLeaves = ref(false);

    // --- LOGIC FOR DYNAMIC FALLING ASSET ---
    const fallingAssetStyle = computed(() => {
        if (selectedPlant.value) {
            // NOTE: This path is for the falling item's CSS variable. 
            // The build tool (Vite/Webpack) should process this as a dynamic asset path.
            const assetPath = `/src/assets/plants/${selectedPlant.value}.png`;
            return {
                '--falling-asset-url': `url('${assetPath}')`
            };
        }
        // Fallback to a default leaf image if no plant is selected
        return {
            '--falling-asset-url': 'url("https://i.pinimg.com/originals/80/71/06/80710619a955f41cbb8974656bd9b5bc.png")' 
        };
    });

    // Generate styles for falling leaves evenly across the screen
    const leafStyles = Array.from({ length: 5 }, (_, i) => {
      const leftPercent = (i + Math.random()) * (100 / 5); // evenly spaced across 100%
      return {
        left: `${leftPercent}vw`,
        animationDuration: `${6 + Math.random() * 4}s`, // 6-10 seconds
        animationDelay: `${Math.random() * 5}s`, // 0-5 seconds
        transform: `rotate(${Math.random() * 360}deg)`,
      };
    });


    const selected = computed(() => (selectedPlant.value ? plants[selectedPlant.value] : null));
    const recTemp = computed(() => (selected.value ? Math.round((selected.value.idealTemp.min + selected.value.idealTemp.max) / 2) : 0));

    const tempBarStyle = computed(() => ({
      width: `${Math.min(100, (recTemp.value / 40) * 100)}%`,
      background: "linear-gradient(90deg, #4caf50, #1b5e20)",
    }));

    const wateringAdvice = computed(() => {
      if (!selected.value) return "";
      const freq = selected.value.waterFreqDays;
      const isMonsoonSeason = new Date().getMonth() >= 5 && new Date().getMonth() <= 9; // Yala monsoon (May–Sep)
      if (isMonsoonSeason) {
        return `Monsoon season: Reduce watering to every ${freq + 2} days due to high rainfall.`;
      }
      if (soilMoisture.value < 30) return `Water now (every ${freq} days)`;
      if (soilMoisture.value < 60) return `Water soon`;
      return "Soil is moist";
    });

    const filteredPlants = computed(() => {
      return Object.entries(plants)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [key, plant]) => {
          const matchesSearch = plant.display.toLowerCase().includes(searchQuery.value.toLowerCase());
          if (matchesSearch) {
            acc[key] = plant;
          }
          return acc;
        }, {});
    });

    const selectPlant = (key) => {
      selectedPlant.value = key;
      soilMoisture.value = 50;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const logWater = () => {
      soilMoisture.value = Math.min(100, soilMoisture.value + 30);
    };

    // Scroll event handler to detect when at bottom of page
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isAtBottom = scrollY + windowHeight >= documentHeight - 50;
      showLeaves.value = isAtBottom;
    };

    // Add scroll event listener on mount
    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    });

    // Remove scroll event listener on unmount
    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      plants,
      selectedPlant,
      selected,
      recTemp,
      tempBarStyle,
      soilMoisture,
      wateringAdvice,
      selectPlant,
      logWater,
      searchQuery,
      filteredPlants,
      leafStyles,
      showLeaves,
      fallingAssetStyle,
    };
  },
};
</script>

<style scoped>
/* NOTE: The CSS for .leaf has been modified to use the CSS variable 
    --falling-asset-url which is set dynamically in the script. */

body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Poppins", sans-serif;
}

/* ----------------------------------------------------------------- */
/* --- REFINED CSS KEYFRAMES FOR DISTINCT CROSS-FADE BACKGROUND --- */
@keyframes backgroundShift {
    /* 0% to 33%: Earthy to Lush Green */
    0% { background-color: #6d4c41; } /* Dark Brown/Earth */
    33% { background-color: #388e3c; } /* Lush Green */
    
    /* 33% to 66%: Lush Green to Sunny Yellow */
    66% { background-color: #ffeb3b; } /* Sunny Yellow */
    
    /* 66% to 100%: Sunny Yellow back to Earthy for a loop */
    100% { background-color: #6d4c41; } 
}

.app-container-animated-bg {
    /* Set a slower animation time (40s) for a more noticeable, smoother transition */
    animation: backgroundShift 40s ease-in-out infinite alternate;
    background-size: cover; 
    
    /* Crucial for the cross-fade effect: tells the browser to transition the background-color property */
    transition: background-color 10s ease-in-out; 
}
/* ----------------------------------------------------------------- */

.app-container {
  min-height: 100vh;
  /* Initial background color serves as a starting point before animation begins */
  background-color: #6d4c41; 
  accent-color: #ff8f00;
  color: #ac5d5dff;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.falling-leaves {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}

.leaf {
  position: absolute;
  width: 60px;
  height: 60px;
  
  /* Use the dynamic CSS variable for the falling asset image */
  background: var(--falling-asset-url) center center no-repeat;
  background-size: contain; 
  
  opacity: 0.9;
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    top: -60px;
    opacity: 0.9;
    transform: rotate(0deg);
  }
  10% {
    opacity: 0.9;
  }
  90% {
    opacity: 0.9;
  }
  100% {
    top: 100vh;
    opacity: 0;
    transform: rotate(360deg) translateX(20px);
  }
}

header {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-bottom: 40px;
  animation: slideInFromTop 0.8s ease;
}

header h1 {
  font-size: 3.8rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  color: #8d6441ff;
  margin: 0;
  animation: pulse 2s infinite;
}

.search-filter {
  display: flex;
  justify-content: center;
  margin: 20px 80px 10px;
}

.search-input {
  padding: 12px 20px;
  border-radius: 25px;
  border: none;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 1rem;
  width: 300px;
  transition: all 0.4s ease;
  animation: slideInFromBottom 0.8s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.plant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.plant-card {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease, filter 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  transform: perspective(1000px);
  animation: cardFadeIn 0.5s ease both;
  width: 280px;
  height: 380px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
}

.plant-card:nth-child(1) { animation-delay: 0.1s; }
.plant-card:nth-child(2) { animation-delay: 0.2s; }
.plant-card:nth-child(3) { animation-delay: 0.3s; }
.plant-card:nth-child(4) { animation-delay: 0.4s; }
.plant-card:nth-child(5) { animation-delay: 0.5s; }
.plant-card:nth-child(n+6) { animation-delay: 0.6s; }

.plant-card:hover {
  transform: perspective(1000px) translateZ(20px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(129, 199, 132, 0.8);
  filter: brightness(1.2);
}

.plant-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.plant-card:hover::after {
  opacity: 1;
}

.plant-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
  transition: transform 0.4s ease;
}

.plant-card:hover .plant-img {
  transform: scale(1.1) rotate(2deg);
}

.plant-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.plant-info h2 {
  margin: 10px 0;
  color: #d4aa85ff;
  font-size: 2.0rem;
}

.plant-info p {
  font-size: 1.2rem;
  color: #263218ff;
  flex-grow: 1;
}

.quick-stats {
  display: flex;
  justify-content: space-between;
  font-size: 1.0rem;
  color: #13e41aff;
  margin-top: 10px;
}

.plant-details {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.details-card {
  width: 100%;
  max-width: 800px;
  margin: 40px auto;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  text-align: left;
  overflow-y: auto;
  animation: cardFadeIn 0.5s ease;
}

.details-img {
  width: 200px;
  height: 200px;
  border-radius: 20px;
  object-fit: cover;
  border: 4px solid #81c784;
  margin-bottom: 20px;
  animation: glow 1.5s infinite alternate;
  margin-left:250px;
}

.details-card h2 {
  color: #384e29ff;
  font-size: 2.2rem;
  margin: 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.description {
  color: #181424ff;
  font-size: 1.1rem;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 10px;
}

.details-card ul {
  color: #452c0fff;
  font-size: 1.1rem;
  margin-bottom: 20px;
  padding-left: 20px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.data-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 25px;
  border-radius: 20px;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  animation: cardFadeIn 0.5s ease both;
  
}

.data-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.big-text {
  font-size: 1.2rem;
  color: #173f19ff;
}

.bar-bg {
  background: rgba(255, 255, 255, 0.25);
  height: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  height: 15px;
  transition: width 0.6s ease;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.moisture-slider {
  width: 140px;
  accent-color: #81c784;
}

.water-btn {
  background: #81c784;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  cursor: pointer;
  color: #0d2d24;
  font-weight: bold;
  transition: transform 0.3s ease, background 0.3s ease;
}

.water-btn:hover {
  background: #a5d6a7;
  transform: scale(1.1);
}

footer {
  margin-top: 80px;
  color: #81c784;
  font-size: 1.1rem;
  text-align: center;
  position: relative;
  z-index: 1;
  animation: fadeIn 1s ease;
}

.back-btn {
  background: #81c784;
  color: #0d2d24;
  padding: 12px 25px;
  border-radius: 20px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
  position: relative;
  z-index: 1;
  animation: slideInFromLeft 0.5s ease;
}

.back-btn:hover {
  background: #a5d6a7;
  transform: scale(1.1);
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes glow {
  from { box-shadow: 0 0 10px #81c784; }
  to { box-shadow: 0 0 20px #81c784; }
}

@keyframes slideInFromTop {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInFromBottom {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInFromLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.details-slide-enter-active, .details-slide-leave-active {
  transition: all 0.5s ease;
}

.details-slide-enter-from, .details-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>