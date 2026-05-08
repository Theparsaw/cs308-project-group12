<template>
  <div class="min-h-[calc(100vh-80px)] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#fff7ed_100%)]">
    <div class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
      <aside class="bg-white border border-gray-200 rounded-3xl p-4 h-fit lg:sticky lg:top-24">
        <div class="mb-6">
          <p class="text-sm font-semibold text-orange-600 mb-1">{{ panelKicker }}</p>
          <h2 class="text-xl font-bold text-gray-900">{{ panelTitle }}</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ panelDescription }}
          </p>
        </div>

        <nav class="space-y-2">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition border"
            :class="isActive(item.to)
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'"
          >
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <section class="min-w-0">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { authStore } from '../../store/auth'

const route = useRoute()

const userRole = computed(() => authStore.role)

const panelKicker = computed(() => {
  return userRole.value === 'sales_manager' ? 'Sales Panel' : 'Product Manager Panel'
})

const panelTitle = computed(() => {
  return userRole.value === 'sales_manager'
    ? 'Pricing Management'
    : 'Store Management'
})

const panelDescription = computed(() => {
  return userRole.value === 'sales_manager'
    ? 'Manage product prices.'
    : 'Manage products, categories, reviews, stock, and deliveries.'
})

const navItems = computed(() => {
  if (userRole.value === 'sales_manager') {
    return [
      { label: 'Pricing', to: '/admin/pricing' },
    ]
  }

  return [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Products', to: '/admin/products' },
    { label: 'Categories', to: '/admin/categories' },
    { label: 'Reviews & Ratings', to: '/admin/reviews' },
    { label: 'Stock', to: '/admin/stock' },
    { label: 'Deliveries', to: '/admin/deliveries' },
  ]
})

const isActive = (target) => {
  return route.path === target || route.path.startsWith(`${target}/`)
}
</script>
