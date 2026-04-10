<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-orange-500 shrink-0">
          CS308 Store
        </router-link>

        <!-- Search bar -->
        <div class="flex-1">
          <input
            type="text"
            placeholder="Search products, categories, brands..."
            class="w-full border border-orange-300 rounded-full px-5 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <!-- Right side actions -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Cart -->
          <router-link
            to="/cart"
            class="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:shadow-sm hover:border-gray-400 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1 5h12m-9 0a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-800">Cart</span>
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -right-2 -top-2 inline-flex min-w-6 items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-xs font-semibold text-white"
            >
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <!-- Login -->
          <router-link
            v-if="!authStore.isLoggedIn"
            to="/login"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:shadow-sm hover:border-gray-400 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0"
              />
            </svg>
            <span class="text-sm font-medium text-gray-800">Login</span>
          </router-link>

          <!-- Logout -->
          <button
            v-else
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:shadow-sm hover:border-gray-400 transition cursor-pointer"
            @click="handleLogout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3h8.25m0 0l-3-3m3 3l-3 3"
              />
            </svg>
            <span class="text-sm font-medium text-gray-800">Logout</span>
          </button>

          <!-- Admin -->
          <router-link
            v-if="authStore.isLoggedIn && ['sales_manager', 'product_manager'].includes(authStore.role)"
            to="/admin/products"
            class="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
          >
            Admin
          </router-link>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCart } from './api/cartApi'
import { authStore } from './store/auth'
import { cartStore } from './store/cart'

const router = useRouter()

const syncCartCount = async () => {
  try {
    const res = await getCart()
    cartStore.setTotalItems(res.data?.totalItems)
  } catch (error) {
    cartStore.clear()
  }
}

const handleLogout = () => {
  authStore.clearAuth()
  cartStore.clear()
  router.push('/login')
}

watch(
  () => authStore.token,
  () => {
    syncCartCount()
  },
  { immediate: true }
)

onMounted(syncCartCount)
</script>
