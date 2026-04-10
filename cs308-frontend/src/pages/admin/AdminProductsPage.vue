<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="text-sm font-semibold text-orange-600 mb-2">Product Management</p>
        <h1 class="text-3xl font-bold text-gray-900">Admin Products</h1>
        <p class="text-gray-600 mt-2">
          Manage product listings, monitor stock levels, and safely edit inventory.
        </p>
      </div>

      <router-link
        to="/admin/products/add"
        class="inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
      >
        Add Product
      </router-link>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      <div class="rounded-3xl border border-gray-200 bg-white p-5">
        <p class="text-sm text-gray-500 mb-2">Total Products</p>
        <p class="text-3xl font-bold text-gray-900">{{ products.length }}</p>
      </div>

      <div class="rounded-3xl border border-gray-200 bg-white p-5">
        <p class="text-sm text-gray-500 mb-2">In Stock</p>
        <p class="text-3xl font-bold text-gray-900">{{ inStockCount }}</p>
      </div>

      <div class="rounded-3xl border border-gray-200 bg-white p-5">
        <p class="text-sm text-gray-500 mb-2">Low Stock</p>
        <p class="text-3xl font-bold text-gray-900">{{ lowStockCount }}</p>
      </div>

      <div class="rounded-3xl border border-gray-200 bg-white p-5">
        <p class="text-sm text-gray-500 mb-2">Out of Stock</p>
        <p class="text-3xl font-bold text-gray-900">{{ outOfStockCount }}</p>
      </div>
    </div>

    <div class="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by product ID or name..."
            class="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            @click="stockFilter = option.value"
            class="rounded-full border px-4 py-2 text-sm font-medium transition"
            :class="stockFilter === option.value
              ? 'border-orange-500 bg-orange-500 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400'"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
      Loading products...
    </div>

    <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <div
      v-else-if="filteredProducts.length === 0"
      class="rounded-3xl border border-gray-200 bg-white p-8 text-gray-600"
    >
      No products found for the current filters.
    </div>

    <div v-else class="rounded-3xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px]">
          <thead class="bg-gray-50">
            <tr class="text-left text-sm text-gray-600">
              <th class="px-6 py-4 font-semibold">Product</th>
              <th class="px-6 py-4 font-semibold">Product ID</th>
              <th class="px-6 py-4 font-semibold">Price</th>
              <th class="px-6 py-4 font-semibold">Stock</th>
              <th class="px-6 py-4 font-semibold">Status</th>
              <th class="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.productId"
              class="border-t border-gray-100 hover:bg-gray-50/70"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-4 min-w-[300px]">
                  <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                    <img
                      v-if="product.imageUrl"
                      :src="product.imageUrl"
                      :alt="product.name"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-xs text-gray-400"
                    >
                      No image
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-gray-900">{{ product.name }}</p>
                    <p class="text-sm text-gray-500 line-clamp-2">
                      {{ product.description || 'No description' }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-gray-700">
                {{ product.productId }}
              </td>

              <td class="px-6 py-4 font-semibold text-gray-900">
                ${{ product.price?.toLocaleString() }}
              </td>

              <td class="px-6 py-4 text-gray-700">
                {{ product.quantityInStock }}
              </td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  :class="getStockBadgeClass(product.quantityInStock)"
                >
                  {{ getStockLabel(product.quantityInStock) }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <router-link
                    :to="`/admin/products/edit/${product.productId}`"
                    class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </router-link>

                  <button
                    @click="openDeleteModal(product)"
                    class="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p
      v-if="successMessage"
      class="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700"
    >
      {{ successMessage }}
    </p>

    <div
      v-if="productToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <p class="text-sm font-semibold text-red-600 mb-2">Danger Zone</p>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Delete product?</h2>

        <p class="text-gray-600 mb-4">
          You are about to delete
          <span class="font-semibold text-gray-900">{{ productToDelete.name }}</span>
          ({{ productToDelete.productId }}).
          This action cannot be undone.
        </p>

        <div class="rounded-2xl bg-gray-50 border border-gray-200 p-4 mb-5">
          <p class="text-sm text-gray-500">Product ID</p>
          <p class="font-medium text-gray-900 mb-2">{{ productToDelete.productId }}</p>
          <p class="text-sm text-gray-500">Current stock</p>
          <p class="font-medium text-gray-900">{{ productToDelete.quantityInStock }}</p>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="closeDeleteModal"
            class="rounded-2xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400"
          >
            Cancel
          </button>

          <button
            type="button"
            @click="confirmDelete"
            class="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts, deleteProduct } from '../../api/productApi'

const products = ref([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')
const searchTerm = ref('')
const stockFilter = ref('all')
const productToDelete = ref(null)

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
]

const loadProducts = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const res = await getProducts()
    products.value = res.data ?? []
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const inStockCount = computed(() =>
  products.value.filter((p) => Number(p.quantityInStock) > 5).length
)

const lowStockCount = computed(() =>
  products.value.filter((p) => Number(p.quantityInStock) > 0 && Number(p.quantityInStock) <= 5).length
)

const outOfStockCount = computed(() =>
  products.value.filter((p) => Number(p.quantityInStock) === 0).length
)

const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return products.value.filter((product) => {
    const matchesSearch =
      !term ||
      String(product.productId ?? '').toLowerCase().includes(term) ||
      String(product.name ?? '').toLowerCase().includes(term)

    const stock = Number(product.quantityInStock) || 0

    const matchesFilter =
      stockFilter.value === 'all' ||
      (stockFilter.value === 'in-stock' && stock > 5) ||
      (stockFilter.value === 'low-stock' && stock > 0 && stock <= 5) ||
      (stockFilter.value === 'out-of-stock' && stock === 0)

    return matchesSearch && matchesFilter
  })
})

const getStockLabel = (stock) => {
  const numericStock = Number(stock) || 0

  if (numericStock === 0) return 'Out of Stock'
  if (numericStock <= 5) return 'Low Stock'
  return 'In Stock'
}

const getStockBadgeClass = (stock) => {
  const numericStock = Number(stock) || 0

  if (numericStock === 0) return 'bg-red-100 text-red-700'
  if (numericStock <= 5) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

const openDeleteModal = (product) => {
  productToDelete.value = product
}

const closeDeleteModal = () => {
  productToDelete.value = null
}

const confirmDelete = async () => {
  if (!productToDelete.value) return

  try {
    await deleteProduct(productToDelete.value.productId)
    products.value = products.value.filter(
      (p) => p.productId !== productToDelete.value.productId
    )
    successMessage.value = 'Product deleted successfully'
    closeDeleteModal()
  } catch (err) {
    error.value = 'Failed to delete product'
    console.error(err)
  }
}

onMounted(loadProducts)
</script>