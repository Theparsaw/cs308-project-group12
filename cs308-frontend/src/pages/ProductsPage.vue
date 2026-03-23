<template>
  <div class="p-6 flex flex-col md:flex-row gap-6">
    <aside class="w-full md:w-64 shrink-0">
      <h2 class="text-xl font-bold mb-4 border-b pb-2">Categories</h2>
      <ul class="space-y-2">
        <li>
          <button
            @click="selectedCategoryId = null"
            :class="[
              'w-full text-left px-3 py-2 rounded transition capitalize',
              selectedCategoryId === null ? 'bg-red-100 text-red-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'
            ]"
          >
            All Products
          </button>
        </li>
        <li v-for="categoryId in uniqueCategories" :key="categoryId">
          <button
            @click="selectedCategoryId = categoryId"
            :class="[
              'w-full text-left px-3 py-2 rounded transition capitalize',
              selectedCategoryId === categoryId ? 'bg-red-100 text-red-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'
            ]"
          >
            {{ categoryId }}
          </button>
        </li>
      </ul>
    </aside>

    <main class="flex-1">
      <h1 class="text-3xl text-red-500 mb-6 capitalize">
        {{ selectedCategoryId || 'All Products' }}
      </h1>

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
          <h2 class="text-xl font-semibold">{{ product.name }}</h2>
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
const selectedCategoryId = ref(null)

const uniqueCategories = computed(() => {
  const categories = new Set(products.value.map(p => p.categoryId))
  return Array.from(categories).filter(Boolean) 
})

const filteredProducts = computed(() => {
  if (!selectedCategoryId.value) return products.value
  return products.value.filter(p => p.categoryId === selectedCategoryId.value)
})

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