<template>
  <div class="error-popup" :class="{ show: errorMessage }" id="errorPopup">{{ errorMessage }}</div>
  <button class="sidebar-toggle" @click="toggleSidebar"><i class="fas fa-bars"></i></button>
  <div class="sidebar" :class="{ active: isSidebarActive }">
    <h2>Farm Arogya</h2>
    <ul>
      <li><a href="#" @click.prevent="showView('home')"><i class="fas fa-home"></i> Home</a></li>
      <li><a href="#" @click.prevent="showView('cart')"><i class="fas fa-shopping-cart"></i> Cart</a></li>
      <li><a href="#" @click.prevent="filterProducts('favorites')"><i class="fas fa-heart"></i> Favorites</a></li>
      <li><a href="#" @click.prevent="showView('order')"><i class="fas fa-receipt"></i> Order Summary</a></li>
    </ul>
    <div class="price-range">
      <label for="minPrice">Min Price (LKR)</label>
      <input type="number" id="minPrice" placeholder="0" min="0" v-model.number="minPrice" @input="filterByPrice">
      <label for="maxPrice">Max Price (LKR)</label>
      <input type="number" id="maxPrice" placeholder="Max" min="0" v-model.number="maxPrice" @input="filterByPrice">
      <button class="reset-price" @click="resetPriceRange">Reset Price Range</button>
    </div>
  </div>

  <div class="main-content" :class="{ shifted: isSidebarActive }">
    <header>
      <h1 id="header-title">{{ headerTitle }}</h1>
      <div class="filters" v-if="currentView === 'home'">
        <button :class="{ active: activeFilter === 'vegetable' }" @click="filterProducts('vegetable')">Vegetables</button>
        <button :class="{ active: activeFilter === 'fruit' }" @click="filterProducts('fruit')">Fruits</button>
        <button :class="{ active: activeFilter === 'seeds' }" @click="filterProducts('seeds')">Seeds</button>
        <button :class="{ active: activeFilter === 'favorites' }" @click="filterProducts('favorites')">Favorites</button>
      </div>
      <button id="cartButton" @click="showView('cart')" title="View Cart">🛒</button>
      <button id="themeToggle" @click="toggleTheme" title="Toggle Theme">{{ isDarkMode ? '☀️' : '🌙' }}</button>
    </header>

    <div class="nav-circles" id="nav-circles">
      <span class="circle" :class="{ active: currentView === 'home' }" @click="showView('home')">🥕</span>
      <span class="separator"></span>
      <span class="circle" :class="{ active: currentView === 'product' }" @click="showView('product')">🔍</span>
      <span class="separator"></span>
      <span class="circle" :class="{ active: currentView === 'cart' }" @click="showView('cart')">🛒</span>
      <span class="separator"></span>
      <span class="circle" :class="{ active: currentView === 'order' }" @click="showView('order')">🚚</span>
    </div>

    <div class="header-search" v-if="currentView === 'home'">
      <input type="text" id="searchInput" placeholder="Search products..." v-model="searchQuery" @input="filterBySearch">
      <button id="searchButton" @click="filterBySearch">Search</button>
    </div>

    <div id="dynamic-content">
      <div v-if="currentView === 'home'" class="products" id="product-list">
        <div v-for="(product, index) in paginatedProducts" :key="product.id" class="product" :class="{ liked: likedProducts.includes(product.id) }" :style="{ animationDelay: `${0.1 + index * 0.1}s` }" @click="showQuickView(product.id)">
          <img :src="product.image" :alt="product.name" @error="handleImageError($event, product.name)">
          <div class="product-details">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-meta">
              <span :class="['status-badge', product.stock > 0 ? '' : 'out-of-stock']">{{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}</span>
              <span class="status-badge weight">{{ product.weight }}</span>
              <span v-if="product.off > 0" class="status-badge discount">{{ product.off }}% Off</span>
              <div class="price-container" :class="{ 'no-discount': product.off === 0 }">
                <span v-if="product.off > 0" class="original-price">LKR {{ product.price.toFixed(2) }}</span>
                <span class="discounted-price">LKR {{ getDiscountedPrice(product).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <div class="actions">
            <button class="add" :disabled="product.stock === 0" @click.stop="addToCart(product.id, 1)">Add to Cart</button>
            <button class="quick-view" @click.stop="showQuickView(product.id)">Quick View</button>
            <button class="like" :class="{ liked: likedProducts.includes(product.id) }" @click.stop="toggleLike(product.id)">{{ likedProducts.includes(product.id) ? '♥' : '♡' }}</button>
          </div>
        </div>
        <p v-if="!paginatedProducts.length" style="text-align: center; grid-column: 1 / -1; color: var(--text-color);">No products found.</p>
      </div>

      <div v-if="currentView === 'product'" class="product-container">
        <div class="product-image">
          <img :src="selectedProduct.image" :alt="selectedProduct.name" @error="handleImageError($event, selectedProduct.name)">
        </div>
        <div class="product-details">
          <h2 class="product-name">{{ selectedProduct.name }}</h2>
          <p class="product-desc">{{ selectedProduct.desc }}</p>
          <div class="product-meta">
            <span :class="['status-badge', selectedProduct.stock > 0 ? '' : 'out-of-stock']">{{ selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock' }}</span>
            <span class="status-badge weight">{{ selectedProduct.weight }}</span>
            <span v-if="selectedProduct.off > 0" class="status-badge discount">{{ selectedProduct.off }}% Off</span>
            <div class="price-container" :class="{ 'no-discount': selectedProduct.off === 0 }">
              <span v-if="selectedProduct.off > 0" class="original-price">LKR {{ selectedProduct.price.toFixed(2) }}</span>
              <span class="discounted-price">LKR {{ getDiscountedPrice(selectedProduct).toFixed(2) }}</span>
            </div>
          </div>
          <div class="quantity-control">
            <button @click="adjustQuantity(selectedProduct.id, -1)">-</button>
            <input type="number" :id="`quantity-${selectedProduct.id}`" v-model.number="selectedQuantity" :min="1" :max="selectedProduct.stock">
            <button @click="adjustQuantity(selectedProduct.id, 1)" :disabled="selectedProduct.stock === 0">+</button>
          </div>
          <div class="actions">
            <button class="add" :disabled="selectedProduct.stock === 0" @click="addToCart(selectedProduct.id, selectedQuantity)">Add to Cart</button>
            <button class="back" @click="showView('home')">Back</button>
          </div>
        </div>
      </div>

      <div v-if="currentView === 'cart'" class="cart-container">
        <div v-if="cart.length === 0" style="text-align: center; color: var(--text-color);">Your cart is empty.</div>
        <div v-else v-for="item in cart" :key="item.id" class="cart-item">
          <img :src="getProduct(item.id).image" :alt="getProduct(item.id).name" @error="handleImageError($event, getProduct(item.id).name)">
          <div class="cart-details">
            <h3>{{ getProduct(item.id).name }}</h3>
            <p>Price: LKR {{ getDiscountedPrice(getProduct(item.id)).toFixed(2) }}</p>
            <div class="quantity-control-cart">
              <button @click="adjustCartQuantity(item.id, -1)">-</button>
              <input type="number" :value="item.qty" readonly>
              <button @click="adjustCartQuantity(item.id, 1)" :disabled="getProduct(item.id).stock === 0">+</button>
            </div>
            <p>Total: LKR {{ (getDiscountedPrice(getProduct(item.id)) * item.qty).toFixed(2) }}</p>
          </div>
          <div class="cart-actions">
            <button class="remove" @click="removeFromCart(item.id)">Remove</button>
          </div>
        </div>
        <div class="total">Total: LKR {{ cartTotal.toFixed(2) }}</div>
        <div class="actions">
          <button class="back" @click="showView('home')">Continue Shopping</button>
          <button class="add" @click="showView('order')">Checkout</button>
        </div>
      </div>

      <div v-if="currentView === 'order'" class="checkout-container">
        <h2>Enter Your Details</h2>
        <div>
          <input type="text" id="name" placeholder="Full Name" v-model="orderDetails.name" required>
          <textarea id="address" placeholder="Address" rows="3" v-model="orderDetails.address" required></textarea>
          <input type="tel" id="contact" placeholder="Contact Number" v-model="orderDetails.contact" required>
          <textarea id="note" placeholder="Additional Note (Optional)" rows="2" v-model="orderDetails.note"></textarea>
          <button class="add" @click="generateOrder">Checkout & Generate Summary</button>
        </div>
        <div id="orderSummary" v-if="showOrderSummary">
          <h2>Order Summary</h2>
          <table class="order-table" id="orderTable">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cart" :key="item.id">
                <td>{{ getProduct(item.id).name }}</td>
                <td>{{ item.qty }}</td>
                <td>LKR {{ getProduct(item.id).price.toFixed(2) }}</td>
                <td>{{ getProduct(item.id).off > 0 ? getProduct(item.id).off + '%' : '0%' }}</td>
                <td>LKR {{ (getDiscountedPrice(getProduct(item.id)) * item.qty).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="summary" id="totals">
            Subtotal: LKR {{ orderSubtotal.toFixed(2) }}<br>
            Tax (10%): LKR {{ orderTax.toFixed(2) }}<br>
            Delivery: LKR {{ orderDelivery.toFixed(2) }}<br>
            <strong>Total: LKR {{ orderTotal.toFixed(2) }}</strong>
          </div>
          <p id="thankYou">Thank you {{ orderDetails.name }}! Your Order ID is #{{ lastOrderId }}</p>
          <button class="add" @click="downloadPDF">Download PDF</button>
        </div>
      </div>
    </div>

    <footer>
      <div>
        <h4>Farm Arogya</h4>
        <p>Premium organic vegetables, fruits, and seeds delivered fresh to your door.</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <p><a href="#vegetables">Vegetables</a></p>
        <p><a href="#fruits">Fruits</a></p>
        <p><a href="#seeds">Seeds</a></p>
        <p><a href="#offers">Seasonal Offers</a></p>
        <p><a href="#">About Us</a></p>
      </div>
      <div>
        <h4>Customer Service</h4>
        <p><a href="#">Contact Us</a></p>
        <p><a href="#shipping">Shipping Info</a></p>
        <p><a href="#returns">Returns</a></p>
        <p><a href="#faq">FAQ</a></p>
      </div>
      <div>
        <h4>Get in Touch</h4>
        <p>📞 <a href="tel:+94749768651">+94 74 976 8651</a></p>
        <p>✉ <a href="mailto:farmarogya@gmail.com">farmarogya@gmail.com</a></p>
        <p>🏠 No. 27, Lake Road, Kallady, Batticaloa, Sri Lanka</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const products = ref([
  { id: 1, name: "Tomato", category: "vegetable", price: 500.00, weight: "1kg", stock: 10, off: 10, desc: "Fresh ripe tomatoes sourced from local farms.", image: "images/tomato.jpg", color: "#e74c3c" },
  { id: 2, name: "Potato", category: "vegetable", price: 350.00, weight: "1kg", stock: 0, off: 0, desc: "Golden potatoes suitable for mashing, roasting, or frying.", image: "images/potato.jpg", color: "#d4a373" },
  { id: 3, name: "Carrot", category: "vegetable", price: 400.00, weight: "1kg", stock: 12, off: 5, desc: "Crisp orange carrots packed with vitamins.", image: "images/carrot.jpg", color: "#e67e22" },
  { id: 4, name: "Onion", category: "vegetable", price: 300.00, weight: "1kg", stock: 15, off: 0, desc: "Red onions with sharp flavor.", image: "images/onion.jpg", color: "#8b4513" },
  { id: 5, name: "Garlic", category: "vegetable", price: 250.00, weight: "500g", stock: 20, off: 5, desc: "Fresh garlic bulbs for seasoning.", image: "images/garlic.jpg", color: "#f5f5dc" },
  { id: 6, name: "Spinach", category: "vegetable", price: 200.00, weight: "500g", stock: 8, off: 10, desc: "Nutritious spinach leaves.", image: "images/spinach.jpg", color: "#228b22" },
  { id: 7, name: "Broccoli", category: "vegetable", price: 450.00, weight: "1kg", stock: 14, off: 0, desc: "Vibrant broccoli florets.", image: "images/broccoli.jpg", color: "#32cd32" },
  { id: 8, name: "Cabbage", category: "vegetable", price: 280.00, weight: "1kg", stock: 18, off: 5, desc: "Crisp green cabbage.", image: "images/cabbage.jpg", color: "#90ee90" },
  { id: 9, name: "Lettuce", category: "vegetable", price: 150.00, weight: "1kg", stock: 16, off: 0, desc: "Fresh romaine lettuce.", image: "images/lettuce.jpg", color: "#adff2f" },
  { id: 10, name: "Cucumber", category: "vegetable", price: 220.00, weight: "1kg", stock: 11, off: 10, desc: "Cool cucumbers.", image: "images/cucumber.jpg", color: "#90ee90" },
  { id: 11, name: "Bell Pepper", category: "vegetable", price: 380.00, weight: "500g", stock: 9, off: 5, desc: "Colorful bell peppers.", image: "images/bellpepper.jpg", color: "#ff4500" },
  { id: 12, name: "Zucchini", category: "vegetable", price: 320.00, weight: "1kg", stock: 13, off: 0, desc: "Tender zucchini.", image: "images/zucchini.jpg", color: "#9acd32" },
  { id: 13, name: "Eggplant", category: "vegetable", price: 290.00, weight: "1kg", stock: 7, off: 15, desc: "Glossy eggplants.", image: "images/eggplant.jpg", color: "#4b0082" },
  { id: 14, name: "Cauliflower", category: "vegetable", price: 410.00, weight: "1kg", stock: 17, off: 5, desc: "White cauliflower heads.", image: "images/cauliflower.jpg", color: "#fff8dc" },
  { id: 15, name: "Green Beans", category: "vegetable", price: 260.00, weight: "500g", stock: 19, off: 0, desc: "Crisp green beans.", image: "images/greenbeans.jpg", color: "#228b22" },
  { id: 16, name: "Peas", category: "vegetable", price: 180.00, weight: "500g", stock: 12, off: 10, desc: "Sweet peas.", image: "images/peas.jpg", color: "#32cd32" },
  { id: 17, name: "Radish", category: "vegetable", price: 120.00, weight: "500g", stock: 15, off: 0, desc: "Spicy radishes.", image: "images/radish.jpg", color: "#ff1493" },
  { id: 18, name: "Beetroot", category: "vegetable", price: 340.00, weight: "1kg", stock: 6, off: 5, desc: "Earthy beetroots.", image: "images/beetroot.jpg", color: "#8b0000" },
  { id: 19, name: "Kale", category: "vegetable", price: 230.00, weight: "500g", stock: 10, off: 10, desc: "Robust kale leaves.", image: "images/kale.jpg", color: "#006400" },
  { id: 20, name: "Asparagus", category: "vegetable", price: 550.00, weight: "500g", stock: 5, off: 0, desc: "Tender asparagus spears.", image: "images/asparagus.jpg", color: "#7cfc00" },
  { id: 21, name: "Apple", category: "fruit", price: 800.00, weight: "1kg", stock: 15, off: 5, desc: "Crisp red apples.", image: "images/apple.jpg", color: "#e74c3c" },
  { id: 22, name: "Mango", category: "fruit", price: 1200.00, weight: "1kg", stock: 8, off: 10, desc: "Sweet, juicy mangoes.", image: "images/mango.jpg", color: "#f1c40f" },
  { id: 23, name: "Banana", category: "fruit", price: 250.00, weight: "1kg", stock: 20, off: 0, desc: "Ripe bananas.", image: "images/banana.jpg", color: "#ffd700" },
  { id: 24, name: "Orange", category: "fruit", price: 450.00, weight: "1kg", stock: 14, off: 5, desc: "Juicy oranges.", image: "images/orange.jpg", color: "#ffa500" },
  { id: 25, name: "Strawberry", category: "fruit", price: 650.00, weight: "500g", stock: 12, off: 10, desc: "Fresh strawberries.", image: "images/strawberry.jpg", color: "#ff69b4" },
  { id: 26, name: "Blueberry", category: "fruit", price: 900.00, weight: "500g", stock: 9, off: 0, desc: "Antioxidant-rich blueberries.", image: "images/blueberry.jpg", color: "#4682b4" },
  { id: 27, name: "Pineapple", category: "fruit", price: 700.00, weight: "1kg", stock: 11, off: 15, desc: "Tropical pineapples.", image: "images/pineapple.jpg", color: "#ffd700" },
  { id: 28, name: "Grapes", category: "fruit", price: 550.00, weight: "500g", stock: 16, off: 5, desc: "Seedless grapes.", image: "images/grapes.jpg", color: "#8b0000" },
  { id: 29, name: "Kiwi", category: "fruit", price: 400.00, weight: "500g", stock: 13, off: 0, desc: "Fuzzy kiwis.", image: "images/kiwi.jpg", color: "#7cfc00" },
  { id: 30, name: "Lemon", category: "fruit", price: 200.00, weight: "1kg", stock: 18, off: 10, desc: "Zesty lemons.", image: "images/lemon.jpg", color: "#fffacd" },
  { id: 31, name: "Lime", category: "fruit", price: 220.00, weight: "500g", stock: 17, off: 0, desc: "Tangy limes.", image: "images/lime.jpg", color: "#90ee90" },
  { id: 32, name: "Watermelon", category: "fruit", price: 350.00, weight: "1kg", stock: 10, off: 5, desc: "Refreshing watermelon.", image: "images/watermelon.jpg", color: "#ff4500" },
  { id: 33, name: "Cantaloupe", category: "fruit", price: 480.00, weight: "1kg", stock: 7, off: 10, desc: "Sweet cantaloupe.", image: "images/cantaloupe.jpg", color: "#ffdab9" },
  { id: 34, name: "Peach", category: "fruit", price: 600.00, weight: "1kg", stock: 14, off: 0, desc: "Juicy peaches.", image: "images/peach.jpg", color: "#ffc0cb" },
  { id: 35, name: "Plum", category: "fruit", price: 380.00, weight: "1kg", stock: 15, off: 5, desc: "Plump plums.", image: "images/plum.jpg", color: "#dda0dd" },
  { id: 36, name: "Cherry", category: "fruit", price: 750.00, weight: "500g", stock: 6, off: 15, desc: "Bing cherries.", image: "images/cherry.jpg", color: "#dc143c" },
  { id: 37, name: "Pear", category: "fruit", price: 420.00, weight: "1kg", stock: 12, off: 0, desc: "Bosc pears.", image: "images/pear.jpg", color: "#f0e68c" },
  { id: 38, name: "Papaya", category: "fruit", price: 500.00, weight: "1kg", stock: 9, off: 10, desc: "Tropical papaya.", image: "images/papaya.jpg", color: "#ff1493" },
  { id: 39, name: "Pomegranate", category: "fruit", price: 680.00, weight: "500g", stock: 8, off: 5, desc: "Ruby pomegranate seeds.", image: "images/pomegranate.jpg", color: "#b22222" },
  { id: 40, name: "Avocado", category: "fruit", price: 850.00, weight: "1kg", stock: 11, off: 0, desc: "Creamy avocados.", image: "images/avocado.jpg", color: "#90ee90" },
  { id: 41, name: "Pumpkin Seeds", category: "seeds", price: 600.00, weight: "250g", stock: 20, off: 5, desc: "Roasted pumpkin seeds, perfect for planting or snacking.", image: "images/pumpkin-seeds.jpg", color: "#d2b48c" },
  { id: 42, name: "Sunflower Seeds", category: "seeds", price: 450.00, weight: "250g", stock: 18, off: 10, desc: "High-quality sunflower seeds for gardening or eating.", image: "images/sunflower-seeds.jpg", color: "#ffc107" },
  { id: 43, name: "Chia Seeds", category: "seeds", price: 700.00, weight: "200g", stock: 15, off: 0, desc: "Nutritious chia seeds for planting or culinary use.", image: "images/chia-seeds.jpg", color: "#3c2f2f" },
  { id: 44, name: "Basil Seeds", category: "seeds", price: 300.00, weight: "100g", stock: 25, off: 5, desc: "Organic basil seeds for growing fresh herbs.", image: "images/basil-seeds.jpg", color: "#228b22" },
  { id: 45, name: "Tomato Seeds", category: "seeds", price: 350.00, weight: "100g", stock: 22, off: 0, desc: "Heirloom tomato seeds for home gardening.", image: "images/tomato-seeds.jpg", color: "#e74c3c" },
  { id: 46, name: "Coriander Seeds", category: "seeds", price: 320.00, weight: "100g", stock: 20, off: 5, desc: "Organic coriander seeds for planting or culinary use.", image: "images/coriander-seeds.jpg", color: "#8b4513" },
  { id: 47, name: "Fenugreek Seeds", category: "seeds", price: 400.00, weight: "150g", stock: 18, off: 0, desc: "Nutritious fenugreek seeds for gardening or cooking.", image: "images/fenugreek-seeds.jpg", color: "#d2b48c" },
  { id: 48, name: "Mustard Seeds", category: "seeds", price: 280.00, weight: "100g", stock: 22, off: 10, desc: "Spicy mustard seeds for planting or seasoning.", image: "images/mustard-seeds.jpg", color: "#ffa500" },
  { id: 49, name: "Cucumber Seeds", category: "seeds", price: 360.00, weight: "100g", stock: 19, off: 5, desc: "High-yield cucumber seeds for home gardening.", image: "images/cucumber-seeds.jpg", color: "#90ee90" },
  { id: 50, name: "Spinach Seeds", category: "seeds", price: 340.00, weight: "100g", stock: 21, off: 0, desc: "Organic spinach seeds for fresh greens.", image: "images/spinach-seeds.jpg", color: "#228b22" }
]);

const isSidebarActive = ref(false);
const currentView = ref('home');
const activeFilter = ref('all');
const searchQuery = ref('');
const minPrice = ref(0);
const maxPrice = ref(Infinity);
const currentPage = ref(1);
const productsPerPage = 15;
const likedProducts = ref(JSON.parse(localStorage.getItem('likedProducts') || '[]'));
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'));
const lastOrderId = ref(parseInt(localStorage.getItem('lastOrderId') || '0'));
const errorMessage = ref('');
const selectedProduct = ref({});
const selectedQuantity = ref(1);
const orderDetails = ref({ name: '', address: '', contact: '', note: '' });
const showOrderSummary = ref(false);
const orderSubtotal = ref(0);
const orderTax = ref(0);
const orderDelivery = ref(200);
const orderTotal = ref(0);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

const headerTitle = computed(() => {
  return currentView.value === 'home' ? 'Farm Arogya - Buy and Sell platform' :
         currentView.value === 'product' ? 'Product Details' :
         currentView.value === 'cart' ? 'Your Cart' : 'Order Summary';
});

const filteredProducts = computed(() => {
  let filtered = activeFilter.value === 'favorites' ? products.value.filter(p => likedProducts.value.includes(p.id)) :
                activeFilter.value === 'all' ? products.value :
                products.value.filter(p => p.category === activeFilter.value);
  return filtered.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const discountedPrice = p.off > 0 ? Math.round(p.price * (1 - p.off / 100)) : p.price;
    return matchesQuery && discountedPrice >= minPrice.value && discountedPrice <= maxPrice.value;
  });
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * productsPerPage;
  const end = start + productsPerPage;
  return filteredProducts.value.slice(start, end);
});

const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => {
    const product = products.value.find(p => p.id === item.id);
    if (!product) return total;
    const discountedPrice = product.off > 0 ? Math.round(product.price * (1 - product.off / 100)) : product.price;
    return total + discountedPrice * item.qty;
  }, 0);
});

const toggleSidebar = () => {
  isSidebarActive.value = !isSidebarActive.value;
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

const showError = (message) => {
  errorMessage.value = message;
  setTimeout(() => errorMessage.value = '', 3000);
};

const saveLikes = () => {
  localStorage.setItem('likedProducts', JSON.stringify(likedProducts.value));
};

const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart.value));
};

const toggleLike = (productId) => {
  const index = likedProducts.value.indexOf(productId);
  if (index > -1) {
    likedProducts.value.splice(index, 1);
  } else {
    likedProducts.value.push(productId);
  }
  saveLikes();
  if (activeFilter.value === 'favorites' && currentView.value === 'home') {
    displayProducts();
  }
};

const getDiscountedPrice = (product) => {
  return product.off > 0 ? Math.round(product.price * (1 - product.off / 100)) : product.price;
};

const displayProducts = () => {
  currentPage.value = 1;
  if (!filteredProducts.value.length) {
    showError('No products found.');
  }
};

const addToCart = (productId, qty) => {
  const product = products.value.find(p => p.id === productId);
  if (product.stock === 0) {
    showError('Cannot add to cart: Product is out of stock.');
    return;
  }
  if (qty > product.stock) {
    showError(`Cannot add ${qty} items. Only ${product.stock} available.`);
    return;
  }
  const cartItem = cart.value.find(item => item.id === productId);
  if (cartItem) {
    if (cartItem.qty + qty > product.stock) {
      showError(`Cannot add ${qty} more items. Only ${product.stock - cartItem.qty} available.`);
      return;
    }
    cartItem.qty += qty;
  } else {
    cart.value.push({ id: productId, qty });
  }
  saveCart();
  showError(`Added ${qty} ${product.name} to cart.`);
};

const showQuickView = (productId) => {
  currentView.value = 'product';
  selectedProduct.value = products.value.find(p => p.id === productId);
  if (!selectedProduct.value) {
    showError('Product not found.');
    return;
  }
  selectedQuantity.value = 1;
};

const adjustQuantity = (productId, delta) => {
  const product = products.value.find(p => p.id === productId);
  let qty = selectedQuantity.value + delta;
  if (qty < 1) qty = 1;
  if (qty > product.stock) {
    showError(`Cannot select ${qty} items. Only ${product.stock} available.`);
    qty = product.stock;
  }
  selectedQuantity.value = qty;
};

const adjustCartQuantity = (productId, delta) => {
  const product = products.value.find(p => p.id === productId);
  const cartItem = cart.value.find(item => item.id === productId);
  if (!cartItem) return;
  let qty = cartItem.qty + delta;
  if (qty < 1) {
    cart.value = cart.value.filter(item => item.id !== productId);
  } else if (qty > product.stock) {
    showError(`Cannot add more. Only ${product.stock} available.`);
    return;
  } else {
    cartItem.qty = qty;
  }
  saveCart();
};

const removeFromCart = (productId) => {
  cart.value = cart.value.filter(item => item.id !== productId);
  saveCart();
};

const showView = (view) => {
  currentView.value = view;
  if (view === 'home') {
    displayProducts();
  }
};

const filterProducts = (category) => {
  activeFilter.value = category;
  currentPage.value = 1;
  displayProducts();
};

const filterBySearch = () => {
  currentPage.value = 1;
  displayProducts();
};

const filterByPrice = () => {
  currentPage.value = 1;
  displayProducts();
};

const resetPriceRange = () => {
  minPrice.value = 0;
  maxPrice.value = Infinity;
  displayProducts();
};

const getProduct = (productId) => {
  return products.value.find(p => p.id === productId) || {};
};

const generateOrder = () => {
  if (cart.value.length === 0) {
    showError('Your cart is empty!');
    return;
  }
  const { name, address, contact } = orderDetails.value;
  if (!name || !address || !contact) {
    showError('Please fill all required fields');
    return;
  }

  lastOrderId.value++;
  localStorage.setItem('lastOrderId', lastOrderId.value);

  orderSubtotal.value = cart.value.reduce((sum, item) => {
    const prod = getProduct(item.id);
    const discountedPrice = prod.off > 0 ? Math.round(prod.price * (1 - prod.off / 100)) : prod.price;
    return sum + discountedPrice * item.qty;
  }, 0);
  orderTax.value = orderSubtotal.value * 0.1;
  orderTotal.value = orderSubtotal.value + orderTax.value + orderDelivery.value;
  showOrderSummary.value = true;
};

const downloadPDF = () => {
  if (cart.value.length === 0) {
    showError('Cannot generate PDF: Cart is empty.');
    return;
  }
  const { name, address, contact } = orderDetails.value;
  if (!name || !address || !contact) {
    showError('Please fill all required fields before generating PDF.');
    return;
  }
  try {
    const printContainer = document.createElement('div');
    printContainer.id = 'print-order-summary';
    printContainer.style.position = 'absolute';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '100%';
    printContainer.style.background = '#ffffff';
    printContainer.style.padding = '20px';
    printContainer.style.fontFamily = '"Helvetica", sans-serif';
    document.body.appendChild(printContainer);

    let htmlContent = `
      <div>
        <h1 style="color: #2e7d32; font-size: 24px; text-align: center;">Farm Arogya - Order Summary</h1>
        <hr style="border: 0.5px solid #2e7d32; margin: 10px 0;">
        <p><strong>Order ID:</strong> #${lastOrderId.value}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <h2 style="color: #2e7d32; font-size: 18px; margin-top: 20px;">Customer Details</h2>
        <p><strong>Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Address:</strong> ${address || 'N/A'}</p>
        <p><strong>Contact:</strong> ${contact || 'N/A'}</p>
        <p><strong>Note:</strong> ${orderDetails.value.note || 'None'}</p>
        <h2 style="color: #2e7d32; font-size: 18px; margin-top: 20px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #2e7d32; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #ccc;">Item</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Unit Price</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Discount</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Total</th>
            </tr>
          </thead>
          <tbody>
    `;

    let hasValidItems = false;
    cart.value.forEach((item, index) => {
      const prod = getProduct(item.id);
      if (!prod || !prod.price) {
        console.warn(`Product with ID ${item.id} not found or invalid.`);
        return;
      }
      hasValidItems = true;
      const discountedPrice = prod.off > 0 ? Math.round(prod.price * (1 - prod.off / 100)) : prod.price;
      const total = discountedPrice * item.qty;
      htmlContent += `
        <tr style="${index % 2 === 0 ? 'background: #f4f8f3;' : ''}">
          <td style="padding: 8px; border: 1px solid #ccc;">${prod.name || 'Unknown'}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${item.qty}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">LKR ${prod.price.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${prod.off > 0 ? `${prod.off}%` : '0%'}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">LKR ${total.toFixed(2)}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
        <div style="margin-top: 20px; font-size: 14px;">
          <p><strong>Subtotal:</strong> LKR ${orderSubtotal.value.toFixed(2)}</p>
          <p><strong>Tax (10%):</strong> LKR ${orderTax.value.toFixed(2)}</p>
          <p><strong>Delivery:</strong> LKR ${orderDelivery.value.toFixed(2)}</p>
          <p style="color: #2e7d32; font-weight: bold;"><strong>Total:</strong> LKR ${orderTotal.value.toFixed(2)}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; text-align: center;">Thank you ${name || 'Customer'}! Your order has been confirmed.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">© 2025 Farm Arogya. All Rights Reserved.</p>
      </div>
    `;

    if (!hasValidItems) {
      document.body.removeChild(printContainer);
      showError('No valid items in cart to generate PDF.');
      return;
    }

    printContainer.innerHTML = htmlContent;

    console.log('Print content:', htmlContent);

    printContainer.offsetHeight;

    document.body.classList.add('printing');

    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
      document.body.removeChild(printContainer);
      cart.value = [];
      saveCart();
      showError('Order confirmed! Use the print dialog to save as PDF.');
      showView('home');
    }, 100);
  } catch (error) {
    console.error('Error generating print view:', error);
    showError('Failed to generate print view. Please try again.');
    const printContainer = document.getElementById('print-order-summary');
    if (printContainer) {
      document.body.removeChild(printContainer);
    }
    document.body.classList.remove('printing');
  }
};

const handleImageError = (event, name) => {
  event.target.src = `https://via.placeholder.com/${currentView.value === 'home' ? '250x180' : currentView.value === 'product' ? '300x200' : '100x100'}?text=${name}`;
};

onMounted(() => {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
    isDarkMode.value = true;
  }
  displayProducts();
});
</script>

<style>
:root {
  --bg-color: #f4f6f8;
  --card-bg: #ffffff;
  --text-color: #1a1a1a;
  --text-secondary: #4a4a4a;
  --border-color: #d1d5db;
  --header-bg: #2e7d32;
  --header-text: #ffffff;
  --filter-bg: #ffffff;
  --filter-text: #4a4a4a;
  --filter-active-bg: #2e7d32;
  --filter-active-text: #ffffff;
  --search-border: #d1d5db;
  --badge-bg: #f1f3f5;
  --badge-text: #4a4a4a;
  --price-discount: #e63946;
  --price-normal: #2e7d32;
  --shadow-light: rgba(0,0,0,0.1);
  --shadow-hover: rgba(0,0,0,0.2);
  --green-tint: rgba(46,125,50,0.1);
  --sidebar-bg: #f1f3f5;
  --sidebar-text: #1a1a1a;
  --footer-bg: #2e7d32;
  --footer-text: #ffffff;
  --error-bg: #fee2e2;
  --error-text: #b91c1c;
  --nav-emoji-bg: #e8f5e9;
  --nav-emoji-active-bg: #2e7d32;
  --nav-emoji-text: #1a1a1a;
  --button-bg: #388e3c;
  --button-hover: #1b5e20;
}

.dark {
  --bg-color: #1a1a1a;
  --card-bg: #2d2d2d;
  --text-color: #e5e7eb;
  --text-secondary: #9ca3af;
  --border-color: #4b5563;
  --header-bg: #1b5e20;
  --header-text: #e5e7eb;
  --filter-bg: #374151;
  --filter-text: #9ca3af;
  --filter-active-bg: #2e7d32;
  --filter-active-text: #e5e7eb;
  --search-border: #4b5563;
  --badge-bg: #374151;
  --badge-text: #9ca3af;
  --price-discount: #f87171;
  --price-normal: #4caf50;
  --shadow-light: rgba(0,0,0,0.4);
  --shadow-hover: rgba(0,0,0,0.6);
  --green-tint: rgba(46,125,50,0.2);
  --sidebar-bg: #2d2d2d;
  --sidebar-text: #e5e7eb;
  --footer-bg: #1b5e20;
  --footer-text: #e5e7eb;
  --error-bg: #7f1d1d;
  --error-text: #fecaca;
  --nav-emoji-bg: #374151;
  --nav-emoji-active-bg: #2e7d32;
  --nav-emoji-text: #e5e7eb;
  --button-bg: #4caf50;
  --button-hover: #1b5e20;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Poppins', sans-serif;
  background: var(--bg-color) !important;
  color: var(--text-color) !important;
  min-height: 100vh;
  transition: background 0.3s ease, color 0.3s ease;
}

.sidebar {
  width: 260px;
  background: var(--sidebar-bg) !important;
  color: var(--sidebar-text) !important;
  height: 100vh;
  position: fixed;
  top: 0;
  left: -370px;
  transition: left 0.3s ease;
  padding: 30px 20px;
  box-shadow: 2px 0 10px var(--shadow-light);
  z-index: 1000;
  overflow-y: auto;
}
.sidebar.active {
  left: 0;
}
.sidebar-toggle {
  position: fixed;
  top: 30px;
  left: 5px;
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 1001;
  font-size: 18px;
  transition: transform 0.3s ease;
}
.sidebar-toggle:hover {
  transform: scale(1.1);
}
.sidebar h2 {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  margin: 0 0 30px;
  text-align: center;
  color: var(--price-normal) !important;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar ul li {
  margin: 15px 0;
}
.sidebar ul li a {
  color: var(--sidebar-text) !important;
  text-decoration: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.sidebar ul li a:hover {
  background: var(--green-tint);
  transform: translateX(5px);
}
.sidebar ul li a i {
  font-size: 18px;
}
.price-range {
  margin: 30px 0;
}
.price-range label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color) !important;
}
.price-range input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg) !important;
  color: var(--text-color) !important;
  font-size: 14px;
}
.price-range input:focus {
  border-color: var(--filter-active-bg);
  outline: none;
}
.reset-price {
  margin-top: 10px;
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}
.reset-price:hover {
  background: var(--button-hover) !important;
  transform: translateY(-2px);
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 30px;
  transition: margin-left 0.3s ease;
  background: var(--card-bg) !important;
  border-radius: 12px;
}
.main-content.shifted {
  margin-left: 290px;
}

header {
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--shadow-light);
  animation: slideDown 0.6s ease-out;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
}
header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  margin: 0;
  color: var(--header-text) !important;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.filters button {
  padding: 8px 16px;
  border-radius: 25px;
  border: 1px solid var(--header-text);
  cursor: pointer;
  font-weight: 500;
  background: transparent;
  color: var(--header-text) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.filters button:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}
.filters button.active {
  background: var(--filter-active-bg);
  color: var(--filter-active-text) !important;
  transform: scale(1.05);
}
#themeToggle {
  background: none;
  border: 1px solid var(--header-text);
  color: var(--header-text) !important;
  padding: 8px 12px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  position: fixed;
  top: 40px;
  right: 80px;
  z-index: 2;
}
#themeToggle:hover {
  transform: scale(1.1);
}
#cartButton {
  background: none;
  border: 1px solid var(--header-text);
  color: var(--header-text) !important;
  padding: 8px 12px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  position: fixed;
  top: 40px;
  right: 150px;
  z-index: 2;
}
#cartButton:hover {
  transform: scale(1.1);
}
@keyframes slideDown {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.header-search {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: -70px;
  margin-left:0px;
}
#searchInput {
  padding: 4px 2px 4px 14px;
  border-radius: 25px;
  border: 2px solid var(--search-border);
  font-size: 14px;
  background: var(--card-bg) !important;
  color: var(--text-color) !important;
  width: 180px;
  height: 30px;

}
#searchInput:focus {
  border-color: var(--filter-active-bg);
  outline: none;
}
#searchInput::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}
#searchButton {
  padding: 8px 16px;
  border-radius: 25px;
  border: 2px solid var(--search-border);
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
#searchButton:hover {
  background: var(--button-hover) !important;
  transform: translateY(-2px);
}

.nav-circles {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  padding: 10px;
  background: var(--card-bg) !important;
  border-radius: 25px;
  box-shadow: 0 4px 12px var(--shadow-light);
  z-index: 2;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}
.nav-circles .circle {
  width: 40px;
  height: 40px;
  background: var(--nav-emoji-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.nav-circles .circle.active {
  background: var(--nav-emoji-active-bg);
  color: var(--header-text) !important;
  transform: scale(1.2);
  box-shadow: 0 0 8px var(--shadow-light);
}
.nav-circles .circle:hover {
  background: var(--filter-active-bg);
  transform: scale(1.15);
}
.nav-circles .separator {
  width: 50px;
  height: 2px;
  background: var(--border-color);
  margin: 0 5px;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  padding: 20px 0;
}

.product {
  background: var(--card-bg) !important;
  border-radius: 16px;
  box-shadow: 0 4px 12px var(--shadow-light);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease-out forwards;
  width: 250px;
}
.product:hover {
  transform: translateY(-8px) rotate(0.5deg);
  box-shadow: 0 12px 30px var(--shadow-hover);
  background: var(--green-tint);
}
.product.liked {
  border-left: 4px solid var(--price-normal);
}

.product img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product:hover img {
  transform: scale(1.05);
  animation: wiggle 1s ease-in-out infinite;
}
@keyframes wiggle {
  0%, 100% { transform: scale(1.05) rotate(0deg); }
  25% { transform: scale(1.05) rotate(1deg); }
  75% { transform: scale(1.05) rotate(-1deg); }
}

.product-details {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}
.product-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--price-normal) !important;
  margin: 0 0 8px;
}
.product:hover .product-name {
  color: var(--header-bg) !important;
}
.product-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  align-items: center;
}
.status-badge {
  padding: 8px 14px;
  border-radius: 20px;
  background: var(--badge-bg);
  color: var(--badge-text) !important;
  font-weight: 500;
  font-size: 12px;
  box-shadow: 0 2px 6px var(--shadow-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.status-badge:hover {
  transform: translateY(-2px);
  background: var(--green-tint);
  color: var(--header-bg) !important;
}
.status-badge::after {
  content: '✓';
  font-weight: bold;
  font-size: 14px;
}
.out-of-stock::after {
  content: '✕';
  color: #f44336;
}
.weight::after {
  content: '⚖️';
}
.discount::after {
  content: '💰';
}
.price-container {
  padding: 8px 12px;
  border-radius: 20px;
  background: var(--badge-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 5px;
  box-shadow: 0 2px 6px var(--shadow-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.price-container:hover {
  transform: translateY(-2px);
  background: #fff3e0;
}
.dark .price-container:hover {
  background: var(--badge-bg);
}
.original-price {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
  text-decoration: line-through;
}
.discounted-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--price-discount);
}
.no-discount .discounted-price {
  color: var(--price-normal);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-top: 1px solid var(--border-color);
  gap: 10px;
}
.actions button {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg) !important;
  color: var(--text-color) !important;
  flex: 1;
}
.actions button:disabled {
  background: var(--border-color) !important;
  cursor: not-allowed;
  opacity: 0.6;
}
.actions button.add {
  background: var(--button-bg) !important;
  color: var(--header-text) !important;
  border-color: var(--button-bg);
}
.actions button.add:hover:not(:disabled) {
  background: var(--button-hover) !important;
  transform: translateY(-2px);
}
.actions button.quick-view,
.actions button.back {
  background: var(--badge-bg);
  color: var(--price-normal) !important;
  font-size: 13px;
}
.actions button.quick-view:hover,
.actions button.back:hover {
  background: var(--green-tint);
  transform: translateY(-2px);
}
.actions button.like {
  background: none;
  color: var(--text-secondary) !important;
  font-size: 20px;
  border: none;
  flex: none;
  padding: 5px;
}
.actions button.like:hover {
  transform: rotate(15deg) scale(1.2);
  color: var(--price-discount) !important;
}
.like.liked {
  color: var(--price-discount) !important;
  animation: heartBeat 0.6s ease-in-out;
}
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.product-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--card-bg) !important;
  border-radius: 16px;
  box-shadow: 0 4px 12px var(--shadow-light);
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.product-image img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
}
.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.product-desc {
  font-size: 16px;
  color: var(--text-secondary);
}
.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}
.quantity-control button {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--button-bg) !important;
  color: var(--header-text) !important;
  cursor: pointer;
  font-size: 16px;
}
.quantity-control button:disabled {
  background: var(--border-color) !important;
  cursor: not-allowed;
  opacity: 0.6;
}
.quantity-control input {
  width: 50px;
  text-align: center;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background: var(--card-bg) !important;
  color: var(--text-color) !important;
}

.cart-container {
  max-width: 800px;
  margin: 0 auto;
}
.cart-item {
  background: var(--card-bg) !important;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 12px var(--shadow-light);
}
.cart-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}
.cart-details {
  flex: 1;
}
.cart-details h3 {
  font-size: 20px;
  margin: 0 0 10px;
  color: var(--price-normal) !important;
}
.cart-details p {
  margin: 5px 0;
  color: var(--text-secondary);
}
.cart-actions {
  display: flex;
  gap: 10px;
}
.cart-actions button {
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}
.cart-actions .remove {
  background: var(--card-bg) !important;
  color: var(--text-color) !important;
}
.cart-actions .remove:hover {
  background: var(--price-discount) !important;
  color: #fff !important;
}
.quantity-control-cart {
  display: flex;
  align-items: center;
  gap: 10px;
}
.quantity-control-cart button {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--button-bg) !important;
  color: var(--header-text) !important;
  cursor: pointer;
  font-size: 14px;
}
.quantity-control-cart button:disabled {
  background: var(--border-color) !important;
  cursor: not-allowed;
  opacity: 0.6;
}
.quantity-control-cart input {
  width: 40px;
  text-align: center;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: var(--card-bg) !important;
  color: var(--text-color) !important;
}
.total {
  text-align: right;
  margin: 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color) !important;
}

.checkout-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--card-bg) !important;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px var(--shadow-light);
}
.checkout-container h2 {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  margin-bottom: 20px;
  color: var(--text-color) !important;
}
.checkout-container input,
.checkout-container textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg) !important;
  color: var(--text-color) !important;
  font-size: 14px;
  margin-bottom: 15px;
}
.checkout-container input:focus,
.checkout-container textarea:focus {
  border-color: var(--filter-active-bg);
  outline: none;
}
.order-table th,
.order-table td {
  border: 1px solid var(--border-color);
  padding: 10px;
  text-align: center;
  font-size: 14px;
  color: var(--text-color) !important;
}
.order-table th {
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
}
.summary {
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-color) !important;
}
#thankYou {
  margin-top: 20px;
  font-size: 16px;
  color: var(--text-color) !important;
}

.error-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--error-bg) !important;
  color: var(--error-text) !important;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-light);
  z-index: 1000;
  display: none;
  animation: slideIn 0.3s ease-out;
}
.error-popup.show {
  display: block;
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

footer {
  background: var(--footer-bg) !important;
  color: var(--footer-text) !important;
  padding: 40px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: space-between;
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--shadow-light);
  margin-top: 40px;
}
footer div {
  flex: 1;
  min-width: 200px;
}
footer h4 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  margin-bottom: 20px;
  color: var(--footer-text) !important;
}
footer p {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--footer-text) !important;
}
footer a {
  color: var(--footer-text) !important;
  text-decoration: none;
}
footer a:hover {
  text-decoration: underline;
}

/* Print-specific styles */
@media print {
  body * {
    visibility: hidden;
  }
  #print-order-summary,
  #print-order-summary * {
    visibility: visible;
  }
  #print-order-summary {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: #ffffff !important;
  }
  #print-order-summary * {
    color: #000000 !important;
    background: #ffffff !important;
  }
  #print-order-summary h1,
  #print-order-summary h2,
  #print-order-summary p[style*="color: #2e7d32"] {
    color: #2e7d32 !important;
  }
  #print-order-summary table thead tr {
    background: #2e7d32 !important;
    color: #ffffff !important;
  }
  #print-order-summary table tbody tr:nth-child(even) {
    background: #f4f8f3 !important;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 220px;
    left: -220px;
  }
  .main-content.shifted {
    margin-left: 250px;
  }
  header {
    flex-direction: column;
    align-items: flex-start;
  }
  .filters {
    justify-content: flex-start;
    margin-left: 0;
  }
  header h1 {
    font-size: 28px;
    margin-left: 0;
  }
  footer {
    flex-direction: column;
    gap: 20px;
  }
  .nav-circles {
    gap: 5px;
    padding: 8px;
  }
  .nav-circles .circle {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
  .nav-circles .separator {
    width: 30px;
  }
  .product-container {
    flex-direction: column;
    align-items: center;
  }
  .product-image img {
    max-width: 100%;
  }
  #searchInput {
    margin-left: 0;
    width: 100%;
  }
  .checkout-container {
    margin: 20px;
    padding: 15px;
  }
  .order-table th,
  .order-table td {
    font-size: 12px;
    padding: 8px;
  }
}
</style>