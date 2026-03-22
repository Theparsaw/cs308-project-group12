<template>
  <div class="p-6 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">Edit Product</h1>

    <div v-if="loading" class="text-gray-600">Loading...</div>
    <p v-else-if="error" class="mb-4 text-red-600">{{ error }}</p>

    <ProductForm
      v-else
      :initial-values="product"
      :categories="categories"
      submit-label="Update Product"
      :disable-product-id="true"
      @submit="handleUpdate"
      @cancel="goBack"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductById, updateProduct } from '../../api/productApi'
import ProductForm from '../../components/admin/ProductForm.vue'
import { categories } from '../../data/categories'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const loading = ref(true)
const error = ref('')

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

const handleUpdate = async (formData) => {
  try {
    const payload = { ...formData }
    delete payload.productId
    await updateProduct(route.params.id, payload)
    router.push('/admin/products')
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to update product'
    console.error(err)
  }
}

const goBack = () => {
  router.push('/admin/products')
}
</script>