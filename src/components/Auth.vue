<template>
  <!-- 3D animated background canvas -->
  

  <!-- Auth shell -->
  <div class="auth-page">
    <div class="auth-container">
      <transition name="flip-fade" mode="out-in">
        <div :key="activeTab" class="auth-card">

          <!-- LOGIN -->
          <form v-if="activeTab==='login'" @submit.prevent="loginUser">
            <div class="icon-emoji">🌿</div>

            <h1 class="title">Farm<span>Arogya</span></h1>
            <h2 class="subtitle">Sign in to your smart-farm</h2>

            <div class="input-group">
              <input v-model="username" type="text" required placeholder=" " autocomplete="username"/>
              <label>Username</label>
            </div>

            <div class="input-group">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" required placeholder=" " autocomplete="current-password"/>
              <label>Password</label>
              <span class="toggle-pass" @click="showPassword = !showPassword">
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/><circle cx="12" cy="12" r="2.5"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill-opacity="0.3"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2"/></svg>
              </span>
            </div>

            <button class="btn-primary" type="submit">Enter Farm</button>

            <div class="links">
              <span @click="switchTab('signup')">Create account</span>
              <span @click="switchTab('reset')">Forgot password?</span>
            </div>

            <p v-if="statusMsg" :class="statusClass">{{ statusMsg }}</p>
          </form>

          <!-- SIGNUP -->
          <form v-else-if="activeTab==='signup'" @submit.prevent="signupUser">
            <div class="icon-emoji">🌿</div>

            <h1 class="title">Farm<span>Arogya</span></h1>
            <h2 class="subtitle">Join the future of farming</h2>

            <div class="input-group">
              <input v-model="username" type="text" required placeholder=" "/>
              <label>Username</label>
            </div>

            <div class="input-group">
              <input v-model="email" type="email" required placeholder=" "/>
              <label>Email</label>
            </div>

            <div class="input-group">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" required placeholder=" "/>
              <label>Password</label>
              <span class="toggle-pass" @click="showPassword = !showPassword">
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/><circle cx="12" cy="12" r="2.5"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill-opacity="0.3"/><line x1="2" y1="2" x2="22" y2="22" stroke="white" stroke-width="2"/></svg>
              </span>
            </div>

            <button class="btn-primary" type="submit">Create Account</button>

            <div class="links">
              <span @click="switchTab('login')">Already have one? Sign in</span>
            </div>

            <p v-if="statusMsg" :class="statusClass">{{ statusMsg }}</p>
          </form>

          <!-- RESET -->
          <form v-else @submit.prevent="resetPassword">
            <div class="icon-emoji">🌿</div>

            <h1 class="title">Farm<span>Arogya</span></h1>
            <h2 class="subtitle">Reset your password</h2>

            <div class="input-group">
              <input v-model="email" type="email" required placeholder=" "/>
              <label>Email</label>
            </div>

            <button class="btn-primary" type="submit">Send Reset Link</button>

            <div class="links">
              <span @click="switchTab('login')">Back to login</span>
            </div>

            <p v-if="statusMsg" :class="statusClass">{{ statusMsg }}</p>
          </form>

        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'


const emit = defineEmits(['authSuccess'])

// 3D canvas field
const fieldCanvas = ref(null)
let ctx, w, h, cols, rows, vectors, angle = 0, animId

function resize() {
  w = innerWidth
  h = innerHeight
  fieldCanvas.value.width = w
  fieldCanvas.value.height = h
  const step = 28
  cols = Math.floor(w / step) + 1
  rows = Math.floor(h / step) + 1
  vectors = []
  for (let y = 0; y < rows; y++) {
    vectors[y] = []
    for (let x = 0; x < cols; x++) vectors[y][x] = Math.random() * Math.PI * 2
  }
}

function drawField() {
  ctx.clearRect(0, 0, w, h)
  const step = 28
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = vectors[y][x] + angle
      const sx = x * step, sy = y * step
      const ex = sx + Math.cos(v) * 12
      const ey = sy + Math.sin(v) * 12
      ctx.strokeStyle = `rgba(46,204,113,${0.08 + Math.sin(v) * 0.04})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    }
  }
  angle += 0.003
  animId = requestAnimationFrame(drawField)
}

onMounted(() => {
  ctx = fieldCanvas.value.getContext('2d')
  resize()
  drawField()
  addEventListener('resize', resize)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  removeEventListener('resize', resize)
})

// Form logic
const activeTab = ref('login')
const username = ref('')
const password = ref('')
const email = ref('')
const showPassword = ref(false)
const API_URL = 'http://localhost:3000/users'

// Status messages
const statusMsg = ref('')
const statusClass = ref('')

// Tab switch
const switchTab = t => {
  activeTab.value = t
  statusMsg.value = ''
  statusClass.value = ''
}

// Reset form
function reset() {
  username.value = ''
  password.value = ''
  email.value = ''
  showPassword.value = false
}

// AJAX login
async function loginUser() {
  statusMsg.value = 'Logging in...'
  statusClass.value = 'info'
  try {
    const r = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const j = await r.json()
    if (r.ok) {
      statusMsg.value = 'Login successful!'
      statusClass.value = 'success'
      emit('authSuccess')
      reset()
    } else {
      statusMsg.value = j.error || 'Invalid credentials'
      statusClass.value = 'error'
    }
  } catch {
    statusMsg.value = 'Cannot connect to server'
    statusClass.value = 'error'
  }
}

// AJAX signup
async function signupUser() {
  statusMsg.value = 'Creating account...'
  statusClass.value = 'info'
  try {
    const r = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
    })
    const j = await r.json()
    if (r.ok) {
      statusMsg.value = 'Signup successful! Redirecting to login...'
      statusClass.value = 'success'
      reset()
      setTimeout(() => switchTab('login'), 1500)
    } else {
      statusMsg.value = j.errors?.join(', ') || 'Signup failed'
      statusClass.value = 'error'
    }
  } catch {
    statusMsg.value = 'Cannot connect to server'
    statusClass.value = 'error'
  }
}

// Reset password (mock)
function resetPassword() {
  statusMsg.value = `Reset link sent to ${email.value}`
  statusClass.value = 'success'
  email.value = ''
}
</script>

<style scoped>
* { box-sizing: border-box }

@font-face {
  font-family: 'Agro';
  src: url('../assets/fonts/JejakCintta.otf') format('opentype');
}

/* 3D canvas */
.field-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background: radial-gradient(ellipse at center, #0a1f0a 0%, #020502 100%);
}

/* auth shell */
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.auth-container { width: 90%; max-width: 420px; }

/* stylish green auth card with vertical blur gradient */
.auth-card {
  position: relative; /* for pseudo-element */
  background: rgba(0, 0, 0, 0.2); 
  border: 2px solid rgba(18, 51, 3, 0.356); 
  border-radius: 28px;
  padding: 42px 36px;
  box-shadow: 
    0 14px 50px rgba(0, 0, 0, 0.35), 
    0 0 15px rgba(46, 204, 113, 0.5);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden; /* needed for pseudo-element clipping */
}

/* pseudo-element for vertical blur gradient */
.auth-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 28px;
  pointer-events: none;
  background: linear-gradient(
    to bottom, 
    rgba(0,0,0,0) 10%,       /* less blur at top */
    rgba(0, 0, 0, 0.3) 40%    /* more blur at bottom */
  );
  backdrop-filter: blur(2px); /* controls maximum blur */
}


/* hover effect: “shoot out” */
.auth-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.45), 
    0 0 25px rgba(46, 204, 113, 0.7);
}


/* form */
form { display: flex; flex-direction: column; gap: 24px }
.title { font-family: 'Agro', cursive; ; margin-bottom: -20px; font-size: 2.4rem; text-align: center; color: #fff; letter-spacing: 1px; }
.title span { color: #2ecc71 }
.subtitle { font-size: 1rem; color: rgb(255, 255, 255); text-align: center; margin-bottom: 40px ; z-index: 999;}

/* inputs */
.input-group { position: relative; }
.input-group input {
  width: 100%;
  padding: 14px 12px 10px;
  border: none;
  border-bottom: 2px solid rgba(255 255 255 / .2);
  background: none;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: border-color .3s, transform .3s;
}
.input-group input:focus { border-color: #2ecc71; transform: scale(1.02) }
.input-group label {
  position: absolute;
  left: 12px;
  top: 14px;
  color: rgba(255, 255, 255, 0.616);
  pointer-events: none;
  transition: all .25s;
}
.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -14px;
  left: 0;
  font-size: .75rem;
  color: #2ecc71;
}

/* Remove autofill background */
.input-group input:-webkit-autofill,
.input-group input:-webkit-autofill:hover,
.input-group input:-webkit-autofill:focus,
.input-group input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important; /* keeps background transparent */
  -webkit-text-fill-color: #ffffff !important; /* text color */
  transition: background-color 5000s ease-in-out 0s; /* prevents flash of default color */
}


.toggle-pass {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  cursor: pointer;
}

/* buttons */
.btn-primary {
  margin-top: 8px;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(90deg, #27ae60, #2ecc71, #27ae60);
  background-size: 200% 100%;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all .35s;
  animation: shimmer 3s infinite linear;
  z-index: 999;
}
.btn-primary:hover { background-position: 100% 0; transform: scale(1.05) }

/* vertical links */
.links {
  display: flex;
  flex-direction: column; /* stack links vertically */
  gap: 0.5rem;           /* space between links */
  font-size: 0.85rem;
  text-align: center;
  font-family: 'Calibri', sans-serif; /* Calibri font */
  margin-top: 20px;
  z-index: 999;
}

.links span {
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.3s;
  font-weight: bold;      /* bold text */
  font-style: italic;     /* italic text */
}

.links span:hover {
  transform: scale(1.2);  /* scale up on hover */
  text-decoration: underline;
}



/* status messages */
p.success { color: #2ecc71; font-size: .9rem; text-align: center; margin-top: -8px; z-index: 999; }
p.error { color: #e74c3c; font-size: .9rem; text-align: center; margin-top: -8px; z-index: 999; }
p.info { color: #00ff00; font-size: .9rem; text-align: center; margin-top: -8px; z-index: 999; }

/* 2025 style tab animation */
.flip-fade-enter-active { animation: flipIn 0.7s ease forwards }
.flip-fade-leave-active { animation: flipOut 0.6s ease forwards }

@keyframes flipIn {
  0% { transform: rotateY(90deg); opacity: 0 }
  50% { transform: rotateY(-15deg); opacity: 0.5 }
  100% { transform: rotateY(0deg); opacity: 1 }
}
@keyframes flipOut {
  0% { transform: rotateY(0deg); opacity: 1 }
  100% { transform: rotateY(90deg); opacity: 0 }
}

.icon-emoji {
  font-size: 2.5rem;       /* size of the leaf */
  text-align: center;
  margin-bottom: -42px;     /* spacing below the icon */
  z-index: 999;
}

/* Replace 3D canvas background with garden.png */
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  overflow: hidden; /* ensure blur doesn't spill */
}

.auth-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/garden.png') no-repeat center center;
  background-size: cover;
  filter: blur(0px);
  z-index: 0;          /* behind content */
}

.auth-container {
  position: relative;
  z-index: 1;          /* above blurred background */
}




/* shimmer */
@keyframes shimmer { 0% { background-position: 0 0 } 100% { background-position: 200% 0 } }

/* responsive */
@media (max-width: 480px) {
  .auth-card { padding: 32px 20px }
  .title { font-size: 2rem }
}

</style>
