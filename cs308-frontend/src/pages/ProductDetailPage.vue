<template>
  <div class="p-6">
    <button
      @click="goBack"
      class="mb-4 text-blue-600 hover:underline"
    >
      ← Back to Products
    </button>

    <div v-if="loading" class="text-gray-600">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else class="border rounded-lg p-6 shadow">
      <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>

      <p class="mb-2 text-gray-700">
        <strong>Product ID:</strong> {{ product.productId }}
      </p>

      <p class="mb-2 text-gray-700">
        <strong>Category ID:</strong> {{ product.categoryId }}
      </p>

      <p class="mb-2 text-gray-700">
        <strong>Model:</strong> {{ product.model }}
      </p>

      <p class="mb-2 text-gray-700">
        <strong>Serial Number:</strong> {{ product.serialNumber }}
      </p>

      <p class="mb-2 text-gray-700">
        <strong>Description:</strong> {{ product.description }}
      </p>

      <p class="mb-2 text-green-600 font-semibold">
        <strong>Price:</strong> ${{ product.price?.toLocaleString() }}
      </p>

      <p class="mb-2 text-gray-700">
        <strong>Stock:</strong> {{ product.quantityInStock }}
      </p>

      <p class="mb-2 text-gray-700">
        <strong>Warranty Status:</strong> {{ product.warrantyStatus }}
      </p>

      <p class="mb-2 text-gray-700">
        <strong>Distributor Info:</strong> {{ product.distributorInfo }}
      </p>
      <p class="text-sm text-gray-400">
        Created: {{ new Date(product.createdAt).toLocaleDateString() }}
      </p>
      <p class="mt-2 text-sm text-gray-400">
        <strong>Last Updated:</strong>
        {{ new Date(product.updatedAt).toLocaleString() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductById } from '../api/productApi'

const route = useRoute()
const router = useRouter()

const product = ref({})
const loading = ref(true)
const error = ref('')

const goBack = () => {
  router.push('/products')
  // or use: router.back()
}

onMounted(async () => {
  try {
    const res = await getProductById(route.params.id)
    product.value = res.data
  } catch (err) {
    error.value = 'Failed to load product'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>