<template>
  <div id="super-admin-root">
    <div class="sidebar">
      <div class="admin-profile">
        <div class="avatar">A</div>
        <div class="info">
          <h2>Admin Control</h2>
          <p>Status: <strong>Active</strong></p>
        </div>
      </div>
      <div class="nav-links">
        <button class="nav-item" :class="{active: currentTab === 'orders'}" @click="currentTab = 'orders'">📦 Orders</button>
        <button class="nav-item" :class="{active: currentTab === 'analytics'}" @click="currentTab = 'analytics'">📈 Analytics</button>
        <button class="nav-item" :class="{active: currentTab === 'users'}" @click="currentTab = 'users'">👥 Users</button>
        <button class="nav-item" :class="{active: currentTab === 'settings'}" @click="currentTab = 'settings'">⚙️ Settings</button>
      </div>
      <button @click="logout" class="btn-logout">Logout System</button>
    </div>

    <div class="main-content">
      <header class="dark-header">
        <div class="header-text">
          <h1>Admin Dashboard</h1>
          <p class="white-text">Manage and track all incoming farm orders</p>
        </div>
        <div class="stats">
          <div class="stat-card dark-card">
            <div class="stat-icon">📥</div>
            <div class="stat-val">
              <h3 class="white-text">Total Orders</h3>
              <p class="white-text">{{ orders.length }}</p>
            </div>
          </div>
          <div class="stat-card dark-card">
            <div class="stat-icon">💰</div>
            <div class="stat-val">
              <h3 class="white-text">Revenue</h3>
              <p class="white-text">Rs. {{ totalRevenue.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- ORDERS TAB CONTENT -->
      <div v-if="currentTab === 'orders'" class="tab-content">
        <div class="table-container">
          <div class="table-header">
            <h2>Recent Orders</h2>
            <div class="table-actions">
              <button class="btn-refresh" @click="refreshOrders">Refresh Data</button>
            </div>
          </div>
          <div class="orders-table-wrapper">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date & Time</th>
                  <th>Customer Information</th>
                  <th>Items Details</th>
                  <th>Total Value</th>
                  <th>Customer Message</th>
                  <th>Status Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <td class="black-text"><span class="order-id">{{ order.id }}</span></td>
                  <td class="black-text">
                    <div class="date-time">
                      <span class="date">{{ formatDate(order.date) }}</span>
                      <span class="time">{{ formatTime(order.date) }}</span>
                    </div>
                  </td>
                  <td class="black-text">
                    <div class="cust-info">
                      <div class="name"><strong>User: {{ order.customer.name }}</strong></div>
                      <div class="contact">📞 {{ order.customer.phone || order.customer.contact }}</div>
                      <div class="address">🏠 {{ order.customer.address }}</div>
                    </div>
                  </td>
                  <td class="black-text">
                    <ul class="items-list">
                      <li v-for="item in order.items" :key="item.name">
                        {{ item.name }} <span class="qty">x{{ item.qty }}</span>
                      </li>
                    </ul>
                  </td>
                  <td class="black-text"><span class="price-val">Rs. {{ order.total.toLocaleString() }}</span></td>
                  <td class="black-text">
                    <div class="msg-box">{{ order.message || 'No feedback' }}</div>
                  </td>
                  <td>
                    <div class="status-deal">
                      <select v-model="order.status" class="status-select" :class="order.status.toLowerCase()">
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button class="btn-apply-status" @click="updateOrderStatus(order)">Apply</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="orders.length === 0">
                  <td colspan="7" class="no-orders black-text">
                    <div class="empty-state">
                      <span>📭</span>
                      <p>No orders yet.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ANALYTICS TAB CONTENT -->
      <div v-else-if="currentTab === 'analytics'" class="tab-content placeholder-content">
        <div class="glass-box">
          <h2>📊 Analytics & Insights</h2>
          <p>Sales reports, performance metrics, and growth trends will appear here.</p>
        </div>
      </div>

      <!-- USERS TAB CONTENT -->
      <div v-else-if="currentTab === 'users'" class="tab-content placeholder-content">
        <div class="glass-box">
          <h2>👥 Registered Users</h2>
          <p>Manage community members and fellow farmers from this section.</p>
        </div>
      </div>

      <!-- SETTINGS TAB CONTENT -->
      <div v-else-if="currentTab === 'settings'" class="tab-content placeholder-content">
        <div class="glass-box">
          <h2>⚙️ System Settings</h2>
          <p>Modify platform preferences and security configurations here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(JSON.parse(localStorage.getItem('currentUser') || '{}'))
const currentTab = ref('orders')

// Security check
onMounted(() => {
  if (currentUser.value.role !== 'admin') {
    alert('Access Denied. Admins only.')
    router.push('/main')
  }
})

const orders = ref(JSON.parse(localStorage.getItem('allOrders') || '[]'))

const totalRevenue = computed(() => {
  return orders.value.reduce((sum, order) => sum + order.total, 0)
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function refreshOrders() {
  orders.value = JSON.parse(localStorage.getItem('allOrders') || '[]')
}

function updateOrderStatus(order) {
  localStorage.setItem('allOrders', JSON.stringify(orders.value))
  alert(`Order ${order.id} status updated to ${order.status}`)
}

function logout() {
  localStorage.removeItem('currentUser')
  router.push('/')
}
</script>

<style scoped>
/* Styles moved to global style.css for absolute production reliability */
</style>
