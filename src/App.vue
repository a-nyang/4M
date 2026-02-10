<template>
  <div id="app">
    <nav class="tool-nav">
      <router-link to="/" class="nav-btn" active-class="active">📊 Excel Processor</router-link>
      <router-link to="/liner" class="nav-btn" active-class="active">✒️ Liner</router-link>
      <router-link to="/qr" class="nav-btn" active-class="active">𖣯 QR</router-link>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.tool-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: #f1f5f9;
}

.nav-btn {
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-weight: bold;
  transition: 0.3s;
  border: 1px solid #e2e8f0;
}

.nav-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}
</style>