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

        <p v-if="messages[product.productId]" class="mt-3 text-sm" :class="messageClasses[product.productId]">
          {{ messages[product.productId] }}
        </p>

        <div class="mt-4 flex items-center gap-4">
          <router-link
            :to="`/products/${product.productId}`"
            class="inline-block text-blue-600 hover:underline"
          >
            View Details →
          </router-link>

          <button
            class="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            :disabled="pendingProductId === product.productId"
            @click="handleAddToCart(product.productId)"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addItemToCart } from '../api/cartApi'
import { getProducts } from '../api/productApi'

const products = ref([])
const loading = ref(true)
const error = ref('')
const pendingProductId = ref('')
const messages = ref({})
const messageClasses = ref({})

const setProductMessage = (productId, message, tone) => {
  messages.value = {
    ...messages.value,
    [productId]: message,
  }
  messageClasses.value = {
    ...messageClasses.value,
    [productId]: tone === 'error' ? 'text-red-600' : 'text-green-600',
  }
}

const handleAddToCart = async (productId) => {
  pendingProductId.value = productId
  setProductMessage(productId, '', 'success')

  try {
    await addItemToCart(productId, 1)
    setProductMessage(productId, 'Added to cart', 'success')
  } catch (err) {
    setProductMessage(
      productId,
      err?.response?.data?.message || 'Failed to add to cart',
      'error'
    )
    console.error(err)
  } finally {
    pendingProductId.value = ''
  }
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
