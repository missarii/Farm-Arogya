<template>
  <div class="fert-page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-left">
          <h1>Nourish Your Soil — Grow Naturally</h1>
          <p class="lead">
            <span class="lead-kicker">Eco-friendly fertilizers &amp; soil boosters</span>
            <span class="lead-body">to enrich your garden, improve plant health and yield — formulated for small to medium farms.</span>
          </p>

          
          <div
            class="mini-highlight"
            :class="{ blinking: blink }"
            aria-live="polite"
            role="button"
            tabindex="0"
            @click="openDetails(currentHighlight)"
            @keydown.enter.prevent="openDetails(currentHighlight)"
          >
            <img :src="currentHighlight.image" :alt="currentHighlight.name" @error="e => e.target.src = placeholder" />
            <div class="mini-info">
              <div class="mini-name">{{ currentHighlight.name }}</div>
              <div class="mini-price">Rs. {{ formatNumber(discountedPrice(currentHighlight.price, currentHighlight.discount)) }}</div>
            </div>
            <div v-if="currentHighlight.discount" class="mini-pill">{{ currentHighlight.discount }}% OFF</div>
          </div>
        </div>
      </div>
      </section>

       

    <!-- FILTER BAR -->
    <section class="filters">
      <div class="filters-inner">
        <div class="search-wrap">
          <input v-model="q" placeholder="Search fertilizers, soil, boosters..." />
        </div>

        <div class="chips-wrap" role="list">
          <button
            v-for="c in allCategories"
            :key="c"
            class="chip"
            :class="{ active: filters.categories.includes(c) }"
            @click="toggleCategory(c)"
          >
            {{ c }}
          </button>
        </div>

        <div class="sort-wrap">
          <label>Sort:</label>
          <select v-model="filters.sort">
            <option value="">Recommended</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="discount-desc">Discount</option>
          </select>
        </div>
      </div>
    </section>

    <!-- PRODUCT GRID + CART (two-column layout) -->
    <section ref="gridRef" class="catalog">
      <div class="catalog-inner">

        <!-- LEFT SIDEBAR -->
        <aside class="catalog-left">
          <div class="sidebar">
            <div class="sidebar-header">
              <div class="title">PRODUCTS</div>
              <div class="sub">Filter & refine</div>
            </div>

            <div class="filter-panel">
              <!-- Search -->
              <div class="filter-block">
                <label class="filter-label">Search</label>
                <div class="search-input">
                  <svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5,14H14.71l-0.43-0.43A6.49,6.49,0,1,0,14.43,15.29l0.43,0.43V15.5L20,21l1.5-1.5ZM10,15A5,5,0,1,1,15,10,5,5,0,0,1,10,15Z"/></svg>
                  <input v-model="filters.search" placeholder="Search products..." />
                  <button v-if="filters.search" class="clear-search" @click="filters.search = ''">✕</button>
                </div>
              </div>

              <!-- Categories chips -->
              <div class="filter-block">
                <label class="filter-label">Categories</label>
                <div class="chips">
                  <button
                    v-for="cat in allCategories"
                    :key="cat"
                    :class="['chip', { active: filters.categories.includes(cat) }]"
                    @click="toggleCategory(cat)"
                    type="button"
                  >
                    {{ cat }}
                  </button>
                </div>
              </div>

              <!-- Price range -->
              <div class="filter-block">
                <label class="filter-label">Price range (Rs.)</label>
                <div class="price-row">
                  <input type="number" v-model.number="filters.priceMin" class="price-num" :placeholder="minPrice" />
                  <div class="dash">—</div>
                  <input type="number" v-model.number="filters.priceMax" class="price-num" :placeholder="maxPrice" />
                </div>

                <div class="range-sliders">
                  <input type="range" :min="minPrice" :max="maxPrice" v-model.number="rangeLow" @input="syncRangeFromLow" />
                  <input type="range" :min="minPrice" :max="maxPrice" v-model.number="rangeHigh" @input="syncRangeFromHigh" />
                  <div class="range-track">
                    <div class="range-fill" :style="rangeFillStyle"></div>
                  </div>
                  <div class="range-labels">
                    <small>min: {{ minPrice }}</small>
                    <small>max: {{ maxPrice }}</small>
                  </div>
                </div>
              </div>

              <!-- Toggles -->
              <div class="filter-block toggles">
                <label class="filter-label">Quick filters</label>
                <div class="toggle-row">
                  <div class="toggle-item">
                    <div class="toggle-title">On sale</div>
                    <label class="switch">
                      <input type="checkbox" v-model="filters.onSaleOnly" />
                      <span class="slider"></span>
                    </label>
                  </div>
                  <div class="toggle-item">
                    <div class="toggle-title">Organic only</div>
                    <label class="switch">
                      <input type="checkbox" v-model="filters.organicOnly" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="filter-actions">
                <button class="btn btn-apply" @click="applyFiltersLocal">Apply</button>
                <button class="btn btn-reset" @click="resetFiltersLocal">Reset</button>
                <div class="results-count">{{ filteredProducts.length }} result(s)</div>
              </div>

            </div>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="catalog-right">
          <div class="top-row">
            <div class="left-stats">
              <div class="results"> <strong>{{ filteredProducts.length }}</strong> result(s)</div>
            </div>
            <div class="right-stats">Showing <strong>{{ visibleCount }}</strong></div>
          </div>

          <div class="products-grid">
            <article v-for="p in paginated" :key="p.id" class="product-card">
              <div class="media-wrap">
                <img :src="p.image" :alt="p.name" class="product-image" @error="e => e.target.src = placeholder" />
                <div v-if="p.discount" class="discount-pill">{{ p.discount }}% OFF</div>
              </div>

              <div class="card-body">
                <div class="card-title">{{ p.name }}</div>
                <div class="card-meta">{{ p.category }}</div>

                <div class="price-row">
                  <div class="original" v-if="p.discount">Rs. {{ formatNumber(p.price) }}</div>
                  <div class="final">Rs. {{ formatNumber(discountedPrice(p.price, p.discount)) }}</div>
                </div>

                <div class="quantity-row">
                  <label>Qty:</label>
                  <div class="qty-controls">
                    <button @click="decrementQty(p)">-</button>
                    <input type="number" min="1" :value="getCartQty(p.id)" @input="event => setQtyFromInput(p, event, p)" />
                    <button @click="incrementQty(p)">+</button>
                  </div>
                </div>

                <div class="card-actions">
                  <button class="btn-ghost small" @click="openDetails(p)">Details</button>
                  <button class="btn-primary small" @click="addToCart(p)">Add to Cart</button>
                </div>
              </div>
            </article>
          </div>

          <div class="pagination" v-if="pageCount > 1">
            <button :disabled="page === 1" @click="page--">Prev</button>
            <button
              v-for="pg in pageCount"
              :key="pg"
              :class="{ active: pg === page }"
              @click="page = pg"
            >{{ pg }}</button>
            <button :disabled="page === pageCount" @click="page++">Next</button>
          </div>

          <!-- CART + CHECKOUT PANEL -->
          <section class="checkout-panel">
            <h3>Your Cart</h3>
            <div v-if="cart.length" class="cart-list">
              <div v-for="item in cart" :key="item.id" class="cart-row">
                <div class="cart-left"><strong>{{ item.name }}</strong> x{{ item.quantity }}</div>
                <div class="cart-right">
                  Rs. {{ formatNumber(item.price * item.quantity) }}
                  <div class="cart-controls">
                    <button @click="decrementItem(item)">-</button>
                    <button @click="incrementItem(item)">+</button>
                    <button class="remove-small" @click="removeFromCart(item)">Remove</button>
                  </div>
                </div>
              </div>

              <div class="cart-total">Total: Rs. {{ formatNumber(totalPrice) }}</div>
              <div class="cart-actions">
                <button class="checkout-btn" @click="openCheckout">Checkout</button>
                <button class="clear-btn" @click="clearCart">Clear Cart</button>
              </div>
            </div>
            <div v-else class="cart-empty">Cart is empty.</div>

            <!-- CHECKOUT FORM -->
            <div v-if="checkoutOpen" class="checkout-form">
              <h4>Checkout — Cash on Delivery</h4>

              <div class="form-row">
                <label>Full Name</label>
                <input v-model="checkout.name" type="text" placeholder="Enter full name" />
                <div v-if="errors.name" class="field-error">{{ errors.name }}</div>
              </div>

              <div class="form-row">
                <label>Phone</label>
                <input v-model="checkout.phone" type="text" placeholder="Phone number" />
                <div v-if="errors.phone" class="field-error">{{ errors.phone }}</div>
              </div>

              <div class="form-row">
                <label>Address</label>
                <textarea v-model="checkout.address" rows="3" placeholder="Street, area, landmark"></textarea>
                <div v-if="errors.address" class="field-error">{{ errors.address }}</div>
              </div>

              <div class="form-row two-cols">
                <div>
                  <label>City</label>
                  <input v-model="checkout.city" type="text" placeholder="City" />
                </div>
                <div>
                  <label>Pin / ZIP</label>
                  <input v-model="checkout.pincode" type="text" placeholder="PIN" />
                </div>
              </div>

              <div class="form-actions">
                <button class="place-order-btn" @click="placeOrder">Place Order (COD)</button>
                <button class="cancel-btn" @click="closeCheckout">Cancel</button>
              </div>
            </div>

            <!-- ORDER RECEIPT -->
            <div v-if="orderPlaced" class="receipt" id="receipt">
              <h4>Order Confirmed ✅</h4>
              <p><strong>Order ID:</strong> {{ orderPlaced.id }}</p>
              <p><strong>Placed At:</strong> {{ orderPlaced.date }}</p>
              <p><strong>Customer:</strong> {{ orderPlaced.customer.name }} — {{ orderPlaced.customer.phone }}</p>
              <p><strong>Address:</strong> {{ orderPlaced.customer.address }}, {{ orderPlaced.customer.city }} - {{ orderPlaced.customer.pincode }}</p>
              <p><strong>Payment:</strong> Cash on Delivery</p>

              <hr />

              <div class="receipt-items">
                <div v-for="it in orderPlaced.items" :key="it.id" class="receipt-row">
                  <div>{{ it.name }} x{{ it.quantity }}</div>
                  <div>Rs. {{ formatNumber(it.price * it.quantity) }}</div>
                </div>
              </div>

              <div class="receipt-total">Total: Rs. {{ formatNumber(orderPlaced.total) }}</div>

              <div class="receipt-actions">
                <button class="print-btn" @click="printReceipt">Print Receipt</button>
                <button class="done-btn" @click="closeReceipt">Done</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </section>

    <!-- DETAILS MODAL -->
    <div v-if="detailsOpen" class="modal-backdrop" @click.self="closeDetails">
      <div class="modal" @mouseover="modalHover = true" @mouseleave="modalHover = false">
        <button class="modal-close" @click="closeDetails" aria-label="Close">✕</button>

        <div class="modal-grid" :class="{ 'modal-hover': modalHover }">
          <div class="modal-image">
            <img :src="details.image" :alt="details.name" @error="e => e.target.src = placeholder" />
          </div>

          <div class="modal-body">
            <h3>{{ details.name }}</h3>
            <div class="modal-meta">
              <span class="meta-cat">{{ details.category }}</span>
              <span v-if="details.isNew" class="modal-new">NEW</span>
            </div>

            <div class="modal-price-row">
              <div class="original" v-if="details.discount && details.discount > 0">Rs. {{ formatNumber(details.price) }}</div>
              <div class="final">Rs. {{ formatNumber(discountedPrice(details.price, details.discount)) }}</div>
              <div v-if="details.discount" class="discount-label">{{ details.discount }}% OFF</div>
            </div>

            <p class="modal-description">{{ details.description }}</p>

            <ul class="modal-specs" v-if="details.specs && details.specs.length">
              <li v-for="(s, i) in details.specs" :key="i">{{ s }}</li>
            </ul>

            <div class="modal-actions">
              <button class="add-btn" @click="addToCart(details); closeDetails()">ADD TO CART</button>
              <button class="cancel-btn" @click="closeDetails">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue';

import naturalFeedImg from '../assets/natural_feed_5kg.jpg';
import plantPowerImg from '../assets/plant_power_1l.jpg';
import boneMealImg from '../assets/bone_meal_2kg.jpg';
import ecoGrowImg from '../assets/eco_grow_4kg.jpg';
import soilBuilderImg from '../assets/soil_builder_10kg.jpg';
import rootEnhancerImg from '../assets/root_enhancer_500g.jpg';
import mineralMixImg from '../assets/mineral_mix_3kg.jpg';
import compostStarterImg from '../assets/compost_starter_1kg.png';
import plantShieldImg from '../assets/plant_shield_250ml..jpg';

const placeholder = ''; 

/* products */
const products = ref([
  { id: 1, name: 'Natural Feed (5kg)', price: 1350, discount: 0, image: naturalFeedImg, category: 'Organic', description: 'Slow-release organic compost rich in nutrients.', specs: ['5kg bag', 'NPK 2-1-1'] },
  { id: 2, name: 'Plant Power (1L)', price: 650, discount: 10, image: plantPowerImg, category: 'Liquid Fertilizer', description: 'Concentrated liquid growth booster for potted plants.', specs: ['1L', 'Suitable for indoor/outdoor'] },
  { id: 3, name: 'Bone Meal (2kg)', price: 1650, discount: 5, image: boneMealImg, category: 'Soil Amendment', description: 'Phosphorus-rich bone meal to encourage root & flower growth.', specs: ['2kg', 'Slow release'] },
  { id: 4, name: 'Eco Grow (4kg)', price: 1790, discount: 12, image: ecoGrowImg, category: 'Organic', description: 'Balanced organic fertilizer for vegetables and herbs.', specs: ['4kg', 'NPK 3-2-2'] },
  { id: 5, name: 'Soil Builder (10kg)', price: 4590, discount: 0, image: soilBuilderImg, category: 'Soil Conditioner', description: 'Long-term soil conditioner to improve structure & water retention.', specs: ['10kg', 'For garden beds'] },
  { id: 6, name: 'Root Enhancer (500g)', price: 310, discount: 0, image: rootEnhancerImg, category: 'Additive', description: 'Root stimulator for transplanting and seedlings.', specs: ['500g', 'Rich in micro-nutrients'] },
  { id: 7, name: 'Mineral Mix (3kg)', price: 890, discount: 0, image: mineralMixImg, category: 'Mineral', description: 'Mineral supplement for heavy-feeding crops.', specs: ['3kg', 'Use as directed'] },
  { id: 8, name: 'Compost Starter (1kg)', price: 450, discount: 0, image: compostStarterImg, category: 'Compost', description: 'Helps speed up composting process.', specs: ['1kg', 'Safe for home use'] },
  { id: 9, name: 'Plant Shield (250ml)', price: 499, discount: 8, image: plantShieldImg, category: 'Pesticide', description: 'Eco-friendly protectant against common pests.', specs: ['250ml', 'Organic-certified'] },
]);

/* featured only */
const featured = products.value[4] || products.value[0];

/* hero cycling highlights (left mini) */
const heroHighlights = computed(() => products.value.slice(0, 4)); // first 4 products cycle (adjust as needed)
const currentIdx = ref(0);
const blink = ref(false);

const currentHighlight = computed(() => heroHighlights.value[currentIdx.value] || featured);

/* timing config (ms) */
const CYCLE_MS = 3500;
const BLINK_MS = 420;

let cycleInterval = null;

function advanceHighlight() {
  blink.value = true;
  setTimeout(() => {
    currentIdx.value = (currentIdx.value + 1) % Math.max(1, heroHighlights.value.length);
  }, Math.round(BLINK_MS / 2));
  setTimeout(() => { blink.value = false; }, BLINK_MS);
}

onMounted(() => {
  if (heroHighlights.value.length > 1) {

    cycleInterval = setInterval(advanceHighlight, CYCLE_MS);
  }
});

onUnmounted(() => {
  if (cycleInterval) clearInterval(cycleInterval);
});

/* filters */
const q = ref('');
const filters = ref({
  search: '',
  categories: [],
  priceMin: null,
  priceMax: null,
  organicOnly: false,
  onSaleOnly: false,
  sort: ''
});

const allCategories = computed(() => Array.from(new Set(products.value.map(p => p.category))));

function toggleCategory(c) {
  const idx = filters.value.categories.indexOf(c);
  if (idx === -1) filters.value.categories.push(c);
  else filters.value.categories.splice(idx, 1);
}

function resetFiltersLocal() {
  filters.value = { search: '', categories: [], priceMin: null, priceMax: null, organicOnly: false, onSaleOnly: false, sort: '' };
  rangeLow.value = minPrice;
  rangeHigh.value = maxPrice;
  q.value = '';
}

function applyFiltersLocal() {
  if (filters.value.priceMin === null || filters.value.priceMin === '') filters.value.priceMin = rangeLow.value;
  if (filters.value.priceMax === null || filters.value.priceMax === '') filters.value.priceMax = rangeHigh.value;
}

/* range slider backing values */
const minPrice = Math.min(...products.value.map(p => p.price));
const maxPrice = Math.max(...products.value.map(p => p.price));
const rangeLow = ref(minPrice);
const rangeHigh = ref(maxPrice);

watchEffect(() => {
  if (filters.value.priceMin !== null && filters.value.priceMin !== '') rangeLow.value = Math.max(minPrice, Number(filters.value.priceMin));
  if (filters.value.priceMax !== null && filters.value.priceMax !== '') rangeHigh.value = Math.min(maxPrice, Number(filters.value.priceMax));
});

function syncRangeFromLow() { if (rangeLow.value > rangeHigh.value) rangeLow.value = rangeHigh.value; filters.value.priceMin = rangeLow.value; }
function syncRangeFromHigh() { if (rangeHigh.value < rangeLow.value) rangeHigh.value = rangeLow.value; filters.value.priceMax = rangeHigh.value; }

const rangeFillStyle = computed(() => {
  const total = maxPrice - minPrice || 1;
  const leftPercent = ((rangeLow.value - minPrice) / total) * 100;
  const rightPercent = ((rangeHigh.value - minPrice) / total) * 100;
  return { left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` };
});

/* helpers */
function discountedPrice(price, discount = 0) { if (!discount) return Math.round(price); return Math.round(price * (1 - discount / 100)); }
function formatNumber(n) { return n?.toLocaleString('en-IN') ?? n; }

/* computed list */
const filteredProducts = computed(() => {
  let list = products.value.slice();
  const term = (filters.value.search || q.value || '').toString().trim().toLowerCase();
  if (term) list = list.filter(p => p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term));
  if (filters.value.categories.length) list = list.filter(p => filters.value.categories.includes(p.category));
  if (filters.value.priceMin != null && filters.value.priceMin !== '') list = list.filter(p => discountedPrice(p.price, p.discount) >= Number(filters.value.priceMin));
  if (filters.value.priceMax != null && filters.value.priceMax !== '') list = list.filter(p => discountedPrice(p.price, p.discount) <= Number(filters.value.priceMax));
  if (filters.value.organicOnly) list = list.filter(p => (p.category || '').toLowerCase().includes('organic') || (p.tags || []).includes('organic'));
  if (filters.value.onSaleOnly) list = list.filter(p => p.discount && p.discount > 0);

  if (filters.value.sort === 'price-asc') list.sort((a,b) => discountedPrice(a.price,a.discount) - discountedPrice(b.price,b.discount));
  else if (filters.value.sort === 'price-desc') list.sort((a,b) => discountedPrice(b.price,b.discount) - discountedPrice(a.price,a.discount));
  else if (filters.value.sort === 'discount-desc') list.sort((a,b) => (b.discount || 0) - (a.discount || 0));

  return list;
});

/* pagination */
const page = ref(1);
const perPage = ref(8);
const pageCount = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / perPage.value)));
const paginated = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filteredProducts.value.slice(start, start + perPage.value);
});
const visibleCount = computed(() => paginated.value.length);

watchEffect(() => { if (page.value > pageCount.value) page.value = pageCount.value; });

/* cart & checkout */
const cart = ref([]);
function addToCart(p) {
  const existing = cart.value.find(i => i.id === p.id);
  const price = discountedPrice(p.price, p.discount);
  if (existing) existing.quantity++;
  else cart.value.push({ id: p.id, name: p.name, price, quantity: 1 });
}
function removeFromCart(item) { cart.value = cart.value.filter(i => i.id !== item.id); }
function clearCart() { cart.value = []; }
const totalPrice = computed(() => cart.value.reduce((s, it) => s + it.price * it.quantity, 0));

function getCartQty(id) { const it = cart.value.find(c => c.id === id); return it ? it.quantity : 1; }
function setQtyFromInput(productOrEvent, e, productParam = null) {
  let product = productParam || productOrEvent;
  let ev = e || productOrEvent;
  const val = Number(ev.target?.value ?? ev) || 1;
  const existing = cart.value.find(x => x.id === product.id);
  if (existing) existing.quantity = Math.max(1, val);
  else cart.value.push({ id: product.id, name: product.name, price: discountedPrice(product.price, product.discount), quantity: Math.max(1, val) });
}
function incrementQty(product) { const existing = cart.value.find(x => x.id === product.id); if (existing) existing.quantity++; else cart.value.push({ id: product.id, name: product.name, price: discountedPrice(product.price, product.discount), quantity: 1 }); }
function decrementQty(product) { const existing = cart.value.find(x => x.id === product.id); if (!existing) return; if (existing.quantity > 1) existing.quantity--; else removeFromCart(existing); }
function incrementItem(item) { item.quantity++; }
function decrementItem(item) { if (item.quantity > 1) { item.quantity--; } else { removeFromCart(item); } }

/* details modal & checkout */
const detailsOpen = ref(false);
const details = ref({});
const modalHover = ref(false);
function openDetails(p) { details.value = p; detailsOpen.value = true; }
function closeDetails() { detailsOpen.value = false; }

const checkoutOpen = ref(false);
const checkout = ref({ name: '', phone: '', address: '', city: '', pincode: '' });
const errors = ref({});
const orderPlaced = ref(null);

function openCheckout() { if (cart.value.length === 0) { alert('Cart is empty.'); return; } errors.value = {}; checkoutOpen.value = true; }
function closeCheckout() { checkoutOpen.value = false; errors.value = {}; }

function validateCheckout() {
  errors.value = {};
  let ok = true;
  const c = checkout.value;
  if (!c.name || !c.name.trim()) { errors.value.name = 'Name is required'; ok = false; }
  if (!c.phone || !/^[0-9+ -]{7,15}$/.test(c.phone)) { errors.value.phone = 'Enter valid phone'; ok = false; }
  if (!c.address || c.address.trim().length < 5) { errors.value.address = 'Enter delivery address'; ok = false; }
  return ok;
}

function placeOrder() {
  if (!validateCheckout()) return;
  const id = 'ORD' + Date.now().toString(36).toUpperCase();
  const date = new Date().toLocaleString();
  const customer = { name: checkout.value.name, phone: checkout.value.phone, address: checkout.value.address, city: checkout.value.city, pincode: checkout.value.pincode };
  const items = cart.value.map(i => ({ ...i }));
  const total = totalPrice.value;
  const order = { id, date, customer, items, total, paymentMethodLabel: 'Cash on Delivery' };
  orderPlaced.value = order;
  cart.value = [];
  checkoutOpen.value = false;
  checkout.value = { name: '', phone: '', address: '', city: '', pincode: '' };
}

function printReceipt() {
  const el = document.getElementById('receipt');
  if (!el) { alert('No receipt to print.'); return; }
  const css = `<style>body{font-family:Arial,Helvetica,sans-serif;padding:18px;color:#111}h4{margin-top:0}.receipt-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}.receipt-total{margin-top:12px;font-weight:900;font-size:16px}.receipt-items{margin-top:8px}</style>`;
  const newWindow = window.open('', '_blank', 'width=800,height=700');
  newWindow.document.write('<!doctype html><html><head><title>Receipt</title>' + css + '</head><body>');
  newWindow.document.write(el.outerHTML);
  newWindow.document.write('</body></html>');
  newWindow.document.close();
  newWindow.focus();
  setTimeout(() => { newWindow.print(); newWindow.close(); }, 300);
}

function closeReceipt() { orderPlaced.value = null; }

const gridRef = ref(null);
function scrollToGrid() { if (gridRef.value) gridRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function openGuide() { alert('Open plant care guide (implement navigation)'); }

onMounted(() => {
 
});
</script>

<style scoped>
:root {
  --accent: #3b7a3b;
  --accent-2: #67b567;
  --muted: #6e7a6e;
  --card: #ffffff;
  --bg: #f6fbf6;
}

/* HERO */
.fert-page { background: var(--bg); min-height: 100vh; color: #0f2810; font-family: Inter, system-ui, Arial; }
.hero { padding: 36px 20px 8px; }
.hero-inner { max-width: 1200px; margin: 0 auto; display:flex; gap:28px; align-items:flex-start; }
.hero-left { flex:1; min-width:0; }
.hero-left h1 { font-size: 34px; margin:0 0 8px; color:#123814; font-weight:800; }
.lead { max-width: 820px; font-family: "Merriweather", Georgia, serif; color: #1f3b1f; line-height: 1.65; margin: 10px 0 20px; font-size: 18px; display: block; }
.lead-kicker { display: block; font-weight: 800; font-size: 20px; letter-spacing: -0.2px; color: #114017; margin-bottom: 6px; }
.lead-body { display: block; color: #35623a; font-weight: 500; font-size: 16px; opacity: 0.95; }
.lead::before { content: ""; display: inline-block; width: 6px; height: 36px; background: linear-gradient(180deg, #67b567, #3b7a3b); margin-right: 12px; border-radius: 4px; vertical-align: middle; }

/* Mini cycling highlight */
.mini-highlight {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(20,40,20,0.04);
  max-width: 520px;
  margin-top: 12px;
  transition: transform 260ms ease, opacity 260ms ease, box-shadow 260ms ease;
  opacity: 1;
  cursor: pointer;
}
.mini-highlight img {
  width: 68px;
  height: 68px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
  transition: transform 280ms cubic-bezier(.2,.9,.3,1);
}
.mini-info .mini-name {
  font-weight: 800;
  color: #123814;
  font-size: 16px;
}
.mini-info .mini-price {
  color: #6e7a6e;
  font-size: 13px;
  margin-top: 6px;
}
.mini-pill {
  margin-left: auto;
  background: #055e06;
  color: #fff;
  padding: 6px 8px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 12px;
}

/* blinking state*/
.mini-highlight.blinking {
  opacity: 0.14;
  transform: translateY(-4px) scale(0.995);
  box-shadow: 0 18px 44px rgba(20,40,20,0.06);
  transition: opacity 210ms ease, transform 210ms ease;
}
.mini-highlight.blinking img {
  transform: scale(0.96) rotate(-1deg);
}
.mini-highlight:not(.blinking):hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(10,40,10,0.06);
}

/* hero right (featured) */
.hero-right { width:320px; flex-shrink:0; }
.featured-card { background:var(--card); padding:18px; border-radius:12px; box-shadow: 0 12px 40px rgba(15,30,15,0.06); position:sticky; top:22px; text-align:center; }
.featured-badge { position:absolute; left:12px; top:12px; background:var(--accent); color: #fff; padding:6px 8px; border-radius:8px; font-weight:800; font-size:12px; }
.featured-thumb { width:180px; height:140px; object-fit:contain; display:block; margin: 8px auto; }
.featured-card h3 { margin:10px 0 6px; font-size:16px; color:#123814; }
.featured-price { font-weight:800; color:#0f3a0f; margin-bottom:12px; }

/* FILTER BAR */
.filters { margin-top: 12px; padding: 12px 20px; background: linear-gradient(180deg,#f9fff9,#f3faf3); border-top: 1px solid rgba(12,40,12,0.03); border-bottom:1px solid rgba(12,40,12,0.03); }
.filters-inner { max-width:1200px; margin:0 auto; display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; padding:6px 8px; }
.search-wrap input { width: 360px; max-width: 48vw; padding:10px 12px; border-radius:8px; border:1px solid rgba(12,40,12,0.06); background:transparent; }
.chips-wrap { display:flex; gap:8px; flex-wrap:wrap; }
.chip { padding:8px 12px; border-radius:999px; border:1px solid rgba(12,40,12,0.06); background:transparent; cursor:pointer; font-weight:700; color:#234723; font-size:13px; }
.chip.active { background: linear-gradient(90deg,#eff9ef,#e3f3e3); box-shadow: 0 8px 20px rgba(35,115,35,0.04); }

/* CATALOG */
.catalog { padding: 24px 12px 60px; }
.catalog-inner { max-width:1200px; margin:0 auto; display:flex; gap:20px; align-items:flex-start; }

/* left filter panel */
.catalog-left { width: 280px; flex-shrink:0; }

/* Sidebar styles */
.sidebar { width: 100%; background: linear-gradient(180deg,#ffffff 0%, #fbfbfb 100%); border-radius: 10px; box-shadow: 0 8px 30px rgba(15,23,42,0.06); overflow: hidden; padding-bottom: 12px; }
.sidebar-header { padding: 18px; border-bottom: 1px solid #f0f0f2; background: linear-gradient(90deg,#fff 0%, #fffaf5 100%); }
.sidebar-header .title { color: #111827; font-weight: 800; font-size: 14px; letter-spacing: .6px; }
.sidebar-header .sub { color: #6b7280; font-size: 12px; margin-top: 6px; }
.filter-panel { padding: 14px; }
.filter-block { margin-bottom: 14px; }
.filter-label { display: block; font-weight: 700; color: #374151; margin-bottom: 8px; font-size: 13px; }
.search-input { display:flex; align-items:center; gap:8px; background: #fff; border-radius: 8px; padding: 8px; border: 1px solid #e6e9ee; }
.search-input .icon { width:18px; height:18px; color:#9ca3af; }
.search-input input { border: none; outline: none; font-size: 14px; flex: 1; color: #111827; }
.clear-search { border: none; background: transparent; color: #9ca3af; cursor: pointer; font-weight: 700; }
.chips { display:flex; gap:8px; flex-wrap:wrap; }
.chip { padding: 8px 12px; border-radius: 999px; border: 1px solid #e6e9ee; background: #fff; color: #374151; font-weight: 700; font-size: 13px; cursor: pointer; transition: all .18s ease; }
.chip:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 10px 26px rgba(15,23,42,0.06); }
.chip.active { background: #fff6f0; border-color: #f6b28e; color: #f37920; box-shadow: 0 6px 20px rgba(243,121,32,0.06); }
.price-row { display:flex; align-items:center; gap:8px; }
.price-num { width: 48%; padding: 8px; border-radius: 8px; border: 1px solid #e6e9ee; font-weight:700; text-align:center; background: #fff; }
.dash { color: #9ca3af; text-align:center; width: 4%; }
.range-sliders { margin-top: 10px; position: relative; }
.range-sliders input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: transparent; margin: 0; pointer-events: none; }
.range-sliders input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid #f37920; box-shadow: 0 4px 8px rgba(243,121,32,0.12); pointer-events: auto; }
.range-track { position: absolute; top: 4px; left: 0; right: 0; height: 6px; background: #eef2f7; border-radius: 99px; overflow: hidden; z-index: 0; }
.range-fill { position: absolute; top: 0; height: 100%; background: linear-gradient(90deg,#f37920,#ff8a3d); border-radius: 99px; left: 0; width: 0; }
.range-labels { display:flex; justify-content:space-between; margin-top:8px; color:#9ca3af; font-size:12px; }
.select-wrap select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e6e9ee; background: #fff; font-weight:700; }
.toggles .toggle-row { display:flex; flex-direction:column; gap:10px; margin-top:8px; }
.toggle-item { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.toggle-title { color:#374151; font-weight:700; font-size:13px; }
.switch { position: relative; display:inline-block; width:48px; height:28px; }
.switch input { display:none; }
.slider { position:absolute; inset:0; background:#e6e9ee; border-radius:999px; transition:all .18s ease; }
.slider::after { content:""; position:absolute; left:4px; top:4px; width:20px; height:20px; background:#fff; border-radius:50%; box-shadow:0 4px 10px rgba(15,23,42,0.06); transition:all .18s ease; }
.switch input:checked + .slider { background: linear-gradient(90deg,#f37920,#ff8a3d); }
.switch input:checked + .slider::after { transform: translateX(20px); }
.filter-actions { display:flex; align-items:center; gap:10px; justify-content:space-between; margin-top:8px; }
.btn { padding: 10px 12px; border-radius: 8px; font-weight:800; cursor:pointer; border: none; }
.btn-apply { background: linear-gradient(90deg,#f37920,#ff8a3d); color: #fff; box-shadow: 0 8px 20px rgba(243,121,32,0.12); }
.btn-reset { background: transparent; color: #f37920; border: 1px solid #fde7da; padding: 8px 10px; }
.results-count { color: #6b7280; font-weight:700; font-size:13px; }


.catalog-right { flex:1; }
.top-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.results { color:#234723; font-weight:700; }

/* product grid */
.products-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:18px; }
.product-card { background:var(--card); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:12px; box-shadow: 0 12px 36px rgba(10,30,10,0.04); min-height:320px; transition: box-shadow .18s ease, transform .18s ease; }
.product-card:hover { box-shadow: 0 20px 60px rgba(10,40,10,0.08); transform: translateY(-6px); }
.media-wrap { position:relative; height:180px; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg,#fbfff9,#f2faf2); border-radius:10px; overflow:hidden; }
.product-image { max-width:100%; max-height:100%; object-fit:contain; }
.discount-pill { position:absolute; left:10px; top:10px; background:#055e06; color:white; padding:6px 8px; border-radius:8px; font-weight:800; font-size:12px; }

.card-body { display:flex; flex-direction:column; gap:8px; }
.card-title { font-weight:800; color:#123814; font-size:16px; }
.card-meta { color:var(--muted); font-size:13px; }
.price-row { display:flex; gap:10px; align-items:baseline; }
.original { text-decoration:line-through; color:#9aa39a; }
.final { color:#0f3a0f; font-weight:900; font-size:16px; }

/* quantity controls */
.quantity-row { display:flex; align-items:center; gap:10px; }
.qty-controls { display:flex; align-items:center; gap:8px; }
.qty-controls input { width:64px; padding:6px; border-radius:6px; border:1px solid #e6e9ee; text-align:center; }

/* card actions */
.card-actions { display:flex; gap:8px; margin-top:auto; justify-content:flex-end; }
.btn-primary.small { background: var(--accent); color:#fff; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; font-weight:700; }
.btn-ghost.small { border:1px solid rgba(12,40,12,0.06); padding:8px 10px; border-radius:8px; background:transparent; cursor:pointer; font-weight:700; }

/* pagination */
.pagination { display:flex; gap:8px; margin-top:18px; justify-content:center; }
.pagination button { padding:8px 10px; border-radius:8px; border:1px solid rgba(12,40,12,0.06); background:var(--card); cursor:pointer; }
.pagination button.active { background:var(--accent); color:#fff; border-color:transparent; }

/* cart & checkout */
.checkout-panel { margin-top:18px; background: #fff; padding:12px; border-radius:10px; box-shadow: 0 8px 26px rgba(15,23,42,0.04); }
.cart-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #eef2f7; align-items:center; }
.cart-left { font-weight:700; }
.cart-right { display:flex; align-items:center; gap:12px; }
.cart-total { font-weight:900; margin-top:12px; }
.cart-actions { display:flex; gap:10px; margin-top:12px; }
.checkout-btn { background:#111827; color:#fff; padding:10px 12px; border-radius:8px; border:none; font-weight:800; }
.clear-btn { background:transparent; color:#ef4444; border:1px solid rgba(239,68,68,0.08); padding:10px 12px; border-radius:8px; }

/* checkout form */
.checkout-form { margin-top: 12px; background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.04); }
.form-row { margin-bottom: 10px; display:flex; flex-direction:column; gap:6px; }
.form-row input, .form-row textarea { padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; box-sizing: border-box; }
.form-row.two-cols { display:flex; gap:10px; }
.field-error { color: #ef4444; font-weight:700; font-size:13px; margin-top:4px; }
.form-actions { display:flex; gap:12px; margin-top:10px; }
.place-order-btn { background: #0f766e; color: #fff; border: none; padding: 10px 14px; border-radius: 6px; cursor: pointer; font-weight: 800; }
.cancel-btn { background: transparent; color: #374151; border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 6px; cursor: pointer; }

/* receipt */
.receipt { margin-top: 16px; background: #fff; padding: 14px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.04); }
.receipt-items { margin-top: 8px; }
.receipt-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom: 1px dotted #eee; }
.receipt-total { margin-top: 8px; font-weight:900; font-size:16px; }
.receipt-actions { margin-top: 12px; display:flex; gap:10px; }
.print-btn { background: #111827; color: #fff; padding: 8px 12px; border-radius:6px; border:none; cursor:pointer; font-weight:700; }
.done-btn { background: transparent; color:#374151; border:1px solid #e5e7eb; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:700; }

/* modal */
.modal-backdrop { position:fixed; inset:0; background:rgba(11, 15, 30, 0.55); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px; }
.modal { background:#fff; border-radius:12px; width:100%; max-width:980px; padding:18px; box-shadow: 0 30px 80px rgba(2,6,23,0.45); position:relative; transform-origin:center; transition: transform .28s cubic-bezier(.2,.9,.3,1); }
.modal-grid { display:grid; grid-template-columns: 1fr 1fr; gap:18px; align-items:start; }
.modal-image img { width:100%; height:100%; max-height:420px; object-fit:contain; border-radius:8px; }
.modal-body h3 { margin:0 0 8px; font-size:20px; }
.modal-meta { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.modal-meta .meta-cat { background:#fff6f0; color:#f37920; padding:6px 8px; border-radius:999px; font-weight:700; font-size:12px; }
.modal-new { background:#ef4444; color:#fff; padding:4px 8px; border-radius:6px; font-weight:700; font-size:11px; }
.modal-price-row { display:flex; gap:10px; align-items:baseline; margin:8px 0 12px; }
.modal-description { color:#374151; line-height:1.5; margin-bottom:12px; }
.modal-specs { list-style:disc; padding-left:18px; margin-bottom:12px; color:#4b5563; }
.modal-actions { display:flex; gap:10px; }

/* responsive */
@media (max-width: 1100px) {
  .catalog-inner { flex-direction:column; }
  .catalog-left { width:100%; order:2; }
  .catalog-right { order:1; }
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  .hero-inner { gap:20px; }
  .hero-right { width: 300px; }
}
@media (max-width: 700px) {
  .hero-inner { flex-direction:column; align-items:center; }
  .hero-right { width:100%; order:2; }
  .products-grid { grid-template-columns: 1fr; }
  .product-card { min-height: 260px; }
}

/* print helper */
@media print {
  body * { visibility: hidden; }
  .receipt, .receipt * { visibility: visible; }
  .receipt { position: absolute; left: 0; top: 0; width: 100%; }
  @page { margin: 10mm; }
}
</style>