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

      <p v-if="cartMessage" class="mt-4 text-sm" :class="cartMessageTone === 'error' ? 'text-red-600' : 'text-green-600'">
        {{ cartMessage }}
      </p>

      <div class="mt-4 flex gap-3">
        <button
          class="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          :disabled="addingToCart"
          @click="handleAddToCart"
        >
          Add to Cart
        </button>
        <router-link to="/cart" class="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
          Go to Cart
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addItemToCart } from '../api/cartApi'
import { getProductById } from '../api/productApi'

const route = useRoute()
const router = useRouter()

const product = ref({})
const loading = ref(true)
const error = ref('')
const addingToCart = ref(false)
const cartMessage = ref('')
const cartMessageTone = ref('success')

const goBack = () => {
  router.push('/products')
  // or use: router.back()
}

const handleAddToCart = async () => {
  addingToCart.value = true
  cartMessage.value = ''

  try {
    await addItemToCart(product.value.productId, 1)
    cartMessage.value = 'Added to cart'
    cartMessageTone.value = 'success'
  } catch (err) {
    cartMessage.value = err?.response?.data?.message || 'Failed to add to cart'
    cartMessageTone.value = 'error'
    console.error(err)
  } finally {
    addingToCart.value = false
  }
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
