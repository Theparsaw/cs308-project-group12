<template>
  <div>
    <div class="mb-6">
      <p class="text-sm font-semibold text-orange-600 mb-2">Inventory</p>
      <h1 class="text-3xl font-bold text-gray-900">Stock Management</h1>
      <p class="text-gray-600 mt-2">
        Monitor low stock items and manage product quantities.
      </p>
    </div>

    <div v-if="loading" class="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
      Loading stock data...
    </div>

    <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <template v-else>
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <p class="text-sm text-gray-500 mb-2">Low Stock Items</p>
          <p class="text-3xl font-bold text-gray-900">{{ lowStockCount }}</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <p class="text-sm text-gray-500 mb-2">Out of Stock</p>
          <p class="text-3xl font-bold text-gray-900">{{ outOfStockCount }}</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl p-6">
          <p class="text-sm text-gray-500 mb-2">Total SKUs</p>
          <p class="text-3xl font-bold text-gray-900">{{ totalProducts }}</p>
        </div>
      </div>

      <div class="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex-1">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search by product ID, model, or brand..."
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

      <div
        v-if="filteredProducts.length === 0"
        class="rounded-3xl border border-gray-200 bg-white p-8 text-gray-600"
      >
        No products found for the current stock filters.
      </div>

      <div v-else class="rounded-3xl border border-gray-200 bg-white overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[980px]">
            <thead class="bg-gray-50">
              <tr class="text-left text-sm text-gray-600">
                <th class="px-6 py-4 font-semibold">Product</th>
                <th class="px-6 py-4 font-semibold">Product ID</th>
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
                        :alt="`${product.model} by ${product.name}`"
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
                      <p class="font-semibold text-gray-900">{{ product.model }}</p>
                      <p class="text-sm text-gray-500">{{ product.name }}</p>
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
                  <router-link
                    :to="`/admin/products/edit/${product.productId}`"
                    class="inline-flex rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Edit Product
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '../../api/productApi'

const products = ref([])
const loading = ref(true)
const error = ref('')
const searchTerm = ref('')
const stockFilter = ref('all')

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
]

const loadProducts = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await getProducts()
    products.value = res.data ?? []
  } catch (err) {
    error.value = 'Failed to load stock data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const totalProducts = computed(() => products.value.length)

const lowStockCount = computed(() =>
  products.value.filter((p) => {
    const stock = Number(p.quantityInStock) || 0
    return stock > 0 && stock <= 5
  }).length
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
      String(product.model ?? '').toLowerCase().includes(term) ||
      String(product.name ?? '').toLowerCase().includes(term)

    const stock = Number(product.quantityInStock) || 0

    const matchesFilter =
      stockFilter.value === 'all' ||
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

onMounted(loadProducts)
</script>
