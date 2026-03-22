<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Admin Products</h1>
      <router-link
        to="/admin/products/add"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add Product
      </router-link>
    </div>

    <div v-if="loading" class="text-gray-600">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left p-3 border-b">Product ID</th>
            <th class="text-left p-3 border-b">Name</th>
            <th class="text-left p-3 border-b">Price</th>
            <th class="text-left p-3 border-b">Stock</th>
            <th class="text-left p-3 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.productId">
            <td class="p-3 border-b">{{ product.productId }}</td>
            <td class="p-3 border-b">{{ product.name }}</td>
            <td class="p-3 border-b">${{ product.price?.toLocaleString() }}</td>
            <td class="p-3 border-b">{{ product.quantityInStock }}</td>
            <td class="p-3 border-b">
              <div class="flex gap-2">
                <router-link
                  :to="`/admin/products/edit/${product.productId}`"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </router-link>

                <button
                  @click="handleDelete(product.productId)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="successMessage" class="mt-4 text-green-600">{{ successMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProducts, deleteProduct } from '../../api/productApi'

const products = ref([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')

const loadProducts = async () => {
  try {
    const res = await getProducts()
    products.value = res.data
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (productId) => {
  const confirmed = window.confirm('Are you sure you want to delete this product?')
  if (!confirmed) return

  try {
    await deleteProduct(productId)
    products.value = products.value.filter((p) => p.productId !== productId)
    successMessage.value = 'Product deleted successfully'
  } catch (err) {
    error.value = 'Failed to delete product'
    console.error(err)
  }
}

onMounted(loadProducts)
</script>