<template>
  <div class="p-6 flex flex-col md:flex-row gap-6">
    <aside class="w-full md:w-64 shrink-0">
      <h2 class="text-xl font-bold mb-4 border-b pb-2">Categories</h2>
      <ul class="space-y-2">

        <!-- All Products — clears all selections -->
        <li>
          <button
            @click="clearSelection"
            :class="[
              'w-full text-left px-3 py-2 rounded transition capitalize flex items-center gap-2',
              selectedCategories.size === 0 ? 'bg-red-100 text-red-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'
            ]"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0 transition-colors"
              :class="selectedCategories.size === 0 ? 'bg-red-500' : 'bg-transparent'"
            ></span>
            All Products
          </button>
        </li>

        <!-- Dropdown toggle -->
        <li>
          <button
            @click="dropdownOpen = !dropdownOpen"
            class="w-full text-left px-3 py-2 rounded transition flex items-center justify-between hover:bg-gray-100 text-gray-700"
          >
            <span class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full shrink-0 transition-colors"
                :class="selectedCategories.size > 0 ? 'bg-red-500' : 'bg-transparent'"
              ></span>
              <span class="capitalize">
                Filter by Category
                <span v-if="selectedCategories.size > 0" class="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                  {{ selectedCategories.size }}
                </span>
              </span>
            </span>
            <!-- Chevron -->
            <svg
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="dropdownOpen ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown list -->
          <ul
            v-show="dropdownOpen"
            class="mt-1 ml-2 border-l-2 border-red-100 pl-2 space-y-1"
          >
            <li v-for="categoryId in uniqueCategories" :key="categoryId">
              <button
                @click="toggleCategory(categoryId)"
                :class="[
                  'w-full text-left px-3 py-1.5 rounded transition capitalize flex items-center gap-2 text-sm',
                  selectedCategories.has(categoryId) ? 'bg-red-100 text-red-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'
                ]"
              >
                <!-- Red tick -->
                <svg
                  class="w-3.5 h-3.5 shrink-0 transition-opacity"
                  :class="selectedCategories.has(categoryId) ? 'text-red-500 opacity-100' : 'text-red-300 opacity-40'"
                  fill="none" stroke="currentColor" stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ categoryId }}
              </button>
            </li>
          </ul>
        </li>

      </ul>
    </aside>

    <main class="flex-1">
      <h1 class="text-3xl text-red-500 mb-6 capitalize">
        <span v-if="selectedCategories.size === 0">All Products</span>
        <span v-else-if="selectedCategories.size === 1">{{ [...selectedCategories][0] }}</span>
        <span v-else>{{ selectedCategories.size }} Categories</span>
      </h1>

      <!-- Active filter chips -->
      <div v-if="selectedCategories.size > 0" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="cat in selectedCategories"
          :key="cat"
          class="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-sm rounded-full capitalize"
        >
          {{ cat }}
          <button @click="toggleCategory(cat)" class="hover:text-red-900 ml-0.5">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <button @click="clearSelection" class="text-xs text-gray-400 hover:text-red-500 underline ml-1">
          Clear all
        </button>
      </div>

      <div v-if="loading" class="text-gray-600">Loading...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else-if="filteredProducts.length === 0" class="text-gray-500">
        No products found in this category.
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="product in filteredProducts"
          :key="product.productId"
          class="border rounded-lg p-4 shadow hover:shadow-lg transition"
        >
          <div class="flex items-baseline gap-3 mb-1">
            <h2 class="text-xl font-semibold text-gray-900">{{ product.name }}</h2>
            <span class="text-sm font-mono font-medium text-gray-500">{{ product.model }}</span>
          </div>

          <p class="mt-2 text-gray-600">{{ product.description }}</p>

          <p class="mt-3 font-semibold text-green-600">
            ${{ product.price.toLocaleString() }}
          </p>

          <p class="text-sm text-gray-500">
            Stock: {{ product.quantityInStock }}
          </p>

          <router-link
            :to="`/products/${product.productId}`"
            class="inline-block mt-4 text-blue-600 hover:underline"
          >
            View Details →
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '../api/productApi'

const products = ref([])
const loading = ref(true)
const error = ref('')
const selectedCategories = ref(new Set())
const dropdownOpen = ref(false)

const uniqueCategories = computed(() => {
  const categories = new Set(products.value.map(p => p.categoryId))
  return Array.from(categories).filter(Boolean)
})

const filteredProducts = computed(() => {
  if (selectedCategories.value.size === 0) return products.value
  return products.value.filter(p => selectedCategories.value.has(p.categoryId))
})

function toggleCategory(categoryId) {
  const next = new Set(selectedCategories.value)
  if (next.has(categoryId)) {
    next.delete(categoryId)
  } else {
    next.add(categoryId)
  }
  selectedCategories.value = next
}

function clearSelection() {
  selectedCategories.value = new Set()
  dropdownOpen.value = false
}

onMounted(async () => {
  try {
    const res = await getProducts()
    products.value = res.data
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>