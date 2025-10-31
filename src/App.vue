<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import './assets/style/ai_style.css'
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: none;
  color: #fff;
}

#app {
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>