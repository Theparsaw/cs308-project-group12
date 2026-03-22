<template>
  <div class="p-6">
    <h1 class="text-3xl text-red-500 mb-6">Products</h1>

    <div v-if="loading" class="text-gray-600">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="products.length === 0" class="text-gray-500">
      No products found.
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="product in products"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProducts } from '../api/productApi'

const products = ref([])
const loading = ref(true)
const error = ref('')

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