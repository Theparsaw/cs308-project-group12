<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Hero -->
    <section class="bg-gradient-to-r from-orange-100 to-orange-50 rounded-3xl p-8 mb-8">
      <div class="max-w-2xl">
        <p class="text-sm font-semibold text-orange-600 mb-2">Welcome to CS308 Store</p>
        <h1 class="text-4xl font-bold text-gray-900 mb-3">
          Discover products in a cleaner storefront
        </h1>
        <p class="text-gray-600 mb-5">
          Browse featured products, category-based selections, and a more modern shopping layout.
        </p>
      </div>
    </section>

    <!-- Categories -->
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

    <!-- Loading / error -->
    <div v-if="loading" class="text-gray-600">Loading products...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <template v-else>
      <!-- If a category is selected, show only that row -->
      <section v-if="selectedCategory" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ getCategoryLabel(selectedCategory) }}
          </h2>
          <span class="text-sm text-gray-500">{{ filteredProducts.length }} products</span>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-2">
          <article
            v-for="product in filteredProducts"
            :key="product.productId"
            class="min-w-[260px] max-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex-shrink-0"
          >
            <div class="aspect-[4/3] rounded-xl bg-gray-100 mb-4 overflow-hidden">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="`${product.name} ${product.model}`"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400 text-sm"
              >
                No Image
              </div>
            </div>

            <p class="text-xs text-orange-600 font-semibold mb-1 capitalize">
              {{ getCategoryLabel(product.categoryId) }}
            </p>

            <h3 class="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
              {{ product.name }}
            </h3>

            <p class="text-sm text-gray-500 mt-1">{{ product.model }}</p>

            <p class="text-sm text-gray-600 mt-3 line-clamp-2 min-h-[40px]">
              {{ product.description }}
            </p>

            <div class="mt-4 flex items-center justify-between">
              <div>
                <p class="text-lg font-bold text-orange-600">
                  ${{ Number(product.price).toLocaleString() }}
                </p>
                <p class="text-xs text-gray-500">
                  Stock: {{ product.quantityInStock ?? 'N/A' }}
                </p>
              </div>

              <router-link
                :to="`/products/${product.productId}`"
                class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black"
              >
                View
              </router-link>
            </div>
          </article>
        </div>
      </section>

      <!-- Default homepage sections -->
      <template v-else>
        <section class="mb-10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">Popular Products</h2>
            <span class="text-sm text-gray-500">{{ popularProducts.length }} products</span>
          </div>

          <div class="flex gap-4 overflow-x-auto pb-2">
            <article
              v-for="product in popularProducts"
              :key="product.productId"
              class="min-w-[260px] max-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex-shrink-0"
            >
              <div class="aspect-[4/3] rounded-xl bg-gray-100 mb-4 overflow-hidden">
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="`${product.name} ${product.model}`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                >
                  No Image
                </div>
              </div>

              <p class="text-xs text-orange-600 font-semibold mb-1 capitalize">
                {{ getCategoryLabel(product.categoryId) }}
              </p>

              <h3 class="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
                {{ product.name }}
              </h3>

              <p class="text-sm text-gray-500 mt-1">{{ product.model }}</p>

              <p class="text-sm text-gray-600 mt-3 line-clamp-2 min-h-[40px]">
                {{ product.description }}
              </p>

              <div class="mt-4 flex items-center justify-between">
                <div>
                  <p class="text-lg font-bold text-orange-600">
                    ${{ Number(product.price).toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Stock: {{ product.quantityInStock ?? 'N/A' }}
                  </p>
                </div>

                <router-link
                  :to="`/products/${product.productId}`"
                  class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black"
                >
                  View
                </router-link>
              </div>
            </article>
          </div>
        </section>

        <!-- Banner -->
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

        <section class="mb-10" v-if="laptopProducts.length">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">Laptops</h2>
            <span class="text-sm text-gray-500">{{ laptopProducts.length }} products</span>
          </div>

          <div class="flex gap-4 overflow-x-auto pb-2">
            <article
              v-for="product in laptopProducts"
              :key="product.productId"
              class="min-w-[260px] max-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex-shrink-0"
            >
              <div class="aspect-[4/3] rounded-xl bg-gray-100 mb-4 overflow-hidden">
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="`${product.name} ${product.model}`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                >
                  No Image
                </div>
              </div>

              <p class="text-xs text-orange-600 font-semibold mb-1 capitalize">
                {{ getCategoryLabel(product.categoryId) }}
              </p>

              <h3 class="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
                {{ product.name }}
              </h3>

              <p class="text-sm text-gray-500 mt-1">{{ product.model }}</p>

              <p class="text-sm text-gray-600 mt-3 line-clamp-2 min-h-[40px]">
                {{ product.description }}
              </p>

              <div class="mt-4 flex items-center justify-between">
                <div>
                  <p class="text-lg font-bold text-orange-600">
                    ${{ Number(product.price).toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Stock: {{ product.quantityInStock ?? 'N/A' }}
                  </p>
                </div>

                <router-link
                  :to="`/products/${product.productId}`"
                  class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black"
                >
                  View
                </router-link>
              </div>
            </article>
          </div>
        </section>

        <section class="mb-10" v-if="audioProducts.length">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">Audio Picks</h2>
            <span class="text-sm text-gray-500">{{ audioProducts.length }} products</span>
          </div>

          <div class="flex gap-4 overflow-x-auto pb-2">
            <article
              v-for="product in audioProducts"
              :key="product.productId"
              class="min-w-[260px] max-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex-shrink-0"
            >
              <div class="aspect-[4/3] rounded-xl bg-gray-100 mb-4 overflow-hidden">
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="`${product.name} ${product.model}`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                >
                  No Image
                </div>
              </div>

              <p class="text-xs text-orange-600 font-semibold mb-1 capitalize">
                {{ getCategoryLabel(product.categoryId) }}
              </p>

              <h3 class="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
                {{ product.name }}
              </h3>

              <p class="text-sm text-gray-500 mt-1">{{ product.model }}</p>

              <p class="text-sm text-gray-600 mt-3 line-clamp-2 min-h-[40px]">
                {{ product.description }}
              </p>

              <div class="mt-4 flex items-center justify-between">
                <div>
                  <p class="text-lg font-bold text-orange-600">
                    ${{ Number(product.price).toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Stock: {{ product.quantityInStock ?? 'N/A' }}
                  </p>
                </div>

                <router-link
                  :to="`/products/${product.productId}`"
                  class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black"
                >
                  View
                </router-link>
              </div>
            </article>
          </div>
        </section>

        <section class="mb-10" v-if="gamingProducts.length">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">Gaming</h2>
            <span class="text-sm text-gray-500">{{ gamingProducts.length }} products</span>
          </div>

          <div class="flex gap-4 overflow-x-auto pb-2">
            <article
              v-for="product in gamingProducts"
              :key="product.productId"
              class="min-w-[260px] max-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex-shrink-0"
            >
              <div class="aspect-[4/3] rounded-xl bg-gray-100 mb-4 overflow-hidden">
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="`${product.name} ${product.model}`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                >
                  No Image
                </div>
              </div>

              <p class="text-xs text-orange-600 font-semibold mb-1 capitalize">
                {{ getCategoryLabel(product.categoryId) }}
              </p>

              <h3 class="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
                {{ product.name }}
              </h3>

              <p class="text-sm text-gray-500 mt-1">{{ product.model }}</p>

              <p class="text-sm text-gray-600 mt-3 line-clamp-2 min-h-[40px]">
                {{ product.description }}
              </p>

              <div class="mt-4 flex items-center justify-between">
                <div>
                  <p class="text-lg font-bold text-orange-600">
                    ${{ Number(product.price).toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Stock: {{ product.quantityInStock ?? 'N/A' }}
                  </p>
                </div>

                <router-link
                  :to="`/products/${product.productId}`"
                  class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black"
                >
                  View
                </router-link>
              </div>
            </article>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '../api/productApi'
import { categories } from '../data/categories'

const products = ref([])
const loading = ref(true)
const error = ref('')
const selectedCategory = ref('')

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
  products.value.filter(product => {
    const text = `${product.name} ${product.model}`.toLowerCase()
    return (
      text.includes('macbook') ||
      text.includes('xps') ||
      text.includes('thinkpad') ||
      text.includes('spectre') ||
      text.includes('zephyrus')
    )
  })
)

const audioProducts = computed(() =>
  products.value.filter(product => {
    const text = `${product.name} ${product.model}`.toLowerCase()
    return (
      text.includes('wh-1000') ||
      text.includes('airpods') ||
      text.includes('quietcomfort') ||
      text.includes('charge 5') ||
      text.includes('buds')
    )
  })
)

const gamingProducts = computed(() =>
  products.value.filter(product => {
    const text = `${product.name} ${product.model}`.toLowerCase()
    return (
      text.includes('playstation') ||
      text.includes('xbox') ||
      text.includes('switch') ||
      text.includes('steam deck') ||
      text.includes('rog ally')
    )
  })
)

const getCategoryLabel = (categoryId) => {
  return categoryMap.value[categoryId] || categoryId
}

onMounted(async () => {
  try {
    const res = await getProducts()
    products.value = res.data ?? []
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>