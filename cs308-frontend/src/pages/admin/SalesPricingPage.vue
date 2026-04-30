<template>
  <div>
    <div class="mb-6">
      <p class="text-sm font-semibold text-orange-600 mb-2">Pricing</p>
      <h1 class="text-3xl font-bold text-gray-900">Price Management</h1>
      <p class="text-gray-600 mt-2">Update product prices from the admin panel.</p>
    </div>

    <div class="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by product name or ID..."
        class="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
      />
    </div>

    <div v-if="loading" class="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
      Loading products...
    </div>

    <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <div v-else class="rounded-3xl border border-gray-200 bg-white overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">Product</th>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">Category</th>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">Current Price</th>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">New Price</th>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="product in filteredProducts" :key="product.productId">
            <td class="px-6 py-4">
              <p class="font-semibold text-gray-900">{{ product.name }}</p>
              <p class="text-gray-400 text-xs">{{ product.productId }}</p>
            </td>
            <td class="px-6 py-4 text-gray-600 capitalize">{{ product.categoryId }}</td>
            <td class="px-6 py-4 font-semibold text-gray-900">${{ product.price.toFixed(2) }}</td>
            <td class="px-6 py-4">
              <input
                v-model="priceInputs[product.productId]"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter new price"
                class="w-32 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                :class="errors[product.productId] ? 'border-red-400' : ''"
              />
              <p v-if="errors[product.productId]" class="text-red-500 text-xs mt-1">
                {{ errors[product.productId] }}
              </p>
            </td>
            <td class="px-6 py-4">
              <button
                @click="updatePrice(product)"
                :disabled="saving[product.productId]"
                class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {{ saving[product.productId] ? 'Saving...' : 'Save' }}
              </button>
              <span v-if="success[product.productId]" class="ml-2 text-green-600 text-xs font-semibold">
                ✓ Updated
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredProducts.length === 0" class="p-8 text-center text-gray-500">
        No products found.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { getProducts, updateProduct } from '../../api/productApi'

const products = ref([])
const loading = ref(true)
const error = ref('')
const searchTerm = ref('')
const priceInputs = reactive({})
const saving = reactive({})
const success = reactive({})
const errors = reactive({})

const filteredProducts = computed(() => {
  const term = searchTerm.value.toLowerCase()
  if (!term) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.productId.toLowerCase().includes(term)
  )
})

const loadProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getProducts()
    products.value = res.data ?? []
  } catch (err) {
    error.value = 'Failed to load products'
  } finally {
    loading.value = false
  }
}

const updatePrice = async (product) => {
  const raw = priceInputs[product.productId]
  errors[product.productId] = ''

  if (raw === undefined || raw === '') {
    errors[product.productId] = 'Please enter a price'
    return
  }

  const newPrice = parseFloat(raw)

  if (isNaN(newPrice) || newPrice < 0) {
    errors[product.productId] = 'Price must be a positive number'
    return
  }

  saving[product.productId] = true
  success[product.productId] = false

  try {
    await updateProduct(product.productId, { price: newPrice })
    product.price = newPrice
    priceInputs[product.productId] = ''
    success[product.productId] = true
    setTimeout(() => { success[product.productId] = false }, 3000)
  } catch (err) {
    errors[product.productId] = 'Failed to update price'
  } finally {
    saving[product.productId] = false
  }
}

onMounted(loadProducts)
</script>