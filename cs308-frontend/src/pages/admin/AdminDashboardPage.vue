<template>
  <div>
    <div class="mb-6">
      <p class="text-sm font-semibold text-orange-600 mb-2">Overview</p>
      <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="text-gray-600 mt-2">
        Quick overview of the store management area.
      </p>
    </div>

    <div v-if="loading" class="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
      Loading dashboard...
    </div>

    <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <template v-else>
      <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <p class="text-sm text-gray-500 mb-2">Products</p>
          <p class="text-3xl font-bold text-gray-900">{{ totalProducts }}</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <p class="text-sm text-gray-500 mb-2">Low Stock</p>
          <p class="text-3xl font-bold text-gray-900">{{ lowStockCount }}</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <p class="text-sm text-gray-500 mb-2">Pending Reviews</p>
          <p class="text-3xl font-bold text-gray-900">{{ pendingReviewsCount }}</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <p class="text-sm text-gray-500 mb-2">Out of Stock</p>
          <p class="text-3xl font-bold text-gray-900">{{ outOfStockCount }}</p>
        </div>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-2">
        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Inventory Snapshot</h2>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">In Stock</span>
              <span class="font-semibold text-gray-900">{{ inStockCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Low Stock</span>
              <span class="font-semibold text-gray-900">{{ lowStockCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Out of Stock</span>
              <span class="font-semibold text-gray-900">{{ outOfStockCount }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Moderation Snapshot</h2>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Pending Reviews</span>
              <span class="font-semibold text-gray-900">{{ pendingReviewsCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Total Products</span>
              <span class="font-semibold text-gray-900">{{ totalProducts }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-white border border-gray-200 rounded-3xl p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Next steps</h2>
        <p class="text-gray-600">
          Use the sidebar to manage products, review customer feedback, and monitor stock levels.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '../../api/productApi'
import { getPendingReviews } from '../../api/reviewApi'

const products = ref([])
const pendingReviews = ref([])
const loading = ref(true)
const error = ref('')

const totalProducts = computed(() => products.value.length)

const inStockCount = computed(() =>
  products.value.filter((p) => Number(p.quantityInStock) > 5).length
)

const lowStockCount = computed(() =>
  products.value.filter((p) => {
    const stock = Number(p.quantityInStock) || 0
    return stock > 0 && stock <= 5
  }).length
)

const outOfStockCount = computed(() =>
  products.value.filter((p) => Number(p.quantityInStock) === 0).length
)

const pendingReviewsCount = computed(() => pendingReviews.value.length)

const loadDashboard = async () => {
  loading.value = true
  error.value = ''

  try {
    const [productsRes, pendingReviewsRes] = await Promise.all([
      getProducts(),
      getPendingReviews(),
    ])

    products.value = productsRes.data ?? []
    pendingReviews.value = pendingReviewsRes.data?.data ?? []
  } catch (err) {
    error.value = 'Failed to load dashboard data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>