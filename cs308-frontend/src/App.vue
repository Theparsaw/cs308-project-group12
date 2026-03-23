<template>
  <nav class="p-4 border-b flex gap-4">
    <router-link to="/">Home</router-link>
    <router-link to="/Products">Products</router-link>
    <router-link to="/cart">Cart</router-link>
    <router-link to="/admin/products">Admin</router-link>
  </nav>

  <router-view />
</template>

<script setup>
</script>
