<template>
  <div class="p-6 max-w-4xl mx-auto">
    <button
      @click="goBack"
      class="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
    >
      <span>&larr;</span> Back to Products
    </button>

    <div v-if="loading" class="flex justify-center py-12 text-gray-600">
      <span class="animate-pulse">Loading product details...</span>
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
      {{ error }}
    </div>

    <div v-else class="bg-white border rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8">
      <div class="w-full md:w-1/2 bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]">
        <span class="text-gray-400">No Image Available</span>
      </div>

      <div class="w-full md:w-1/2 flex flex-col">
        <h1 class="text-3xl font-bold mb-2 text-gray-900">{{ product.name }}</h1>
        <p class="text-2xl text-green-600 font-bold mb-4">${{ product.price?.toLocaleString() }}</p>
        
        <p class="text-gray-700 mb-6">{{ product.description }}</p>

        <div class="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div><strong class="text-gray-900">Model:</strong> <span class="text-gray-600">{{ product.model }}</span></div>
          <div><strong class="text-gray-900">Category:</strong> <span class="text-gray-600">{{ product.categoryId }}</span></div>
          <div><strong class="text-gray-900">Stock:</strong> <span class="text-gray-600">{{ product.quantityInStock }}</span></div>
          <div><strong class="text-gray-900">Warranty:</strong> <span class="text-gray-600">{{ product.warrantyStatus }}</span></div>
        </div>

        <div class="mt-auto pt-6 border-t flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="flex items-center border rounded-lg">
              <button @click="decreaseQuantity" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg" :disabled="quantity <= 1">-</button>
              <span class="px-4 py-2 border-x min-w-[3rem] text-center">{{ quantity }}</span>
              <button @click="increaseQuantity" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg" :disabled="quantity >= product.quantityInStock">+</button>
            </div>
            
            <button 
              @click="handleAddToCart"
              class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              :disabled="product.quantityInStock === 0 || addingToCart"
            >
              <span v-if="addingToCart">Adding...</span>
              <span v-else-if="product.quantityInStock === 0">Out of Stock</span>
              <span v-else>Add to Cart</span>
            </button>
          </div>

          <div v-if="cartMessage" :class="cartMessageTone === 'error' ? 'text-red-600' : 'text-green-600'" class="text-sm mt-2">
            {{ cartMessage }}
          </div>
        </div>
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
const quantity = ref(1)

const addingToCart = ref(false)
const cartMessage = ref('')
const cartMessageTone = ref('success')

const goBack = () => {
  router.push('/products')
}

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

const increaseQuantity = () => {
  if (quantity.value < product.value.quantityInStock) quantity.value++
}

const handleAddToCart = async () => {
  addingToCart.value = true
  cartMessage.value = ''

  try {
    await addItemToCart(product.value.productId, quantity.value)
    cartMessage.value = `${quantity.value} item(s) added to cart`
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
    error.value = 'Failed to load product details.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>