<template>
  <div class="dashboard-page">
    <!-- 🌿 Top Search Bar -->
    <header class="dashboard-header">
      <h1 class="glow-text">FarmArogya Market Dashboard</h1>
      <input
        v-model="searchQuery"
        placeholder="Search crops, fruits, vegetables..."
        class="search-input"
      />
    </header>

    <!-- 🪴 Products Grid -->
    <div class="grid">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
      >
        <img
          v-if="getImage(product.name)"
          :src="getImage(product.name)"
          alt="Crop image"
          class="product-img"
        />
        <h3>{{ product.name }}</h3>
        <p>Price: LKR {{ product.price.toLocaleString() }}</p>
        <p>Season: {{ product.season }}</p>
        <p>Temp: {{ product.temperature }} °C</p>
        <p>Humidity: {{ product.humidity }}%</p>
        <button class="btn-glow" @click="addToCart(product)">
          Add to Cart
        </button>
      </div>
    </div>

    <!-- 🛒 Shopping Cart -->
    <aside class="cart-section" v-if="cart.length > 0">
      <h3>🛒 Your Cart</h3>
      <div v-for="item in cart" :key="item.id" class="cart-item">
        <p>{{ item.name }} - LKR {{ item.price.toLocaleString() }} x {{ item.quantity }}</p>
        <button class="btn-remove" @click="removeFromCart(item)">Remove</button>
      </div>
      <p class="total">Total: LKR {{ totalPrice.toLocaleString() }}</p>
      <button class="btn-checkout" @click="checkout">Checkout</button>
    </aside>

    <!-- ✅ Checkout Success -->
    <div v-if="checkoutSuccess" class="checkout-success">
      <h3>Thank you for your order! 🎉</h3>
      <button class="btn-glow" @click="resetCart">Shop More</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 🔎 Search
const searchQuery = ref('')

// 🛒 Cart
const cart = ref([])
const checkoutSuccess = ref(false)

// 🌿 Crop guide data + prices
const guide = {
  Tomato: { season: 'Oct-Jan', temperature: '20-28', humidity: '60-70', price: 250 },
  Chili: { season: 'Nov-Feb', temperature: '21-30', humidity: '55-65', price: 180 },
  Brinjal: { season: 'Aug-Dec', temperature: '22-35', humidity: '60-80', price: 200 },
  Cucumber: { season: 'Feb-May', temperature: '20-30', humidity: '65-75', price: 150 },
  Pumpkin: { season: 'May-Aug', temperature: '25-32', humidity: '70-80', price: 300 },
  Carrot: { season: 'Sep-Dec', temperature: '15-25', humidity: '60-70', price: 120 },
  Okra: { season: 'Mar-Jul', temperature: '25-35', humidity: '60-70', price: 160 },
  Spinach: { season: 'Year-round', temperature: '18-28', humidity: '60-70', price: 100 },
  BitterGourd: { season: 'Feb-May', temperature: '22-30', humidity: '65-75', price: 200 },
  Watermelon: { season: 'Jan-Apr', temperature: '22-35', humidity: '55-70', price: 350 },
  Mango: { season: 'Feb-Jul', temperature: '25-35', humidity: '50-65', price: 500 },
  Banana: { season: 'Year-round', temperature: '26-32', humidity: '70-80', price: 250 }
}

// 💰 Combine guide into product array
const products = Object.entries(guide).map(([name, info]) => ({
  id: Date.now() + Math.random(),
  name,
  ...info
}))

// 🔎 Filter products
const filteredProducts = computed(() =>
  products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// 🖼 Load images from assets
const getImage = (name) => {
  try {
    return new URL(
      `../assets/Plant/${name.replace(/\s+/g, '').toLowerCase()}.png`,
      import.meta.url
    ).href
  } catch {
    return null
  }
}

// 🛒 Cart actions
const addToCart = (product) => {
  const existing = cart.value.find(i => i.id === product.id)
  if (existing) existing.quantity++
  else cart.value.push({ ...product, quantity: 1 })
}

const removeFromCart = (product) => {
  const index = cart.value.findIndex(i => i.id === product.id)
  if (index !== -1) cart.value.splice(index, 1)
}

const totalPrice = computed(() =>
  cart.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
)

const checkout = () => {
  if (!cart.value.length) return
  setTimeout(() => (checkoutSuccess.value = true), 1000)
}

const resetCart = () => {
  cart.value = []
  checkoutSuccess.value = false
  searchQuery.value = ''
}
</script>

<style scoped>
.dashboard-page {
  width: 95%;
  margin: auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.search-input {
  width: 60%;
  padding: 0.7rem;
  border-radius: 0.5rem;
  border: none;
  outline: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.product-card {
  background: rgba(255,255,255,0.2);
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  color: black;
}

.product-img {
  width: 100%;
  height: 120px;
  object-fit: contain;
  border-radius: 0.5rem;
}

.btn-glow {
  background: #ffd700;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

.cart-section {
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 1rem;
  color: #000;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.btn-remove {
  background: #ff4d4d;
  color: #fff;
  border: none;
  border-radius: 0.3rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
}

.total {
  font-weight: bold;
  margin-top: 1rem;
}

.btn-checkout {
  margin-top: 1rem;
  background: #4caf50;
  color: #fff;
  padding: 0.7rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: bold;
}

.checkout-success {
  margin-top: 2rem;
  background: rgba(255,255,255,0.15);
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  color: #000;
}
</style>
