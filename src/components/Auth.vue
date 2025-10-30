
<template>
  <div class="auth-page" :style="{ backgroundImage: `url('${currentBg}')` }">
    <div class="overlay"></div>

    <div class="animated-background">
      <div class="circle large"></div>
      <div class="circle medium"></div>
      <div class="circle small"></div>
      <div class="circle x-small"></div>
    </div>
    <div class="auth-container">
      <transition name="slide-up-fade" mode="out-in">
        <div :key="activeTab" class="auth-card">
          <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="loginUser">
            <h2 class="premium-title">
              <span class="welcome-text">Welcome </span>
              <span class="back-text">Back</span>
            </h2>
            <p class="subtitle-text">ACCESS YOUR FARMING DASHBOARD.</p>
            
            <div class="input-group">
                <input v-model="username" type="text" placeholder="Username" />
            </div>
            
            <div class="input-group password-group">
                <input 
                    v-model="password" 
                    :type="passwordVisible ? 'text' : 'password'" 
                    placeholder="Password" 
                />
                <button 
                    type="button" 
                    class="password-toggle" 
                    @click="togglePasswordVisibility"
                    aria-label="Toggle Password Visibility"
                >
                    {{ passwordVisible ? '👁️' : '🔒' }}
                </button>
            </div>
            
            <button class="btn-premium" type="submit">LOGIN</button>

            <p class="toggle">
              Don’t have an account?
              <span @click="switchTab('signup')">Sign Up</span>
            </p>
            <p class="toggle small" @click="switchTab('reset')">Forgot Password?</p>
          </form>

          <form v-else-if="activeTab === 'signup'" class="auth-form" @submit.prevent="signupUser">
            <h2 class="premium-title">
              <span class="welcome-text">Create </span>
              <span class="back-text">Account</span>
            </h2>
            <p class="subtitle-text">JOIN THE FARMAROGYA PLATFORM.</p>
            <div class="input-group">
                <input v-model="username" type="text" placeholder="Username" required />
            </div>
            <div class="input-group">
                <input v-model="email" type="email" placeholder="Email Address" required />
            </div>
            <div class="input-group">
                <input 
                    v-model="password" 
                    :type="passwordVisible ? 'text' : 'password'" 
                    placeholder="Password" 
                    required 
                />
                 <button 
                    type="button" 
                    class="password-toggle" 
                    @click="togglePasswordVisibility"
                    aria-label="Toggle Password Visibility"
                >
                    {{ passwordVisible ? '👁️' : '🔒' }}
                </button>
            </div>
            <button class="btn-premium" type="submit">REGISTER</button>

            <p class="toggle">
              Already have an account?
              <span @click="switchTab('login')">Login</span>
            </p>
          </form>

          <form v-else class="auth-form" @submit.prevent="resetPassword">
            <h2 class="premium-title">
              <span class="welcome-text">Password </span>
              <span class="back-text">Reset</span>
            </h2>
             <p class="subtitle-text">WE'LL SEND YOU A RECOVERY LINK.</p>
            <div class="input-group">
                <input v-model="email" type="email" placeholder="Enter registered email" required />
            </div>
            <button class="btn-premium" type="submit">SEND LINK</button>

            <p class="toggle">
              Back to
              <span @click="switchTab('login')">Login</span>
            </p>
          </form>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['authSuccess'])

const bgImages = [
  '/images/main.jpg',
  '/images/Market/2.jpg',
  '/images/Guide/3.jpg',
  '/images/Disease/1.jpg',
  '/images/Guide/5.jpg',
]
const currentBg = ref(bgImages[0])
setInterval(() => {
  const random = Math.floor(Math.random() * bgImages.length)
  currentBg.value = bgImages[random]
}, 6000)

const activeTab = ref('login')
const username = ref('')
const password = ref('')
const email = ref('')

// New state for password visibility
const passwordVisible = ref(false);

const switchTab = (tab) => (activeTab.value = tab)

const loginUser = () => {
  emit('authSuccess')
}

const signupUser = () => alert(`Sign up for ${username.value}`)
const resetPassword = () => alert(`Reset link sent to ${email.value}`)

// New toggle password
const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value;
}
</script>


<style scoped>

@font-face {
  font-family: 'OrganicScript';
  src: url('../assets/fonts/OrganicFarm.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}

/* 🧠 Layout base */
.auth-page {
  position: relative;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  transition: background-image 1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #121212;
}
.overlay {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(2px) brightness(0.2);
  z-index: 0;
}
.auth-container {
  z-index: 2;
  width: 90%;
  max-width: 380px; 
}

/*card glow */

.auth-card {
  background: #1e1e1e;
  border-radius: 12px; 
  padding: 35px 30px; 
  color: #fff;
  box-shadow: 
    8px 8px 16px #0d0d0d,
    -8px -8px 16px #2f2f2f,
    0 0 20px rgba(0, 201, 167, 0.4);
  animation: floatUp 1s cubic-bezier(0.25, 0.8, 0.5, 1) forwards;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-form {
  display: flex;
  flex-direction: column;
  /* Reduced gap between elements */
  gap: 12px; 
}


.premium-title {
  text-align: center;
  /* Reduced base font size */
  font-size: 2.2rem;
  font-weight: normal;
  color: #00C9A7;
  letter-spacing: 0;
  margin-bottom: 5px; 
  display: flex;
  justify-content: center;
  align-items: baseline;
  line-height: 1.1;
  white-space: nowrap;
}

.welcome-text {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: 600;
    font-size: 1em; 
    margin-right: 4px;
    color: #00C9A7;
}

.back-text {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    font-size: 1em; 
    font-weight: 600;
    color: #00C9A7;
    text-shadow: none; 
}

/* Subtitle Styles */
.subtitle-text {
    text-align: center;
    font-size: 0.95rem;
    color: #888;
    margin-bottom: 20px; 
    font-weight: 300;
    letter-spacing: 1.5px;
    text-transform: uppercase;
}

/* Input Group Styling */
.input-group {
    position: relative;
    margin-bottom: 12px;
}
/* New style for password group */
.input-group.password-group {
    display: flex;
    align-items: center;
}

input {
  width: 90%;
  
  padding: 12px 13px; 
  border: none;
  border-radius: 8px;
  background: #121212;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
  box-shadow: inset 4px 4px 8px #0d0d0d, inset -4px -4px 8px #2f2f2f;
}


.password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #00C9A7; 
    cursor: pointer;
    font-size: 1.1rem;
    padding: 5;
    z-index: 10;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5); 
}
.password-toggle:hover {
    color: #00ffc7;
}


input:focus {
  background: #161616;
  box-shadow: 
    0 0 0 2px #c608db, 
    inset 4px 4px 8px #0d0d0d, 
    inset -4px -4px 8px #2f2f2f;
  border-color: transparent;
}

input::placeholder {
    color: #f1eded;
}

.input-group:focus-within::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    height: 3px;
    background: #00C9A7;
    width: 100%;
    transform: translateX(-50%) scaleX(0);
    animation: underline-wipe 0.3s forwards;
    border-radius: 2px;
}

@keyframes underline-wipe {
    100% {
        transform: translateX(-50%) scaleX(1);
    }
}

.btn-premium {
  background: #00C9A7;
  color: #121212;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 4px 4px 8px #0d0d0d, -4px -4px 8px #2f2f2f;
}
.btn-premium:hover {
  background: #00a88d;
  transform: translateY(-1px);
  box-shadow: 
    0 0 15px rgba(0, 201, 167, 0.7), 
    6px 6px 12px #0d0d0d, 
    -6px -6px 12px #2f2f2f;
}

.toggle {
  text-align: center;
  margin-top: 15px;
  color: #ccc;
}
.toggle span {
  color: #00C9A7;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.3s;
}
.toggle span:hover {
  color: #00ffc7;
  text-decoration: underline;
}
.toggle.small {
  font-size: 0.9rem;
  opacity: 0.8;
}


.animated-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
}

.circle {
    position: absolute;
    display: block;
    list-style: none;
    background: #7d9793;
    opacity: 0.08;
    bottom: -150px; 
    border-radius: 50%;
    animation: grow-and-float 25s linear infinite;
}

.circle.large { width: 100px; height: 100px; left: 10%; animation-duration: 10s; }
.circle.medium { width: 60px; height: 60px; left: 40%; animation-duration: 20s; animation-delay: 5s; }
.circle.small { width: 40px; height: 40px; left: 70%; animation-duration: 15s; animation-delay: 10s; }
.circle.x-small { width: 20px; height: 20px; left: 90%; animation-duration: 40s; animation-delay: 2s; }


@keyframes grow-and-float {
    10% { transform: translateY(0) scale(1); opacity: 0.08; margin-left: 0; }
    100% { transform: translateY(-1000px) scale(0.5); opacity: 0; margin-left: 50px; }
}

@keyframes floatUp {
  30% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}


.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.slide-up-fade-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-fade-leave-to { opacity: 0; transform: translateY(-20px); }


@media (max-width: 768px) {
  .auth-card { padding: 30px 20px; }
  .premium-title { font-size: 1.8rem; }
  .welcome-text { font-size: 1em; }
  .back-text { font-size: 1em; }
}
</style>