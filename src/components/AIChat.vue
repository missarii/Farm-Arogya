<template>
  <div class="hi-page">
    <div class="container">
      <h1 class="title">Hi! 👋</h1>
      <p class="message">Welcome to FarmArogya</p>
      <button class="back-btn" @click="goBack">Back to Home</button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['back'])

const goBack = () => {
  emit('back')
}
</script>

<style scoped>
.hi-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f3d27 0%, #1e6b3f 50%, #27ae60 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 50px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 900;
  color: #fff;
  margin: 0 0 20px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  animation: pulse 2s ease-in-out infinite alternate;
}

.message {
  font-size: 1.4rem;
  color: #a9dfbf;
  margin-bottom: 30px;
  font-weight: 500;
}

.back-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.back-btn:hover {
  background: #219653;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.back-btn:active {
  transform: translateY(-1px);
}

/* Animation */
@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .container {
    padding: 40px 20px;
  }
  .title {
    font-size: 3.5rem;
  }
}
</style>