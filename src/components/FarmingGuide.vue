<template>
  <div class="page-background">
    <div class="guide-page">
      <h1 class="glow-text">Your Family Garden Guide</h1>
      <p class="subtitle">Learn the best way to grow vegetables, fruits, and plants naturally!</p>

      <!-- 🪴 CROP SELECTOR -->
      <div class="crop-selector">
        <select v-model="crop">
          <option disabled value="">Select a Crop</option>
          <option v-for="(value, key) in guide" :key="key">{{ key }}</option>
        </select>
      </div>

      <!-- 🌿 CROP PREVIEW CARD -->
      <transition name="fade-slide" mode="out-in">
        <div v-if="crop" key="guide-card" class="guide-card">
          <img
            v-if="getImage(crop)"
            :src="getImage(crop)"
            alt="Crop image"
            class="crop-preview-img"
          />
          <h2>{{ crop }} 🌿</h2>
          <p><strong>Best Season:</strong> {{ guide[crop].season }}</p>
          <p><strong>Temperature:</strong> {{ guide[crop].temperature }} °C</p>
          <p><strong>Humidity:</strong> {{ guide[crop].humidity }}%</p>
          <p><strong>Natural Fertilizer:</strong> {{ guide[crop].fertilizer }}</p>
          <p><strong>Watering:</strong> {{ guide[crop].watering }}</p>
          <p><strong>Tips:</strong> {{ guide[crop].tips }}</p>
        </div>
      </transition>

      <!-- 🌾 GRID OF ALL CROPS -->
      <div class="grid">
        <div
          v-for="(data, name) in guide"
          :key="name"
          class="crop-card"
          @click="selectCrop(name)"
        >
          <img
            v-if="getImage(name)"
            :src="getImage(name)"
            alt="Crop"
            class="card-img"
          />
          <h3>{{ name }}</h3>
          <p>🌱 {{ data.season }}</p>
          <p>🌡 {{ data.temperature }} °C</p>
          <p>💧 {{ data.humidity }}%</p>
        </div>
      </div>

      <!-- 🖇 FOOTER -->
      <footer class="footer">
        <a href="https://wa.me/1234567890" target="_blank" class="footer-icon whatsapp">
          <i class="fab fa-whatsapp"></i>
        </a>
        <a href="https://linkedin.com/in/sample-link" target="_blank" class="footer-icon linkedin">
          <i class="fab fa-linkedin"></i>
        </a>
        <a href="https://github.com/sample-link" target="_blank" class="footer-icon github">
          <i class="fab fa-github"></i>
        </a>
        <p class="footer-text">📞 +123 456 7890 | 🌐 sample-link.com</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const crop = ref('')

// Dynamically load images from /src/assets/
const getImage = (name) => {
  try {
    return new URL(
      `../assets/Plant/${name.replace(/\s+/g, '').toLowerCase()}.png`,
      import.meta.url
    ).href
  } catch (err) {
    return null
  }
}

// When user clicks a card, show it in preview
const selectCrop = (name) => {
  crop.value = name
}


// 🌿 Garden guide data
const guide = {
  Tomato: {
    season: 'Oct-Jan',
    temperature: '20-28',
    humidity: '60-70',
    fertilizer: 'Vermicompost + Neem cake',
    watering: '2-3 times/week',
    tips: 'Stake early, 6-8 h sun, remove side shoots.'
  },
  Chili: {
    season: 'Nov-Feb',
    temperature: '21-30',
    humidity: '55-65',
    fertilizer: 'Cow dung + Wood ash',
    watering: '2 times/week',
    tips: 'Avoid waterlogging; add Epsom salt (1 tsp/L) at flowering.'
  },
  Brinjal: {
    season: 'Aug-Dec',
    temperature: '22-35',
    humidity: '60-80',
    fertilizer: 'Farmyard manure + NPK 10:10:10',
    watering: '3 times/week',
    tips: 'Prune lower leaves; control aphids with neem spray.'
  },
  Cucumber: {
    season: 'Feb-May',
    temperature: '20-30',
    humidity: '65-75',
    fertilizer: 'Compost + Bone meal',
    watering: 'Every 2 days',
    tips: 'Provide trellis; harvest early for tenderness.'
  },
  Pumpkin: {
    season: 'May-Aug',
    temperature: '25-32',
    humidity: '70-80',
    fertilizer: 'Organic compost + Potash',
    watering: '3 times/week',
    tips: 'Train vines; pollinate manually if fruiting is poor.'
  },
  Carrot: {
    season: 'Sep-Dec',
    temperature: '15-25',
    humidity: '60-70',
    fertilizer: 'Compost + Wood ash',
    watering: '2 times/week',
    tips: 'Loosen soil; avoid fresh manure to prevent forked roots.'
  },
  Okra: {
    season: 'Mar-Jul',
    temperature: '25-35',
    humidity: '60-70',
    fertilizer: 'Compost + Urea (small dose)',
    watering: '3 times/week',
    tips: 'Harvest regularly; apply neem oil for pest control.'
  },
  Spinach: {
    season: 'Year-round',
    temperature: '18-28',
    humidity: '60-70',
    fertilizer: 'Compost + Cow dung',
    watering: 'Every 2 days',
    tips: 'Keep soil moist; trim leaves to encourage regrowth.'
  },
  BitterGourd: {
    season: 'Feb-May',
    temperature: '22-30',
    humidity: '65-75',
    fertilizer: 'Cow dung + Neem cake',
    watering: '2-3 times/week',
    tips: 'Provide trellis; spray neem oil to control fruit flies.'
  },
  Watermelon: {
    season: 'Jan-Apr',
    temperature: '22-35',
    humidity: '55-70',
    fertilizer: 'Compost + Potash',
    watering: 'Every 3 days',
    tips: 'Grow in sandy soil; avoid overwatering at fruiting stage.'
  },
  Mango: {
    season: 'Feb-Jul (fruiting)',
    temperature: '25-35',
    humidity: '50-65',
    fertilizer: 'Farmyard manure + NPK 8:8:16',
    watering: 'Weekly (young trees)',
    tips: 'Prune after harvest; control anthracnose with copper spray.'
  },
  Banana: {
    season: 'Year-round',
    temperature: '26-32',
    humidity: '70-80',
    fertilizer: 'Compost + Potassium-rich mix',
    watering: 'Every 2 days',
    tips: 'Mulch base; remove suckers; provide wind protection.'
  }
}
</script>

<style scoped>
/* 🌊 Page background wrapper */
.page-background {
  background: linear-gradient(45deg,  #8bc34a 50%, #4caf50 50%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
}

.guide-page {
  width: 90%;
  max-width: 900px;
  min-width: 320px;
  padding: 2rem;
  color: #fff;
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  text-align: center;
  backdrop-filter: blur(6px);
  margin: auto;
}

/* 🌟 Title Glow */
.glow-text {
  font-size: 2.5rem;
  color: #fff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
}

.subtitle {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  opacity: 0.9;
}

/* 🪴 Dropdown */
.crop-selector select {
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: none;
  outline: none;
  margin-bottom: 2rem;
  cursor: pointer;
}

/* 🌿 Preview Card */
.guide-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 2rem;
  margin-bottom: 2rem;
  animation: fadeIn 1s ease forwards;
  text-align: center;
  color: rgb(0, 0, 0);
}

.crop-preview-img {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 0 auto 1rem;
  border-radius: 1rem;
}

/* 🌾 Crop Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.crop-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 1rem;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.crop-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.card-img {
  width: 100%;
  height: 120px;
  object-fit: contain;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

/* 🔄 Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 🖇 Footer */
.footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.footer-icon {
  font-size: 1.8rem;
  margin: 0 0.5rem;
  color: #fff;
  transition: transform 0.3s, color 0.3s;
}

.footer-icon:hover {
  transform: scale(1.2);
  color: #ffd700;
}

.footer-text {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}
</style>

<!-- Add FontAwesome CDN to index.html -->
<!-- 
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
/> 
-->
