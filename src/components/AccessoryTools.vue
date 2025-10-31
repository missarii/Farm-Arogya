<template>
  <div class="farming-tools-page" id="farming-tools-app">
    <!-- FILTER SIDEBAR -->
    <aside class="sidebar">
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
            <button v-if="filters.search" class="clear-search" @click="filters.search = ''" aria-label="Clear search">✕</button>
          </div>
        </div>

        <!-- Categories as chips -->
        <div class="filter-block">
          <label class="filter-label">Categories</label>
          <div class="chips">
            <button
              v-for="cat in categories"
              :key="cat"
              :class="['chip', { active: filters.categories.includes(cat) }]"
              @click="toggleCategory(cat)"
              type="button"
              :aria-pressed="filters.categories.includes(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Price range -->
        <div class="filter-block">
          <label class="filter-label">Price range (Rs.)</label>
          <div class="price-row">
            <input type="number" v-model.number="filters.priceMin" class="price-num" aria-label="Minimum price" />
            <div class="dash">—</div>
            <input type="number" v-model.number="filters.priceMax" class="price-num" aria-label="Maximum price" />
          </div>

          <div class="range-sliders" aria-hidden="true">
            <input type="range" :min="priceMin" :max="priceMax" v-model.number="rangeLow" @input="syncRangeFromLow" />
            <input type="range" :min="priceMin" :max="priceMax" v-model.number="rangeHigh" @input="syncRangeFromHigh" />
            <div class="range-track">
              <div class="range-fill" :style="rangeFillStyle"></div>
            </div>
            <div class="range-labels">
              <small>min: {{ priceMin }}</small>
              <small>max: {{ priceMax }}</small>
            </div>
          </div>
        </div>

        <!-- Sort -->
        <div class="filter-block">
          <label class="filter-label">Sort</label>
          <div class="select-wrap">
            <select v-model="filters.sort" aria-label="Sort products">
              <option value="">Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="discount-desc">Discount: High → Low</option>
              <option value="new-first">New: First</option>
            </select>
          </div>
        </div>

        <!-- Quick Toggles -->
        <div class="filter-block toggles">
          <label class="filter-label">Quick filters</label>
          <div class="toggle-row">
            <div class="toggle-item">
              <div class="toggle-title">Discounted only</div>
              <label class="switch" aria-label="Discounted only">
                <input type="checkbox" v-model="filters.discountOnly" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-title">New items only</div>
              <label class="switch" aria-label="New items only">
                <input type="checkbox" v-model="filters.newOnly" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="filter-actions">
          <button class="btn btn-apply" @click="applyFilters">Apply</button>
          <button class="btn btn-reset" @click="resetFilters">Reset</button>
          <div class="results-count" aria-live="polite">{{ filteredProducts.length }} result(s)</div>
        </div>
      </div>
    </aside>

    <!-- PRODUCTS + CART -->
    <main class="products-area">
      <h2
        class="page-title heading-animated"
        :class="{ 'is-animated': headingAnimated }"
        aria-live="polite"
      >
        <span class="title-words">
          <span class="word">GARDEN</span>
          <span class="word">&nbsp;&amp;&nbsp;</span>
          <span class="word">AGRI</span>
          <span class="word">TOOLS</span>
        </span>
        <span class="title-underline" aria-hidden></span>
      </h2>

      <div class="products-grid" role="list">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          :class="['product-card', { 'has-discount': product.discount && product.discount > 0 }]"
          @mouseover="hoverId = product.id"
          @mouseleave="hoverId = null"
          :data-prod-id="product.id"
          role="listitem"
        >
          <div v-if="product.discount && product.discount > 0" class="ribbon" :class="{ 'shake': hoverId === product.id }"><span>{{ product.discount }}% OFF</span></div>
          <div v-if="product.isNew" class="new-badge">NEW</div>

          <div class="product-media">
            <img :src="product.image" :alt="product.name" class="product-image" :class="{ 'img-hover': hoverId === product.id }" />
          </div>

          <div class="product-body" :class="{ 'body-hover': hoverId === product.id }">
            <div class="title-row">
              <h3 class="product-title">{{ product.name }}</h3>
              <div class="meta-cat">{{ product.category }}</div>
            </div>

            <div class="price-row">
              <div class="original" v-if="product.discount && product.discount > 0">Rs. {{ formatNumber(product.price) }}</div>
              <div class="final">Rs. {{ formatNumber(discountedPrice(product.price, product.discount)) }}</div>
            </div>

            <div class="card-actions">
              <button class="add-btn" @mouseenter="btnPulse = product.id" @mouseleave="btnPulse = null" @click="addToCart(product)">
                <span class="btn-icon" aria-hidden>+</span> ADD TO CART
              </button>
              <button class="details-btn" @click="openDetails(product)" :class="{ 'btn-details-hover': hoverId === product.id }">VIEW DETAILS</button>
            </div>
          </div>
        </div>
      </div>

      <section class="cart-panel" aria-labelledby="cart-heading">
        <h3 id="cart-heading">🛒 Your Cart</h3>
        <div v-if="cart.length" class="cart-list">
          <div v-for="item in cart" :key="item.id" class="cart-row">
            <div class="cart-left"><strong>{{ item.name }}</strong> x{{ item.quantity }}</div>
            <div class="cart-right">
              Rs. {{ formatNumber(item.price * item.quantity) }}
              <button class="remove-small" @click="removeFromCart(item)">Remove</button>
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
        <div v-if="checkoutOpen" class="checkout-form" aria-live="polite">
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
        <div v-if="orderPlaced" class="receipt" id="receipt" role="region" aria-label="Order receipt">
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

    <!-- PRODUCT DETAILS MODAL -->
    <div v-if="detailsOpen" class="modal-backdrop" @click.self="closeDetails" aria-hidden="false">
      <div
        class="modal"
        ref="modalEl"
        role="dialog"
        aria-modal="true"
        :aria-label="`Product details: ${detailsProduct.name}`"
        @keydown.tab.prevent="handleTabKey"
        tabindex="-1"
        @mouseover="modalHover = true"
        @mouseleave="modalHover = false"
      >
        <button class="modal-close" @click="closeDetails" aria-label="Close" type="button">✕</button>

        <div class="modal-grid" :class="{ 'modal-hover': modalHover }">
          <div class="modal-image">
            <img :src="detailsProduct.image" :alt="detailsProduct.name" />
          </div>

          <div class="modal-body">
            <h3>{{ detailsProduct.name }}</h3>

            <div class="modal-meta">
              <span class="meta-cat">{{ detailsProduct.category }}</span>
              <span v-if="detailsProduct.isNew" class="modal-new">NEW</span>
              <span v-if="detailsProduct.sku" class="modal-sku">SKU: {{ detailsProduct.sku }}</span>
            </div>

            <div class="modal-price-row">
              <div class="original" v-if="detailsProduct.discount && detailsProduct.discount > 0">Rs. {{ formatNumber(detailsProduct.price) }}</div>
              <div class="final">Rs. {{ formatNumber(discountedPrice(detailsProduct.price, detailsProduct.discount)) }}</div>
              <div v-if="detailsProduct.discount" class="discount-label">{{ detailsProduct.discount }}% OFF</div>
            </div>

            <p class="modal-description">{{ detailsProduct.description }}</p>

            <ul class="modal-specs" v-if="detailsProduct.specs && detailsProduct.specs.length">
              <li v-for="(s, i) in detailsProduct.specs" :key="i">{{ s }}</li>
            </ul>

            <div class="modal-extra">
              <div v-if="detailsProduct.weight"><strong>Weight:</strong> {{ detailsProduct.weight }}</div>
              <div v-if="detailsProduct.manufacturer"><strong>Manufacturer:</strong> {{ detailsProduct.manufacturer }}</div>
              <div v-if="detailsProduct.rating"><strong>Rating:</strong> {{ detailsProduct.rating }} ⭐</div>
            </div>

            <div class="modal-cta-row">
              <label class="qty-label">Quantity</label>
              <div class="qty-controls" role="group" aria-label="Quantity selector">
                <button type="button" @click="decrementQty" aria-label="Decrease quantity">−</button>
                <input type="number" v-model.number="modalQty" min="1" aria-label="Quantity" />
                <button type="button" @click="incrementQty" aria-label="Increase quantity">+</button>
              </div>

              <div class="modal-actions">
                <button class="add-btn" @click="addToCart(detailsProduct, modalQty); closeDetails()">ADD TO CART</button>
                <button class="cancel-btn" @click="closeDetails">Close</button>
              </div>
            </div>

            <div class="modal-more">
              <button class="details-btn" @click="copyLink(detailsProduct)">Copy Link</button>
              <button class="details-btn" @click="openShare(detailsProduct)">Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end modal -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

/* ---------------------------
   Heading animation state
   --------------------------- */
const headingAnimated = ref(false)
onMounted(() => {
  setTimeout(() => { headingAnimated.value = true }, 160)
})

/* ---------------------------
   Assets (imported)
   --------------------------- */
import cutterImg from '../assets/cutter.png'
import hedgeTrimmerImg from '../assets/hedge_trimmer.jpg'
import lawnMowerImg from '../assets/lawn_mower.png'
import leafBlowerImg from '../assets/leaf_blower.png'
import chainsawImg from '../assets/chainsaw.png'
import shovelImg from '../assets/shovel.png'
import wateringCanImg from '../assets/watering_can.png'
import rakeImg from '../assets/rack.png'
import wheelbarrowImg from '../assets/wheelbarrow.png'
import sprayer1_5Img from '../assets/sprayer_1_5l.png'
import handSprayer3Img from '../assets/hand_sprayer_3l.png'
import sprayer10Img from '../assets/sprayer_10l.png'
import sprayer20Img from '../assets/sprayer_20l.png'
import sprayImg from '../assets/spray.png'
import rackImg from '../assets/storage.png'
import scissorsImg from '../assets/scissors.png'
import trowelImg from '../assets/trowel.png'
import loppersImg from '../assets/loppers.png'
import forkImg from '../assets/garden_fork.png'
import hoeImg from '../assets/hoe.png'
import pruningsawImg from '../assets/pruning_saw.png'
import glovesImg from '../assets/gloves.png'
import toolboxImg from '../assets/toolbox.jpg'
import cabinetImg from '../assets/cabinet.jpg'
import organizerBinImg from '../assets/organizer_bin.jpg'
import gardenCartImg from '../assets/garden_cart.jpeg'
import dripKitImg from '../assets/drip_kit.jpg'
import soakerHoseImg from '../assets/soaker_hose.jpg'
import irrigationTimerImg from '../assets/irrigation_timer.jpg'
import sprinklerImg from '../assets/sprinkler.jpg'
import apronImg from '../assets/gardening_apron.jpg'
import kneePadsImg from '../assets/knee_pads.jpg'
import prunerKitImg from '../assets/pruner_kit.jpg'
import handTrolleyImg from '../assets/hand_trolley.jpg'
import gogglesImg from '../assets/safety_goggles.jpg'
import respiratorImg from '../assets/respirator_mask.jpg'
import workBootsImg from '../assets/work_boots.jpg'
import hiVisVestImg from '../assets/hi_vis_vest.jpg'
import dibberImg from '../assets/dibber.jpg'
import weedPullerImg from '../assets/weed_puller.jpg'
import soilScoopImg from '../assets/soil_scoop.jpg'
import handCultivatorImg from '../assets/hand_cultivator.jpg'
import bulbPlanterImg from '../assets/bulb_planter.jpg'
import humidityMonitorImg from '../assets/humidity_monitor.jpg'
import plantMisterImg from '../assets/plant_mister.jpg'
import plantTyingToolImg from '../assets/plant_tying_tool.jpg'
import leafShinerImg from '../assets/leaf_shiner.jpg'
import plantLabelSetImg from '../assets/plant_label_set.jpg'

/* ---------------------------
   Products list
   --------------------------- */
const products = ref([
  { id: 1, name: 'Gasoline Brush Cutter 52cc', price: 35900, discount: 25, isNew: true, image: cutterImg, category: 'Power Tools', description: 'High-power 52cc brush cutter suitable for heavy grass and small shrub clearing. Comes with double-handle for ergonomic operation and easy start mechanism.', specs: ['52cc engine', 'Double-handle', '2.2 kW power', 'Includes blade & harness'] },
  { id: 2, name: 'Hedge Trimmer (Electric)', price: 5400, discount: 12, isNew: false, image: hedgeTrimmerImg, category: 'Power Tools', description: 'Lightweight electric hedge trimmer ideal for shaping hedges and shrubs with lower maintenance than petrol models.', specs: ['600 W motor', 'Blade length 45cm', 'Safety lock'] },
  { id: 3, name: 'Self-Propelled Lawn Mower', price: 22900, discount: 18, isNew: true, image: lawnMowerImg, category: 'Power Tools', description: 'Reliable self-propelled mower with adjustable cutting heights and wide collection bag for medium-to-large gardens.', specs: ['Cut width 46cm', '3 cutting heights', 'Grass bag included'] },
  { id: 4, name: 'Leaf Blower (Corded)', price: 4200, discount: 10, isNew: false, image: leafBlowerImg, category: 'Power Tools', description: 'Corded leaf blower for quick clearing of leaves, debris and light clippings from patios and lawns.', specs: ['1200 W', 'Air speed 210 km/h', 'Lightweight'] },
  { id: 5, name: 'Chainsaw 40cc', price: 9800, discount: 15, isNew: false, image: chainsawImg, category: 'Power Tools', description: 'Compact 40cc chainsaw for pruning and light felling. Includes chain oil reservoir and comfortable handle grip.', specs: ['40cc engine', 'Bar length 40cm', 'Chain oil system'] },

  { id: 6, name: 'Shovel (Heavy Duty)', price: 650, discount: 0, isNew: false, image: shovelImg, category: 'Hand Tools', description: 'Durable heavy-duty shovel with reinforced steel head and comfortable grip handle for general digging tasks.', specs: ['Reinforced steel', 'Ergonomic handle'] },
  { id: 7, name: 'Watering Can (5L)', price: 250, discount: 0, isNew: false, image: wateringCanImg, category: 'Hand Tools', description: 'Plastic 5-litre watering can with ergonomic handle and narrow spout for targeted watering.', specs: ['5 L capacity', 'Plastic, UV-resistant'] },
  { id: 8, name: 'Garden Rake', price: 350, discount: 0, isNew: false, image: rakeImg, category: 'Hand Tools', description: 'Lightweight garden rake for leaf collection and soil leveling, durable tines and long wooden handle.', specs: ['Long handle', 'Durable tines'] },
  { id: 9, name: 'Wheelbarrow (Single Wheel)', price: 3200, discount: 5, isNew: false, image: wheelbarrowImg, category: 'Hand Tools', description: 'Single-wheel wheelbarrow with sturdy tray and ergonomic handles — great for transporting soil and tools.', specs: ['Single wheel', 'Steel tray'] },
  { id: 16, name: 'Hedge Shears (540mm)', price: 3600, discount: 11, isNew: true, image: scissorsImg, category: 'Hand Tools', description: 'Professional-grade hedge shears with 540mm blades for precise trimming.', specs: ['540mm blades', 'Comfort handles'] },

  { id: 10, name: 'Sprayer 16L (Electric)', price: 12900, discount: 15, isNew: true, image: sprayImg, category: 'Sprayers', description: 'Electric 16L sprayer for efficient pesticide/fertilizer application over medium fields. Battery-powered for portability.', specs: ['16L tank', 'Battery powered', 'Adjustable nozzle'] },
  { id: 11, name: 'Water Sprayer 1.5L', price: 400, discount: 0, isNew: false, image: sprayer1_5Img, category: 'Sprayers', description: 'Compact 1.5L sprayer perfect for household watering and light misting tasks.', specs: ['1.5L', 'Hand pump'] },
  { id: 12, name: 'Hand Chemical Sprayer 3L', price: 750, discount: 5, isNew: false, image: handSprayer3Img, category: 'Sprayers', description: '3L hand sprayer built for small farms and gardens; chemical-resistant tank and adjustable spray patterns.', specs: ['3L', 'Chemical resistant'] },
  { id: 13, name: 'Chemical Sprayer 10L', price: 2100, discount: 8, isNew: false, image: sprayer10Img, category: 'Sprayers', description: '10L sprayer with pressure pump and long hose for larger applications without frequent refills.', specs: ['10L', 'Pressure pump', 'Long hose'] },
  { id: 14, name: 'Chemical Sprayer 20L', price: 3500, discount: 12, isNew: true, image: sprayer20Img, category: 'Sprayers', description: '20L heavy-duty sprayer for extended work periods; ideal for medium acreage.', specs: ['20L', 'Heavy duty'] },

  { id: 15, name: 'All-purpose Tool Rack', price: 2500, discount: 10, isNew: false, image: rackImg, category: 'Storage', description: 'Sturdy tool rack to keep your garden tools organized; metal construction and multiple hooks.', specs: ['Holds multiple tools', 'Wall mountable'] },

  { id: 17, name: 'Trowel (Stainless)', price: 220, discount: 0, isNew: false, image: trowelImg, category: 'Hand Tools', description: 'Stainless steel hand trowel with comfortable rubber grip — ideal for planting and potting.', specs: ['Stainless steel', 'Ergonomic grip'] },
  { id: 18, name: 'Pruning Loppers (24")', price: 1500, discount: 7, isNew: false, image: loppersImg, category: 'Hand Tools', description: 'Long-handled pruning loppers for cutting thicker branches with leverage and precision.', specs: ['24-inch handles', 'Bypass blades', 'Shock-absorbing grips'] },
  { id: 19, name: 'Garden Fork (4-tine)', price: 950, discount: 0, isNew: false, image: forkImg, category: 'Hand Tools', description: 'Robust 4-tine garden fork for turning soil and aeration; forged steel tines and hardwood handle.', specs: ['Forged steel tines', 'Hardwood handle'] },
  { id: 20, name: 'Hand Hoe (Dutch)', price: 480, discount: 0, isNew: false, image: hoeImg, category: 'Hand Tools', description: 'Dutch hoe for weeding and soil cultivation, lightweight and easy to use for raised beds.', specs: ['Lightweight', 'Sharp edge'] },
  { id: 21, name: 'Pruning Saw (Folding)', price: 880, discount: 5, isNew: false, image: pruningsawImg, category: 'Hand Tools', description: 'Folding pruning saw for cutting thicker limbs; compact and safe to carry in the tool belt.', specs: ['Folding blade', 'Compact', 'High-carbon steel'] },
  { id: 22, name: 'Gardening Gloves (Pair)', price: 350, discount: 0, isNew: false, image: glovesImg, category: 'Hand Tools', description: 'Durable gardening gloves with reinforced palms to protect hands during pruning and digging.', specs: ['Reinforced palms', 'Adjustable cuff'] },

  { id: 23, name: 'Portable Toolbox (Steel)', price: 4200, discount: 10, isNew: false, image: toolboxImg, category: 'Storage', description: 'Lockable steel toolbox with removable tray — store hand tools and small accessories securely.', specs: ['Lockable', 'Removable tray', 'Steel body'] },
  { id: 24, name: 'Garden Organizer Bin (3-tier)', price: 1850, discount: 8, isNew: true, image: organizerBinImg, category: 'Storage', description: '3-tier organizer bin for seeds, gloves, and small tools; stackable and weather-resistant.', specs: ['3 tiers', 'Stackable', 'Weather-resistant'] },
  { id: 25, name: 'Outdoor Storage Cabinet', price: 13900, discount: 12, isNew: true, image: cabinetImg, category: 'Storage', description: 'Weatherproof outdoor cabinet to keep fertilizers, chemicals and larger tools safely stored.', specs: ['Weatherproof', 'Lockable doors', 'Shelved interior'] },
  { id: 26, name: 'Garden Utility Cart', price: 7600, discount: 5, isNew: false, image: gardenCartImg, category: 'Storage', description: 'Utility cart for moving soil, plants and tools around the garden; sturdy frame and pneumatic wheels.', specs: ['Pneumatic wheels', 'Sturdy frame', 'Large tray capacity'] },

  { id: 27, name: 'Drip Irrigation Starter Kit (20 Plants)', price: 2400, discount: 10, isNew: true, image: dripKitImg, category: 'Irrigation', description: 'Complete drip irrigation starter kit for up to 20 plants. Includes tubing, drippers, fittings and basic instructions.', specs: ['20 drippers', 'Main tubing included', 'Pressure regulator recommended'] },
  { id: 28, name: 'Soaker Hose 15m', price: 1250, discount: 5, isNew: false, image: soakerHoseImg, category: 'Irrigation', description: 'Porous soaker hose for slow even watering along beds and borders; easy to install and conserve water.', specs: ['15m length', 'Porous wall', 'UV-stable'] },
  { id: 29, name: 'Irrigation Timer (Digital)', price: 2890, discount: 12, isNew: true, image: irrigationTimerImg, category: 'Irrigation', description: 'Digital irrigation timer with multiple programmable schedules — battery powered and easy to mount to tap.', specs: ['Multiple schedules', 'Battery powered', 'Rain delay'] },
  { id: 30, name: 'Rotary Sprinkler (Adjustable)', price: 990, discount: 0, isNew: false, image: sprinklerImg, category: 'Irrigation', description: 'Adjustable rotary sprinkler for lawn coverage; sturdy base and adjustable spray radius.', specs: ['Adjustable radius', 'Rotary head', 'Stable base'] },
  { id: 31, name: 'Gardening Apron (Heavy-Duty)', price: 850, discount: 5, isNew: true, image: apronImg, category: 'Accessories', description: 'Durable canvas apron with multiple pockets for hand tools, seed packets and gloves — adjustable straps for comfort.', specs: ['Canvas, water resistant', 'Multiple pockets', 'Adjustable straps'] },
  { id: 32, name: 'Knee Pads (Gel)', price: 650, discount: 0, isNew: false, image: kneePadsImg, category: 'Accessories', description: 'Comfort gel knee pads with non-slip backing — ideal for prolonged kneeling during planting and weeding.', specs: ['Gel padding', 'Non-slip backing', 'Adjustable straps'] },
  { id: 33, name: 'Pruner Kit (3-piece)', price: 1450, discount: 8, isNew: true, image: prunerKitImg, category: 'Accessories', description: 'Set includes bypass pruner, snips and a sharpening stone — comes in a compact case for easy storage.', specs: ['Bypass pruner', 'Snips + sharpening stone', 'Storage case included'] },
  { id: 34, name: 'Foldable Hand Trolley', price: 4990, discount: 10, isNew: false, image: handTrolleyImg, category: 'Accessories', description: 'Lightweight foldable trolley to move pots, soil bags and tools — sturdy frame and quick-fold mechanism.', specs: ['Folds flat', 'Max load 80kg', 'Pneumatic wheels'] },
  { id: 35, name: 'Safety Goggles (Anti-Fog)', price: 420, discount: 0, isNew: false, image: gogglesImg, category: 'Protective Gear', description: 'Lightweight anti-fog safety goggles with wide peripheral vision and elastic strap — protects against dust and chemical splashes.', specs: ['Anti-fog lens', 'Elastic strap', 'Wide view'] },
  { id: 36, name: 'Respirator Mask (Reusable)', price: 1200, discount: 5, isNew: true, image: respiratorImg, category: 'Protective Gear', description: 'Reusable half-mask respirator with replaceable filters — ideal for spraying, dusty jobs and chemical handling.', specs: ['Replaceable filters', 'Adjustable straps', 'Silicone face seal'] },
  { id: 37, name: 'Work Boots (Steel Toe)', price: 2890, discount: 10, isNew: false, image: workBootsImg, category: 'Protective Gear', description: 'Durable steel-toe work boots with slip-resistant sole and comfortable insole — built for long outdoor workdays.', specs: ['Steel toe', 'Slip-resistant sole', 'Cushioned insole'] },
  { id: 38, name: 'High-Visibility Vest (Reflective)', price: 480, discount: 0, isNew: false, image: hiVisVestImg, category: 'Protective Gear', description: 'Lightweight reflective vest for safety during low-light conditions — adjustable side straps for a secure fit.', specs: ['Reflective strips', 'Adjustable sides', 'Lightweight'] },
  { id: 39, name: 'Garden Dibber (Wooden Handle)', price: 290, discount: 0, isNew: false, image: dibberImg, category: 'Hand Tools', description: 'Traditional dibber for planting seeds, bulbs, and seedlings — sturdy wooden handle and pointed steel tip.', specs: ['Wood handle', 'Steel tip', 'Ideal for bulbs & seedlings'] },
  { id: 40, name: 'Weed Puller (Stainless)', price: 680, discount: 5, isNew: true, image: weedPullerImg, category: 'Hand Tools', description: 'Compact weed puller with stainless-steel prongs to remove weeds at the root — comfortable ergonomic grip.', specs: ['Stainless steel', 'Ergonomic handle', 'Removes roots easily'] },
  { id: 41, name: 'Soil Scoop (Deep Bowl)', price: 320, discount: 0, isNew: false, image: soilScoopImg, category: 'Hand Tools', description: 'Wide and deep soil scoop ideal for transferring compost and soil — sturdy aluminum construction.', specs: ['Deep bowl', 'Aluminum body', 'Rust resistant'] },
  { id: 42, name: 'Hand Cultivator (3-Prong)', price: 400, discount: 6, isNew: true, image: handCultivatorImg, category: 'Hand Tools', description: '3-prong hand cultivator for loosening and aerating soil — comfortable rubber grip and durable steel tines.', specs: ['3 prongs', 'Rubber grip', 'Powder-coated steel'] },
  { id: 43, name: 'Bulb Planter (Spring Release)', price: 560, discount: 8, isNew: false, image: bulbPlanterImg, category: 'Hand Tools', description: 'Bulb planter with automatic soil release and depth markings for consistent planting depth every time.', specs: ['Depth markings', 'Spring release', 'Comfort grip handle'] },
  { id: 48, name: 'Humidity Monitor (Digital)', price: 1150, discount: 8, isNew: true, image: humidityMonitorImg, category: 'Plant Care Tools', description: 'Compact digital humidity and temperature monitor to track indoor plant environments — ideal for greenhouses and grow rooms.', specs: ['Digital LCD display', 'Tracks temp & humidity', 'Battery included'] },
  { id: 49, name: 'Plant Mister (Glass Bottle)', price: 460, discount: 0, isNew: false, image: plantMisterImg, category: 'Plant Care Tools', description: 'Stylish glass mister perfect for misting indoor plants, bonsai, and succulents — easy pump action with fine spray nozzle.', specs: ['Glass body', 'Fine mist nozzle', '500ml capacity'] },
  { id: 50, name: 'Plant Tying Tool (Automatic)', price: 2250, discount: 10, isNew: true, image: plantTyingToolImg, category: 'Plant Care Tools', description: 'Automatic plant tying tool makes vine training quick and easy — ideal for tomatoes, grapes, and climbing plants.', specs: ['Automatic tape binding', 'Lightweight alloy body', 'Includes tape roll'] },
  { id: 51, name: 'Leaf Shiner Spray (Natural Formula)', price: 390, discount: 0, isNew: false, image: leafShinerImg, category: 'Plant Care Tools', description: 'Natural leaf shiner spray enhances leaf gloss and removes dust — safe for ornamental and indoor plants.', specs: ['Natural formula', 'Removes dust', 'Non-toxic'] },
  { id: 52, name: 'Plant Label Set (Reusable)', price: 250, discount: 0, isNew: false, image: plantLabelSetImg, category: 'Plant Care Tools', description: 'Set of 30 reusable plant labels with waterproof marker — perfect for identifying herbs, flowers, and vegetables.', specs: ['30 pieces', 'Waterproof marker included', 'Reusable plastic'] }
])

/* ---------------------------
   Derived categories
   --------------------------- */
const categories = computed(() => [...new Set(products.value.map(p => p.category))])

/* ---------------------------
   Filters state + range sliders
   --------------------------- */
const filters = ref({ search: '', priceMin: null, priceMax: null, categories: [], discountOnly: false, newOnly: false, sort: '' })
const priceMin = Math.min(...products.value.map(p => p.price))
const priceMax = Math.max(...products.value.map(p => p.price))
const rangeLow = ref(priceMin)
const rangeHigh = ref(priceMax)

watch(() => filters.value.priceMin, (v) => { if (v === null || v === '') return; rangeLow.value = Math.max(priceMin, Number(v)) })
watch(() => filters.value.priceMax, (v) => { if (v === null || v === '') return; rangeHigh.value = Math.min(priceMax, Number(v)) })

function syncRangeFromLow() { if (rangeLow.value > rangeHigh.value) rangeLow.value = rangeHigh.value; filters.value.priceMin = rangeLow.value }
function syncRangeFromHigh() { if (rangeHigh.value < rangeLow.value) rangeHigh.value = rangeLow.value; filters.value.priceMax = rangeHigh.value }

const rangeFillStyle = computed(() => {
  const total = priceMax - priceMin || 1
  const leftPercent = ((rangeLow.value - priceMin) / total) * 100
  const rightPercent = ((rangeHigh.value - priceMin) / total) * 100
  return { left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }
})

/* ---------------------------
   Cart
   --------------------------- */
const cart = ref([])
function addToCart(product, qty = 1) {
  if (!product) return
  qty = Number(qty) || 1
  const existing = cart.value.find(c => c.id === product.id)
  const price = discountedPrice(product.price, (product.discount ?? 0))
  if (existing) {
    existing.quantity = Math.max(1, existing.quantity + qty)
  } else {
    cart.value.push({ id: product.id, name: product.name, price, quantity: qty })
  }
}
function removeFromCart(item) { cart.value = cart.value.filter(i => i.id !== item.id) }
function clearCart() { cart.value = [] }
const totalPrice = computed(() => cart.value.reduce((s, it) => s + it.price * it.quantity, 0))

/* ---------------------------
   Details modal (accessibility + quantity)
   --------------------------- */
const detailsOpen = ref(false)
const detailsProduct = ref({ id: null, name: '', image: '', price: 0, discount: 0, category: '', description: '', specs: [], isNew: false })
const modalEl = ref(null)
const modalQty = ref(1)
const hoverId = ref(null)
const btnPulse = ref(null)
const modalHover = ref(false)

watch(detailsOpen, async (open) => {
  if (open) {
    modalQty.value = 1
    await nextTick()
    if (modalEl.value) {
      modalEl.value.focus()
      focusable = getFocusableElements(modalEl.value)
      focusIndex = 0
      if (focusable.length) focusable[0].focus()
    }
    window.addEventListener('keydown', handleEsc)
  } else {
    window.removeEventListener('keydown', handleEsc)
  }
})

function openDetails(product) {
  if (!product) return
  detailsProduct.value = { ...product }
  detailsProduct.value.sku = product.sku || ''
  detailsProduct.value.weight = product.weight || ''
  detailsProduct.value.manufacturer = product.manufacturer || ''
  detailsProduct.value.rating = product.rating || ''
  detailsOpen.value = true
}

function closeDetails() {
  detailsOpen.value = false
  nextTick(() => {
    const activeBtn = document.querySelector('.product-card .details-btn')
    if (activeBtn) activeBtn.focus()
  })
}

function handleEsc(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeDetails()
  }
}

/* Focus trap helpers */
let focusable = []
let focusIndex = 0
function getFocusableElements(container) {
  if (!container) return []
  const els = Array.from(container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')
  return els
}

/* Handle tab so focus stays in modal */
function handleTabKey(e) {
  focusable = getFocusableElements(modalEl.value)
  if (!focusable.length) return
  if (e.shiftKey) {
    focusIndex = (focusIndex - 1 + focusable.length) % focusable.length
  } else {
    focusIndex = (focusIndex + 1) % focusable.length
  }
  focusable[focusIndex].focus()
}

/* qty controls */
function incrementQty() { modalQty.value = Math.max(1, modalQty.value + 1) }
function decrementQty() { modalQty.value = Math.max(1, modalQty.value - 1) }

/* share + copy helpers */
function copyLink(product) {
  const url = window.location.href + `#product-${product.id}`
  navigator.clipboard?.writeText(url).then(() => {
    alert('Product link copied to clipboard.')
  }).catch(() => { alert('Unable to copy link.') })
}
function openShare(product) {
  if (navigator.share) {
    navigator.share({ title: product.name, text: product.description, url: window.location.href })
      .catch(() => {})
  } else {
    alert('Sharing not supported in this browser.')
  }
}

/* ---------------------------
   Filtering logic
   --------------------------- */
const filteredProducts = computed(() => {
  let list = products.value.slice()
  if (filters.value.search && filters.value.search.trim()) {
    const q = filters.value.search.trim().toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
  }
  if (filters.value.categories.length) list = list.filter(p => filters.value.categories.includes(p.category))
  if (filters.value.priceMin != null && filters.value.priceMin !== '') list = list.filter(p => discountedPrice(p.price, p.discount) >= filters.value.priceMin)
  if (filters.value.priceMax != null && filters.value.priceMax !== '') list = list.filter(p => discountedPrice(p.price, p.discount) <= filters.value.priceMax)
  if (filters.value.discountOnly) list = list.filter(p => p.discount && p.discount > 0)
  if (filters.value.newOnly) list = list.filter(p => p.isNew)

  if (filters.value.sort === 'price-asc') list.sort((a,b) => discountedPrice(a.price,a.discount) - discountedPrice(b.price,b.discount))
  else if (filters.value.sort === 'price-desc') list.sort((a,b) => discountedPrice(b.price,b.discount) - discountedPrice(a.price,a.discount))
  else if (filters.value.sort === 'discount-desc') list.sort((a,b) => (b.discount || 0) - (a.discount || 0))
  else if (filters.value.sort === 'new-first') list.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0))

  return list
})

function toggleCategory(cat) { const idx = filters.value.categories.indexOf(cat); if (idx === -1) filters.value.categories.push(cat); else filters.value.categories.splice(idx, 1) }
function resetFilters() { filters.value = { search: '', priceMin: null, priceMax: null, categories: [], discountOnly: false, newOnly: false, sort: '' }; rangeLow.value = priceMin; rangeHigh.value = priceMax }
function applyFilters() { if (!filters.value.priceMin && filters.value.priceMin !== 0) filters.value.priceMin = rangeLow.value; if (!filters.value.priceMax && filters.value.priceMax !== 0) filters.value.priceMax = rangeHigh.value }

/* ---------------------------
   Checkout & Order flow
   --------------------------- */
const checkoutOpen = ref(false)
const checkout = ref({ name: '', phone: '', address: '', city: '', pincode: '' })
const errors = ref({})
const orderPlaced = ref(null)

function openCheckout() { if (cart.value.length === 0) { alert('Cart is empty.'); return } errors.value = {}; checkoutOpen.value = true }
function closeCheckout() { checkoutOpen.value = false; errors.value = {} }

function validateCheckout() {
  errors.value = {}
  let ok = true
  const c = checkout.value
  if (!c.name || !c.name.trim()) { errors.value.name = 'Name is required'; ok = false }
  if (!c.phone || !/^[0-9+ -]{7,15}$/.test(c.phone)) { errors.value.phone = 'Enter valid phone'; ok = false }
  if (!c.address || c.address.trim().length < 5) { errors.value.address = 'Enter delivery address'; ok = false }
  return ok
}

function placeOrder() {
  if (!validateCheckout()) return
  const id = 'ORD' + Date.now().toString(36).toUpperCase()
  const date = new Date().toLocaleString()
  const customer = { name: checkout.value.name, phone: checkout.value.phone, address: checkout.value.address, city: checkout.value.city, pincode: checkout.value.pincode }
  const items = cart.value.map(i => ({ ...i }))
  const total = totalPrice.value
  const order = { id, date, customer, items, total, paymentMethodLabel: 'Cash on Delivery' }
  orderPlaced.value = order

  // clear cart & checkout
  cart.value = []
  checkoutOpen.value = false
  checkout.value = { name: '', phone: '', address: '', city: '', pincode: '' }
}

/* ---------------------------
   Printing receipt
   --------------------------- */
function printReceipt() {
  const el = document.getElementById('receipt')
  if (!el) { alert('No receipt to print.'); return }
  const css = `<style>body{font-family:Arial,Helvetica,sans-serif;padding:18px;color:#111}h4{margin-top:0}.receipt-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}.receipt-total{margin-top:12px;font-weight:900;font-size:16px}.receipt-items{margin-top:8px}</style>`
  const newWindow = window.open('', '_blank', 'width=800,height=700')
  newWindow.document.write('<!doctype html><html><head><title>Receipt</title>' + css + '</head><body>')
  newWindow.document.write(el.outerHTML)
  newWindow.document.write('</body></html>')
  newWindow.document.close()
  newWindow.focus()
  setTimeout(() => { newWindow.print(); newWindow.close() }, 300)
}

function closeReceipt() { orderPlaced.value = null }

/* ---------------------------
   Helpers
   --------------------------- */
function discountedPrice(price, discount = 0) { if (!discount) return Math.round(price); return Math.round(price * (1 - discount / 100)) }
function formatNumber(n) { return n?.toLocaleString('en-IN') }

/* ---------------------------
   Discount price animations: IntersectionObserver + helpers
   - Observe product cards only (no carousel slides)
   --------------------------- */
let priceObserver = null
let saleAnimating = ref(false) // kept for product-card animation toggles

function handleIntersect(entries) {
  entries.forEach(entry => {
    const el = entry.target
    if (!el) return
    if (entry.isIntersecting) {
      el.classList.add('price-animate')
      saleAnimating.value = true
      setTimeout(() => { saleAnimating.value = false }, 900)
    }
  })
}

function initPriceObserver() {
  if (typeof IntersectionObserver === 'undefined') return
  priceObserver = new IntersectionObserver(handleIntersect, { threshold: 0.3 })
  nextTick(() => {
    const cards = Array.from(document.querySelectorAll('.product-card.has-discount'))
    cards.forEach(el => priceObserver.observe(el))
  })
}

function disconnectPriceObserver() {
  if (priceObserver) {
    priceObserver.disconnect()
    priceObserver = null
  }
}

/* ---------------------------
   Lifecycle: mount observers
   --------------------------- */
onMounted(() => {
  initPriceObserver()
})

onBeforeUnmount(() => {
  disconnectPriceObserver()
})
</script>

<style scoped>
.farming-tools-page { display: flex; gap: 22px; padding: 18px; font-family: Inter, system-ui, Arial; background: #f6f7f9; color: #1f2937; box-sizing: border-box; }
.sidebar { width: 320px; background: linear-gradient(180deg,#ffffff 0%, #fbfbfb 100%); border-radius: 10px; box-shadow: 0 8px 30px rgba(15,23,42,0.06); overflow: hidden; padding-bottom: 12px; }
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
.range-fill { position: absolute; top: 0; height: 100%; background: linear-gradient(90deg,#f37920,#ff8a3d); border-radius: 99px; }
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

/* PRODUCTS AREA */
.products-area { flex: 1; }
.page-title { color:#111827; font-weight:800; margin-bottom:12px; }
.page-title.heading-animated {
  position: relative;
  overflow: visible;
  display: inline-block;
  padding-bottom: 12px;
  margin-bottom: 18px;
}
.title-words { display: inline-flex; gap: 6px; align-items: baseline; }
.title-words .word {
  display: inline-block;
  transform: translateY(10px);
  opacity: 0;
  font-weight: 900;
  letter-spacing: 0.6px;
  font-size: 20px;
}
.title-underline {
  display: block;
  height: 6px;
  width: 100%;
  max-width: 420px;
  background: linear-gradient(90deg,#f37920,#ff8a3d);
  border-radius: 999px;
  transform-origin: left center;
  transform: scaleX(0);
  margin-top: 10px;
  opacity: 0.95;
  transition: none;
}
.page-title.is-animated .title-words .word {
  animation: letterSlide 1600ms cubic-bezier(.2,.9,.3,1) forwards;
}
.page-title.is-animated .title-words .word:nth-child(1) { animation-delay: 0ms; }
.page-title.is-animated .title-words .word:nth-child(2) { animation-delay: 300ms; }
.page-title.is-animated .title-words .word:nth-child(3) { animation-delay: 600ms; }
.page-title.is-animated .title-words .word:nth-child(4) { animation-delay: 900ms; }
.page-title.is-animated .title-underline {
  animation: underlineGrow 1800ms cubic-bezier(.2,.9,.3,1) 1200ms forwards;
}
@keyframes letterSlide {
  0%   { transform: translateY(14px) skewY(2deg); opacity: 0; filter: blur(4px); }
  60%  { transform: translateY(-5px) skewY(0deg); opacity: 1; filter: blur(0px); }
  100% { transform: translateY(0); opacity: 1; filter: none; }
}
@keyframes underlineGrow {
  0%   { transform: scaleX(0); opacity: 0; }
  60%  { transform: scaleX(1.04); opacity: 1; }
  100% { transform: scaleX(1); opacity: 1; }
}

.products-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
.product-card { background: #fff; border-radius: 10px; padding: 14px; box-shadow: 0 8px 26px rgba(15,23,42,0.04); display:flex; flex-direction:column; align-items:center; position:relative; transform-origin: center bottom; transition: transform .28s cubic-bezier(.2,.9,.3,1), box-shadow .28s ease; }
.product-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 18px 48px rgba(15,23,42,0.12); }
.ribbon { position:absolute; left:-32px; top:12px; transform:rotate(-15deg); background:#ff7a2d; color:#fff; padding:6px 8px; font-weight:800; border-radius:6px; box-shadow:0 6px 16px rgba(255,122,45,0.12); transform-origin: left top; }
.ribbon.shake { animation: shake 900ms both; }
@keyframes shake { 0%{transform:rotate(-12deg) translateX(0)}20%{transform:rotate(-18deg) translateX(-3px)}40%{transform:rotate(-10deg) translateX(2px)}60%{transform:rotate(-16deg) translateX(-2px)}80%{transform:rotate(-13deg) translateX(1px)}100%{transform:rotate(-15deg) translateX(0)} }
.new-badge { position:absolute; right:12px; top:12px; background:#ef4444; color:#fff; padding:6px 10px; border-radius:20px; font-weight:700; }
.product-media img { max-width:160px; max-height:160px; object-fit:contain; transition: transform .5s cubic-bezier(.2,.9,.3,1), filter .28s ease; }
.product-title { font-weight:800; margin:10px 0 6px; text-align:center; font-size:14px; }
.title-row { display:flex; flex-direction:column; align-items:center; gap:6px; }
.meta-cat { font-size:12px; color:#6b7280; font-weight:700; display:inline-block; background:#fff6f0; padding:6px 8px; border-radius:999px; color:#f37920; }
.price-row { display:flex; gap:12px; align-items:baseline; margin-bottom:10px; }
.original { color:#9ca3af; text-decoration:line-through; font-size:13px; position:relative; }
.final { font-weight:900; font-size:16px; color:#111827; position:relative; }
.card-actions { display:flex; gap:8px; margin-top:8px; width:100%; }
.add-btn { background:linear-gradient(90deg,#f37920,#ff8a3d); color:#fff; padding:10px; border-radius:8px; border:none; font-weight:800; box-shadow:0 8px 20px rgba(243,121,32,0.12); cursor:pointer; flex:1; display:flex; align-items:center; justify-content:center; gap:8px; transform-origin:center; transition: transform .18s ease, box-shadow .18s ease; }
.add-btn .btn-icon { display:inline-block; width:18px; height:18px; border-radius:4px; background:rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; font-weight:900; }
.add-btn:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 18px 36px rgba(243,121,32,0.14); }
.details-btn { background:transparent; border:1px solid #e6e9ee; padding:10px; border-radius:8px; font-weight:800; cursor:pointer; width:140px; transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.btn-details-hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(15,23,42,0.06); background: rgba(243,121,32,0.04); border-color: rgba(243,121,32,0.12); }
.cart-panel { margin-top:18px; background:#fff; padding:12px; border-radius:10px; box-shadow:0 8px 26px rgba(15,23,42,0.04); }
.cart-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #eef2f7; }
.cart-total { font-weight:900; margin-top:12px; }
.cart-actions { display:flex; gap:10px; margin-top:12px; }
.checkout-btn { background:#111827; color:#fff; padding:10px 12px; border-radius:8px; border:none; font-weight:800; }
.clear-btn { background:transparent; color:#ef4444; border:1px solid rgba(239,68,68,0.08); padding:10px 12px; border-radius:8px; }
.checkout-form { margin-top: 12px; background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.04); }
.form-row { margin-bottom: 10px; display:flex; flex-direction:column; gap:6px; }
.form-row input, .form-row textarea { padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; box-sizing: border-box; }
.form-row.two-cols { display:flex; gap:10px; }
.field-error { color: #ef4444; font-weight:700; font-size:13px; margin-top:4px; }
.form-actions { display:flex; gap:12px; margin-top:10px; }
.place-order-btn { background: #0f766e; color: #fff; border: none; padding: 10px 14px; border-radius: 6px; cursor: pointer; font-weight: 800; }
.cancel-btn { background: transparent; color: #374151; border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 6px; cursor: pointer; }
.receipt { margin-top: 16px; background: #fff; padding: 14px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.04); }
.receipt-items { margin-top: 8px; }
.receipt-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom: 1px dotted #eee; }
.receipt-total { margin-top: 8px; font-weight:900; font-size:16px; }
.receipt-actions { margin-top: 12px; display:flex; gap:10px; }
.print-btn { background: #111827; color: #fff; padding: 8px 12px; border-radius:6px; border:none; cursor:pointer; font-weight:700; }
.done-btn { background: transparent; color:#374151; border:1px solid #e5e7eb; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:700; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(11, 15, 30, 0.55); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px; }
.modal { background:#fff; border-radius:12px; width:100%; max-width:980px; padding:18px; box-shadow: 0 30px 80px rgba(2,6,23,0.45); position:relative; transform-origin:center; transition: transform .28s cubic-bezier(.2,.9,.3,1); outline: none; }
.modal:hover { transform: translateY(-6px); }
.modal-close { position:absolute; right:12px; top:12px; background:transparent; border:none; font-size:18px; cursor:pointer; }
.modal-close { font-size:18px; width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border-radius:999px; transition: background .12s ease; }
.modal-close:hover { background: rgba(15,23,42,0.04); }

.modal-grid { display:grid; grid-template-columns: 1fr 1fr; gap:18px; align-items:start; transition: transform .28s ease, box-shadow .28s ease; }
.modal-grid.modal-hover { transform: translateY(-6px) scale(1.005); box-shadow: 0 24px 60px rgba(2,6,23,0.25); }
.modal-image img { width:100%; height:100%; max-height:420px; object-fit:contain; border-radius:8px; transform-origin:center; transition: transform .4s cubic-bezier(.2,.9,.3,1); }
.modal:hover .modal-image img { transform: scale(1.02) rotate(-1deg); }
.modal-body h3 { margin:0 0 8px; font-size:20px; }
.modal-meta { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.modal-meta .meta-cat { background:#fff6f0; color:#f37920; padding:6px 8px; border-radius:999px; font-weight:700; font-size:12px; }
.modal-new { background:#ef4444; color:#fff; padding:4px 8px; border-radius:6px; font-weight:700; font-size:11px; }
.modal-price-row { display:flex; gap:10px; align-items:baseline; margin:8px 0 12px; }
.modal-description { color:#374151; line-height:1.5; margin-bottom:12px; }
.modal-specs { list-style:disc; padding-left:18px; margin-bottom:12px; color:#4b5563; }
.modal-actions { display:flex; gap:10px; }
.modal-extra { margin: 8px 0; color:#4b5563; font-size:13px; display:flex; gap:12px; flex-wrap:wrap; }
.modal-cta-row { display:flex; gap:12px; align-items:center; margin-top:12px; flex-wrap:wrap; }
.qty-label { font-weight:700; margin-right:8px; }
.qty-controls { display:flex; align-items:center; gap:6px; }
.qty-controls button { width:34px; height:34px; border-radius:6px; border:1px solid #e6e9ee; background:#fff; cursor:pointer; font-weight:800; }
.qty-controls input { width:68px; text-align:center; padding:8px; border-radius:6px; border:1px solid #e5e7eb; }
.modal-more { margin-top:12px; display:flex; gap:8px; }

/* PRINT STYLES */
@media print {
  body * { visibility: hidden; }
  .receipt, .receipt * { visibility: visible; }
  .receipt { position: absolute; left: 0; top: 0; width: 100%; }
  @page { margin: 10mm; }
}

/* RESPONSIVE */
@media (max-width: 980px) {
  .farming-tools-page { flex-direction:column; padding:12px; }
  .sidebar { width:100%; order:2; }
  .products-area { order:1; }
  .modal-grid { grid-template-columns: 1fr; }
  .carousel-dots { display:none; }
}





/* strike line */
.product-card.has-discount .price-row .original::after,
.flash-carousel .sale-prices.has-discount .sale-original::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: currentColor;
  transform-origin: left center;
  transform: scaleX(0);
  opacity: 0.95;
}

/* heartbeat animation */
@keyframes heartbeat {
  0%   { transform: scale(1); }
  15%  { transform: scale(1.12); }
  40%  { transform: scale(0.98); }
  60%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}

/* when price-animate class present -> reveal strike and pulse */
.product-card.price-animate .price-row .original::after,
.flash-carousel.price-animate .sale-original::after {
  transition: transform 520ms cubic-bezier(.2,.9,.3,1);
  transform: scaleX(1);
}

/* final price heartbeat */
.product-card.price-animate .price-row .final,
.flash-carousel.price-animate .sale-final {
  animation: heartbeat 900ms ease-in-out 200ms;
  transform-origin: center;
}


</style>
