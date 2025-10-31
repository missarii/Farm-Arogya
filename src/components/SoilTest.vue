<template>
  <div class="container">
    <h1>Live Soil & Crop Dashboard</h1>
    <div id="location-info">Loading The Open University of Sri Lanka, Batticaloa…</div>

    <div class="card search-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        @input="debouncedSearch"
        @focus="showResults = true"
        placeholder="Search city, address, or coordinates…"
        id="search-box"
      />
      <div v-if="showResults && searchResults.length" id="search-results">
        <div
          v-for="result in searchResults"
          :key="result.place_id"
          @click="selectSearchResult(result)"
        >
          {{ result.display_name }}
        </div>
      </div>
      <div v-else-if="showResults && !searchResults.length && searchQuery.length >= 2" id="search-results">
        <div>No results</div>
      </div>

      <div id="map" ref="mapContainer"></div>
      <p style="margin:8px 0 0;font-size:.9rem;">Drag the pin • Click a search result • Use buttons below</p>

      <div class="button-group">
        <button class="btn" @click="locateUser">My Location</button>
        <button class="btn" @click="setDefaultLocation">Default Location</button>
        <button class="btn" @click="copyCoords">Copy Coords</button>
        <button class="btn" @click="shareLink">Share Link</button>
        <span class="unit-toggle">
          <input type="checkbox" id="unit-toggle" v-model="isFahrenheit" />
          <label for="unit-toggle">°F</label>
        </span>
      </div>
    </div>

    <div class="card">
      <h2>Weather & Soil – <span id="location-name">{{ locationName }}</span></h2><br>
      <div class="spinner" v-if="loading"></div>
      <div v-else>
        <div id="weather-info" v-html="weatherHTML"></div>
        <div id="soil-info" v-html="soilHTML"></div>
        <div id="crops-info" v-html="cropsHTML"></div>
      </div>
    </div>
  </div>
  <div class="footer">© {{ new Date().getFullYear() }} Soil Dashboard • Data: OpenWeatherMap, SoilGrids, OSM</div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRoute, useRouter } from 'vue-router'

// Fix Leaflet default icon path issue in Vue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// --- API Config ---
const OPENWEATHER_API_KEY = "0b982185a79f72a284d9e7aa070924bf"
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search?format=json&limit=5&q="
const SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"

const DEFAULT_LAT = 7.722623
const DEFAULT_LON = 81.701669
const DEFAULT_NAME = "The Open University of Sri Lanka, Batticaloa"

// --- Reactive State ---
const map = ref(null)
const marker = ref(null)
const mapContainer = ref(null)
const currentLat = ref(DEFAULT_LAT)
const currentLon = ref(DEFAULT_LON)
const locationName = ref(DEFAULT_NAME)
const loading = ref(false)
const isFahrenheit = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)

const locationInfo = ref(null)
const weatherHTML = ref('')
const soilHTML = ref('')
const cropsHTML = ref('')

const route = useRoute()
const router = useRouter()

// --- Debounce ---
const debounce = (fn, delay = 400) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// --- Search ---
const searchLocation = async () => {
  const q = searchQuery.value.trim()
  if (q.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const resp = await fetch(NOMINATIM_URL + encodeURIComponent(q))
    const data = await resp.json()
    searchResults.value = data
  } catch (e) {
    console.error(e)
    searchResults.value = []
  }
}
const debouncedSearch = debounce(searchLocation, 400)

const selectSearchResult = (result) => {
  const lat = parseFloat(result.lat)
  const lon = parseFloat(result.lon)
  updateMapAndData(lat, lon, result.display_name)
  searchQuery.value = result.display_name
  showResults.value = false
}

// --- Map Init ---
const initMap = (lat, lon) => {
  nextTick(() => {
    if (map.value) map.value.remove()

    map.value = L.map(mapContainer.value).setView([lat, lon], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value)

    marker.value = L.marker([lat, lon], { draggable: true })
      .addTo(map.value)
      .bindPopup(`<b>Lat:</b> ${lat.toFixed(6)}<br><b>Lon:</b> ${lon.toFixed(6)}<br><small>Drag to change</small>`)
      .openPopup()

    marker.value.on('dragend', (e) => {
      const { lat: newLat, lng: newLng } = e.target.getLatLng()
      updateMapAndData(newLat, newLng)
    })
  })
}

// --- Geolocation ---
const locateUser = () => {
  locationInfo.value = "Detecting your location…"
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.")
    setDefaultLocation()
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      updateMapAndData(latitude, longitude)
      locationInfo.value = "Using your current location"
    },
    () => {
      alert("Geolocation failed. Using default location.")
      setDefaultLocation()
    }
  )
}

// --- Default Location ---
const setDefaultLocation = () => {
  updateMapAndData(DEFAULT_LAT, DEFAULT_LON, DEFAULT_NAME)
  locationInfo.value = "Default: The Open University of Sri Lanka, Batticaloa"
}

// --- API: Weather ---
const getWeather = async (lat, lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    const resp = await fetch(url)
    const d = await resp.json()
    return {
      temp: d.main.temp,
      humidity: d.main.humidity,
      wind: d.wind.speed,
      name: `${d.name}, ${d.sys.country}`
    }
  } catch (e) {
    console.error(e)
    return { temp: 22, humidity: 55, wind: 2, name: "Batticaloa, LK" }
  }
}

// --- API: SoilGrids ---
const getSoilData = async (lat, lon) => {
  try {
    const resp = await fetch(`${SOILGRIDS_URL}?lat=${lat}&lon=${lon}&property=phh2o,clay,sand,orgc,nitrogen&depth=0-5cm`)
    const json = await resp.json()
    const p = json.properties
    return {
      ph: p.phh2o?.mean?.[0] ?? 6.5,
      clay: p.clay?.mean?.[0] ?? 20,
      sand: p.sand?.mean?.[0] ?? 50,
      orgc: p.orgc?.mean?.[0] ?? 1.2,
      nitrogen: p.nitrogen?.mean?.[0] ?? 0.12
    }
  } catch (e) {
    console.error(e)
    return { ph: 6.5, clay: 20, sand: 50, orgc: 1.2, nitrogen: 0.12 }
  }
}

// --- Soil Analysis ---
const analyzeSoil = (weather, soilRaw) => {
  const { temp, humidity } = weather
  const { ph, clay, sand, orgc, nitrogen } = soilRaw
  const silt = 100 - clay - sand
  let texture = "Loam"
  if (clay > 40) texture = "Clay"
  else if (sand > 70) texture = "Sandy"
  else if (silt > 50) texture = "Silty"

  const phScore = Math.max(0, 100 - Math.abs(ph - 6.5) * 15)
  const ocScore = Math.min(100, orgc * 30)
  const nScore = Math.min(100, nitrogen * 800)
  const moist = humidity / 100
  const fertility = Math.round(phScore * 0.3 + ocScore * 0.25 + nScore * 0.25 + moist * 100 * 0.2)

  return {
    texture,
    ph: ph.toFixed(1),
    fertility,
    moisture: Math.round(moist * 100),
    orgc: orgc.toFixed(2),
    nitrogen: nitrogen.toFixed(3)
  }
}

// --- Crop Recommendations ---
const recommendCrops = (soil, temp) => {
  const crops = [
    { name: "Wheat", ph: [6, 7.5], temp: [10, 30], note: "Good for neutral soils" },
    { name: "Rice", ph: [5.5, 6.5], temp: [20, 35], note: "Paddy, acidic" },
    { name: "Maize", ph: [5.5, 7.5], temp: [18, 32], note: "Warm season" },
    { name: "Potato", ph: [5, 6.5], temp: [10, 25], note: "Cool, acidic" },
    { name: "Barley", ph: [6, 8], temp: [5, 25], note: "Cold tolerant" },
    { name: "Soybean", ph: [6, 7], temp: [20, 30], note: "Legume, N-fixer" },
    { name: "Tomato", ph: [6, 7], temp: [18, 30], note: "Warm, fertile" },
    { name: "Carrot", ph: [5.5, 7], temp: [10, 25], note: "Loose soil" },
    { name: "Spinach", ph: [6, 7.5], temp: [5, 20], note: "Cool season" },
    { name: "Cotton", ph: [5.5, 7], temp: [20, 35], note: "Hot, well-drained" }
  ]
  return crops.filter(c => c.ph[0] <= soil.ph && soil.ph <= c.ph[1] && c.temp[0] <= temp && temp <= c.temp[1])
}

// --- Update Dashboard ---
const updateDashboard = async (lat, lon, name) => {
  loading.value = true
  currentLat.value = lat
  currentLon.value = lon

  const [weather, soilRaw] = await Promise.all([getWeather(lat, lon), getSoilData(lat, lon)])
  const soil = analyzeSoil(weather, soilRaw)
  const crops = recommendCrops(soil, weather.temp)

  const tempDisplay = isFahrenheit.value ? (weather.temp * 1.8 + 32).toFixed(1) : weather.temp.toFixed(1)
  const unit = isFahrenheit.value ? "°F" : "°C"

  locationName.value = name || weather.name
  locationInfo.value = `Location: ${locationName.value}`

  weatherHTML.value = `
    <div class="icon-row"><svg><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg><span><strong>Temp:</strong> ${tempDisplay}${unit}</span></div>
    <div class="icon-row"><svg><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg><span><strong>Humidity:</strong> ${weather.humidity}%</span></div>
    <div class="icon-row"><svg><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg><span><strong>Wind:</strong> ${weather.wind} m/s</span></div>
  `

  soilHTML.value = `
    <div class="icon-row"><svg><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg><span><strong>Texture:</strong> ${soil.texture}</span></div>
    <div class="icon-row"><svg><path d="M7 7h10v10H7z"/><path d="M11 7v10"/></svg><span><strong>pH:</strong> ${soil.ph}</span></div>
    <div class="icon-row"><svg><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span><strong>Fertility Score:</strong> ${soil.fertility}/100</span></div>
    <div class="icon-row"><svg><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg><span><strong>Moisture:</strong> ${soil.moisture}%</span></div>
    <div class="icon-row"><svg><path d="M5 12s2.55-3 5-3 5 3 5 3-2.55 3-5 3-5-3-5-3z"/><path d="M12 7v10"/></svg><span><strong>Organic Carbon:</strong> ${soil.orgc}%</span></div>
    <div class="icon-row"><svg><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><span><strong>Nitrogen:</strong> ${soil.nitrogen}%</span></div>
  `

  const cropList = crops.length
    ? crops.map(c => `<span title="${c.note}">${c.name}</span>`).join(", ")
    : "None under current conditions"
  cropsHTML.value = `<div class="icon-row"><svg><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg><span><strong>Recommended Crops:</strong> ${cropList}</span></div>`

  // Dynamic accent color based on fertility
  const hue = 110 - (soil.fertility * 0.9)
  document.documentElement.style.setProperty('--accent', `hsl(${hue}, 80%, 50%)`)

  loading.value = false
}

// --- Unified Update ---
const updateMapAndData = (lat, lon, name) => {
  currentLat.value = lat
  currentLon.value = lon
  initMap(lat, lon)
  updateDashboard(lat, lon, name)

  // Update URL
  router.replace({ query: { lat: lat.toFixed(6), lon: lon.toFixed(6) } }).catch(() => {})
}

// --- Actions ---
const copyCoords = () => {
  if (!currentLat.value) return alert("No location selected!")
  const txt = `${currentLat.value.toFixed(6)}, ${currentLon.value.toFixed(6)}`
  navigator.clipboard.writeText(txt).then(() => alert(`Copied: ${txt}`))
}

const shareLink = () => {
  if (!currentLat.value) return alert("No location selected!")
  const url = `${window.location.origin}${window.location.pathname}?lat=${currentLat.value.toFixed(6)}&lon=${currentLon.value.toFixed(6)}`
  navigator.clipboard.writeText(url).then(() => alert("Link copied!"))
}

// --- Watchers ---
watch(isFahrenheit, () => {
  if (currentLat.value) updateDashboard(currentLat.value, currentLon.value, locationName.value)
})

// Close search on outside click
const handleClickOutside = (e) => {
  const searchBox = document.getElementById('search-box')
  const results = document.getElementById('search-results')
  if (searchBox && !searchBox.contains(e.target) && results && !results.contains(e.target)) {
    showResults.value = false
  }
}

// --- Lifecycle ---
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  const params = route.query
  if (params.lat && params.lon) {
    const lat = parseFloat(params.lat)
    const lon = parseFloat(params.lon)
    if (!isNaN(lat) && !isNaN(lon)) {
      updateMapAndData(lat, lon)
      return
    }
  }
  setDefaultLocation()
})
</script>

<style scoped>
/* ---------- 2025 “SOIL” DESIGN SYSTEM ---------- */
:root{
  --primary: #1e4d22;
  --primary-light: #3d6b40;
  --accent: #ff6b00;
  --bg: #f5f7f4;
  --surface: #ffffff;
  --text: #1a1a1a;
  --text-muted: #5e6b5f;
  --radius: 20px;
  --ease: cubic-bezier(.34,.6,.08,1);
  --speed: .45s;
}

/* ---------- GLOBAL RESET & TYPO ---------- */
* { box-sizing: border-box; margin: 0; font-feature-settings: "tnum"; }
body {
  font-family: "Inter",-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  scroll-behavior: smooth;
}
h1,h2,h3 { font-weight: 600; letter-spacing: -0.02em; }
p { margin: 0.3em 0; }

/* ---------- CONTAINER & CARDS ---------- */
.container { max-width: 980px; margin: auto; padding: 18px; }
.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 28px;
  margin: 22px 0;
  box-shadow:
    0 1px 1px rgba(0,0,0,.02),
    0 4px 6px -.02px rgba(0,0,0,.04),
    0 10px 20px -.02px rgba(0,0,0,.05);
  transition: transform var(--speed) var(--ease), box-shadow var(--speed) var(--ease);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 1px 1px rgba(0,0,0,.02),
    0 6px 10px -.02px rgba(0,0,0,.06),
    0 16px 32px -.02px rgba(0,0,0,.07);
}

/* ---------- HEADER ---------- */
h1 {
  font-size: 2.2rem;
  color: var(--primary);
  margin: 24px 0 14px;
  animation: titleEnter 1s var(--ease) backwards;
}
@keyframes titleEnter { from { transform: translateY(12px); opacity: 0; } }

/* ---------- SEARCH & MAP ---------- */
.search-wrapper { position: relative; }
#search-box {
  width: 100%;
  padding: 14px 18px 14px 46px;
  font-size: 1rem;
  border: 1px solid #d0d6d1;
  border-radius: 12px;
  background: var(--surface);
  transition: border-color var(--speed), box-shadow var(--speed);
  outline: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%235e6b5f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>');
  background-repeat: no-repeat;
  background-position: 14px center;
  background-size: 20px;
}
#search-box::placeholder { color: #999; opacity: 1; transition: opacity 0.2s ease; }
#search-box:focus::placeholder { opacity: 0; }
#search-box:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(30,77,34,.12); }

#search-results {
  max-height: 200px;
  overflow: auto;
  border: 1px solid #d0d6d1;
  border-top: none;
  border-radius: 0 0 12px 12px;
  background: var(--surface);
  position: absolute;
  width: 100%;
  z-index: 10000;
  display: block;
  box-shadow: 0 8px 16px rgba(0,0,0,.1);
}
#search-results div {
  padding: 10px 18px;
  cursor: pointer;
  transition: background var(--speed);
}
#search-results div:hover { background: #f0f3f0; }

#map { height: 380px; border-radius: var(--radius); margin-top: 14px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,.04); z-index: 1; }

/* ---------- BUTTONS ---------- */
.btn {
  background: var(--primary);
  color: #fff;
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  font-size: .95rem;
  cursor: pointer;
  transition: background var(--speed), transform var(--speed), box-shadow var(--speed);
  box-shadow: 0 1px 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.06);
}
.btn:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 2px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.06);
}
.btn:active { transform: translateY(0); }

.button-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

/* ---------- UNIT TOGGLE ---------- */
.unit-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e9ece7;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: .9rem;
}
.unit-toggle input { accent-color: var(--primary); }

/* ---------- LOADER ---------- */
.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e0e5e1;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .7s linear infinite;
  margin: 18px auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- INFO ROWS ---------- */
#weather-info, #soil-info, #crops-info { display: grid; gap: 10px; animation: fadeUp .7s var(--ease); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } }

/* ---------- LIVE ACCENT COLOUR ---------- */
.card:nth-of-type(2) { border-left: 6px solid var(--accent); transition: border-color .8s var(--ease); }

/* ---------- ICON ROW ---------- */
.icon-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.icon-row svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  stroke: var(--primary);
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---------- FOOTER ---------- */
.footer {
  text-align: center;
  font-size: .75rem;
  color: var(--text-muted);
  margin: 28px 0 14px;
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 600px) {
  #map { height: 300px; }
  h1 { font-size: 1.8rem; }
}
</style>