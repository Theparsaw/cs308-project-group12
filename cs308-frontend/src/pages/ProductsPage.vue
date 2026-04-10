<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <section class="bg-gradient-to-r from-orange-100 to-orange-50 rounded-3xl p-8 mb-8">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold text-orange-600 mb-2">Welcome to CS308 Store</p>
        <h1 class="text-4xl font-bold text-gray-900 mb-3">
          Discover products in a cleaner storefront
        </h1>
        <p class="text-gray-600 mb-5">
          Browse featured products, category-based selections, and a more modern shopping layout.
        </p>

        <div v-if="isSearching" class="mt-4 flex items-center gap-3 flex-wrap">
          <p class="text-sm text-gray-700">
            Showing results for:
            <span class="font-semibold text-orange-600">"{{ activeSearch }}"</span>
          </p>
          <button
            @click="clearSearch"
            class="text-sm text-orange-600 hover:underline"
          >
            Back to all products
          </button>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Categories</h2>
        <button
          v-if="selectedCategory"
          @click="selectedCategory = ''"
          class="text-sm text-orange-600 hover:underline"
        >
          Show all
        </button>
      </div>

      <div class="flex gap-3 overflow-x-auto pb-2">
        <button
          @click="selectedCategory = ''"
          :class="[
            'px-4 py-2 rounded-full border whitespace-nowrap transition',
            !selectedCategory
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
          ]"
        >
          All
        </button>

        <button
          v-for="categoryId in uniqueCategories"
          :key="categoryId"
          @click="selectedCategory = categoryId"
          :class="[
            'px-4 py-2 rounded-full border whitespace-nowrap transition capitalize',
            selectedCategory === categoryId
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
          ]"
        >
          {{ getCategoryLabel(categoryId) }}
        </button>
      </div>
    </section>

    <div v-if="loading" class="text-gray-600">Loading products...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <template v-else>
      <div
        v-if="isSearching && filteredProducts.length === 0"
        class="bg-white border border-gray-200 rounded-3xl p-8 text-gray-600"
      >
        No products found for
        <span class="font-semibold text-gray-900">"{{ activeSearch }}"</span>.
      </div>

      <template v-else-if="isSearching">
        <ProductSection
          :title="selectedCategory ? `${getCategoryLabel(selectedCategory)} Results` : 'Search Results'"
          :products="filteredProducts"
          :getCategoryLabel="getCategoryLabel"
        />
      </template>

      <template v-else>
        <ProductSection
          v-if="selectedCategory"
          :title="getCategoryLabel(selectedCategory)"
          :products="filteredProducts"
          :getCategoryLabel="getCategoryLabel"
        />

        <template v-else>
          <ProductSection
            title="Popular Products"
            :products="popularProducts"
            :getCategoryLabel="getCategoryLabel"
          />

          <section class="grid md:grid-cols-3 gap-4 mb-10">
            <div class="md:col-span-2 bg-orange-500 rounded-3xl p-8 text-white">
              <p class="text-sm font-semibold mb-2">Featured Collection</p>
              <h3 class="text-3xl font-bold mb-2">Upgrade your setup</h3>
              <p class="text-orange-50">
                Discover premium laptops, accessories, audio gear, and more.
              </p>
            </div>

            <div class="bg-white rounded-3xl p-6 border border-gray-200">
              <p class="text-sm text-gray-500 mb-2">Store Highlight</p>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Fresh arrivals</h3>
              <p class="text-gray-600 text-sm">
                New products and curated picks updated across categories.
              </p>
            </div>
          </section>

          <ProductSection
            title="Laptops"
            :products="laptopProducts"
            :getCategoryLabel="getCategoryLabel"
          />
          <ProductSection
            title="Gaming"
            :products="gamingProducts"
            :getCategoryLabel="getCategoryLabel"
          />
          <ProductSection
            title="Audio Picks"
            :products="audioProducts"
            :getCategoryLabel="getCategoryLabel"
          />
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductSection from '../components/ProductsSection.vue'
import { getProducts } from '../api/productApi'
import { categories } from '../data/categories'

const route = useRoute()
const router = useRouter()

const products = ref([])
const loading = ref(true)
const error = ref('')
const selectedCategory = ref('')

const activeSearch = computed(() =>
  typeof route.query.search === 'string' ? route.query.search.trim() : ''
)

const isSearching = computed(() => activeSearch.value.length > 0)

const categoryMap = computed(() => {
  return Object.fromEntries(categories.map(cat => [cat.categoryId, cat.name]))
})

const uniqueCategories = computed(() => {
  const ids = new Set(products.value.map(product => product.categoryId))
  return Array.from(ids).filter(Boolean)
})

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value
  return products.value.filter(product => product.categoryId === selectedCategory.value)
})

const popularProducts = computed(() => products.value.slice(0, 8))

const laptopProducts = computed(() =>
  products.value.filter(product => product.categoryId === 'laptops')
)

const audioProducts = computed(() =>
  products.value.filter(product => product.categoryId === 'audio')
)

const gamingProducts = computed(() =>
  products.value.filter(product => product.categoryId === 'gaming')
)

const getCategoryLabel = (categoryId) => {
  return categoryMap.value[categoryId] || categoryId
}

const loadProducts = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await getProducts(activeSearch.value)
    products.value = res.data ?? []
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  selectedCategory.value = ''
  router.push({ path: '/', query: {} })
}

watch(
  () => route.query.search,
  () => {
    selectedCategory.value = ''
    loadProducts()
  },
  { immediate: true }
)
</script>