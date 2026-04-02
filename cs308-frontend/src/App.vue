<template>
  <nav class="p-4 border-b flex items-center gap-4">
    <router-link to="/">Home</router-link>
    <router-link to="/products">Products</router-link>
    <router-link to="/cart">Cart</router-link>
    <router-link to="/admin/products">Admin</router-link>
    <router-link v-if="!authStore.isLoggedIn" to="/login">Login</router-link>
    <button
      v-else
      type="button"
      class="text-left cursor-pointer"
      @click="handleLogout"
    >
      Logout
    </button>
  </nav>

  <router-view />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { authStore } from './store/auth'

const router = useRouter()

const handleLogout = () => {
  authStore.clearAuth()
  router.push('/login')
}
</script>
