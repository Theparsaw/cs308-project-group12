<template>
  <div class="p-6 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">Add Product</h1>

    <p v-if="error" class="mb-4 text-red-600">{{ error }}</p>

    <ProductForm
      :categories="categories"
      submit-label="Create Product"
      @submit="handleCreate"
      @cancel="goBack"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createProduct } from '../../api/productApi'
import ProductForm from '../../components/admin/ProductForm.vue'
import { categories } from '../../data/categories'

const router = useRouter()
const error = ref('')

const handleCreate = async (formData) => {
  try {
    await createProduct(formData)
    router.push('/admin/products')
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to create product'
    console.error(err)
  }
}

const goBack = () => {
  router.push('/admin/products')
}
</script>