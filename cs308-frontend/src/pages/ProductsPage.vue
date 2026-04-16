<template>
  <div class="bg-stone-50">
    <section class="relative overflow-hidden bg-stone-950">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_28%),linear-gradient(120deg,rgba(12,10,9,0.72),rgba(12,10,9,0.1)_55%)]" />
      <div class="relative mx-auto grid min-h-[38rem] max-w-7xl items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div class="max-w-xl">
          <p class="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-orange-300">
            CS308 Store
          </p>
          <h1 class="mb-5 text-4xl font-bold leading-tight text-white md:text-6xl">
            Tech essentials curated for people who want fast, reliable upgrades.
          </h1>
          <p class="mb-8 max-w-lg text-base leading-7 text-stone-200 md:text-lg">
            Shop premium devices, gaming gear, and audio picks with a cleaner storefront and
            clearer path to what matters most.
          </p>
          <button
            type="button"
            class="inline-flex items-center rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            @click="scrollToProducts"
          >
            Shop now
          </button>
        </div>

        <div
          ref="heroPanelRef"
          class="group relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#111827,#0f172a_48%,#172554)] shadow-2xl transition duration-150 md:min-h-[30rem]"
          :style="heroPanelStyle"
          @mousemove="updateHeroGlow"
          @mouseleave="resetHeroGlow"
        >
          <div class="absolute -inset-6 rounded-[2.5rem] bg-orange-500/20 blur-3xl" />
          <div class="absolute -left-20 top-8 h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
          <div class="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-500/14 blur-3xl" />
          <div
            class="pointer-events-none absolute inset-0 transition duration-200"
            :style="heroGlowStyle"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-orange-500/16 via-transparent to-cyan-300/10" />
          <div class="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
            <div class="flex items-start justify-between gap-4">
              <div class="max-w-sm">
                <p class="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
                  Interactive picks
                </p>
                <h2 class="text-2xl font-bold text-white md:text-4xl">
                  Built around the brands people actually search for.
                </h2>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div
                v-for="logo in heroLogos"
                :key="logo.name"
                class="rounded-[1.5rem] border border-white/10 bg-black/20 p-0 backdrop-blur-sm transition duration-300 group-hover:-translate-y-1"
              >
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-4 rounded-[1.5rem] p-5 text-left transition hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-orange-400/70"
                  @click="applyBrandFilter(logo.brand)"
                >
                  <div>
                    <p class="text-xs uppercase tracking-[0.35em] text-slate-400">{{ logo.category }}</p>
                    <div class="mt-3 flex items-center gap-3">
                      <span class="text-2xl font-semibold tracking-[0.2em] text-white md:text-3xl">
                        {{ logo.name }}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-stone-200 bg-white">
      <div class="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <article
          v-for="item in trustItems"
          :key="item.title"
          class="flex items-center gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"
            v-html="item.icon"
          />
          <div>
            <h2 class="text-sm font-semibold text-stone-900">{{ item.title }}</h2>
            <p class="text-sm text-stone-600">{{ item.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <div id="products-section" class="max-w-7xl mx-auto px-4 py-6 md:px-6">
      <div v-if="activeBrand" class="mb-4 flex flex-wrap items-center gap-3 px-2">
        <p class="text-sm text-gray-700">
          Brand filter:
          <span class="font-semibold uppercase tracking-[0.2em] text-orange-600">{{ activeBrand }}</span>
        </p>
        <button @click="clearBrandFilter" class="text-sm text-orange-600 hover:underline">
          Show all brands
        </button>
      </div>

      <div v-if="isSearching" class="flex items-center gap-3 flex-wrap mb-4 px-2">
        <p class="text-sm text-gray-700">
          Showing results for:
          <span class="font-semibold text-orange-600">"{{ activeSearch }}"</span>
        </p>
        <button @click="clearSearch" class="text-sm text-orange-600 hover:underline">
          Back to all products
        </button>
      </div>

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
              :title="activeBrand ? `${activeBrand} Products` : 'Popular Products'"
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

    <HeroSection class="mt-8" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductSection from '../components/ProductsSection.vue'
import HeroSection from '../components/HeroSection.vue'
import { getProducts } from '../api/productApi'
import { categories } from '../data/categories'

const route = useRoute()
const router = useRouter()

const products = ref([])
const loading = ref(true)
const error = ref('')
const selectedCategory = ref('')
const heroPanelRef = ref(null)
const heroGlow = ref({
  x: 50,
  y: 50,
  opacity: 0,
  rotateX: 0,
  rotateY: 0
})

const heroLogos = [
  { name: 'APPLE', brand: 'Apple', category: 'Mobile' },
  { name: 'SAMSUNG', brand: 'Samsung', category: 'Displays' },
  { name: 'SONY', brand: 'Sony', category: 'Audio' },
  { name: 'ASUS', brand: 'ASUS', category: 'Gaming' }
]

const trustItems = [
  {
    title: 'Fast shipping',
    description: 'Quick dispatch on the products you need most.',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5h11.25v8.25H3zM14.25 10.5h3.129a1.5 1.5 0 011.2.6l1.671 2.228V15.75h-6M7.5 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10.5 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
      </svg>
    `
  },
  {
    title: 'Secure checkout',
    description: 'Protected payments and trusted order handling.',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M6 10.5h12v9H6z" />
      </svg>
    `
  },
  {
    title: 'Responsive support',
    description: 'Get help fast when orders or accounts need attention.',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75A3.375 3.375 0 1112 13.125M12 16.5h.008v.008H12V16.5zm8.25-4.5A8.25 8.25 0 113.75 12a8.25 8.25 0 0116.5 0z" />
      </svg>
    `
  },
  {
    title: 'Quality picks',
    description: 'Selected products across audio, gaming, and laptops.',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m6 2.25A9 9 0 1112 3a9 9 0 019 9z" />
      </svg>
    `
  }
]

const activeSearch = computed(() =>
  typeof route.query.search === 'string' ? route.query.search.trim() : ''
)

const activeBrand = computed(() =>
  typeof route.query.brand === 'string' ? route.query.brand.trim() : ''
)

const isSearching = computed(() => activeSearch.value.length > 0)

const categoryMap = computed(() => {
  return Object.fromEntries(categories.map(cat => [cat.categoryId, cat.name]))
})

const uniqueCategories = computed(() => {
  const ids = new Set(products.value.map(product => product.categoryId))
  return Array.from(ids).filter(Boolean)
})

const brandFilteredProducts = computed(() => {
  if (!activeBrand.value) return products.value
  return products.value.filter(product => product.name?.toLowerCase() === activeBrand.value.toLowerCase())
})

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return brandFilteredProducts.value
  return brandFilteredProducts.value.filter(product => product.categoryId === selectedCategory.value)
})

const popularProducts = computed(() =>
  [...brandFilteredProducts.value]
    .sort((left, right) => {
      if ((right.popularity ?? 0) !== (left.popularity ?? 0)) {
        return (right.popularity ?? 0) - (left.popularity ?? 0)
      }

      return new Date(right.createdAt ?? 0) - new Date(left.createdAt ?? 0)
    })
    .slice(0, 8)
)

const laptopProducts = computed(() =>
  brandFilteredProducts.value.filter(product => product.categoryId === 'laptops')
)

const audioProducts = computed(() =>
  brandFilteredProducts.value.filter(product => product.categoryId === 'audio')
)

const gamingProducts = computed(() =>
  brandFilteredProducts.value.filter(product => product.categoryId === 'gaming')
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
  router.push({
    path: '/',
    query: activeBrand.value ? { brand: activeBrand.value } : {}
  })
}

const applyBrandFilter = (brand) => {
  selectedCategory.value = ''
  router.push({
    path: '/',
    query: {
      ...(activeSearch.value ? { search: activeSearch.value } : {}),
      brand
    }
  })

  scrollToProducts()
}

const clearBrandFilter = () => {
  selectedCategory.value = ''
  router.push({
    path: '/',
    query: activeSearch.value ? { search: activeSearch.value } : {}
  })
}

const updateHeroGlow = (event) => {
  const bounds = heroPanelRef.value?.getBoundingClientRect()
  if (!bounds) return

  heroGlow.value = {
    x: ((event.clientX - bounds.left) / bounds.width) * 100,
    y: ((event.clientY - bounds.top) / bounds.height) * 100,
    opacity: 1,
    rotateX: ((0.5 - (event.clientY - bounds.top) / bounds.height) * 4.5),
    rotateY: ((((event.clientX - bounds.left) / bounds.width) - 0.5) * 6)
  }
}

const resetHeroGlow = () => {
  heroGlow.value = {
    x: 50,
    y: 50,
    opacity: 0,
    rotateX: 0,
    rotateY: 0
  }
}

const heroPanelStyle = computed(() => ({
  transform: `perspective(1400px) rotateX(${heroGlow.value.rotateX}deg) rotateY(${heroGlow.value.rotateY}deg)`,
  boxShadow: `0 24px 64px rgba(15, 23, 42, 0.36), 0 0 34px rgba(251, 146, 60, ${0.05 + heroGlow.value.opacity * 0.08})`
}))

const heroGlowStyle = computed(() => ({
  background: `
    radial-gradient(circle at ${heroGlow.value.x}% ${heroGlow.value.y}%,
    rgba(251, 146, 60, ${0.34 * heroGlow.value.opacity}) 0%,
    rgba(56, 189, 248, ${0.18 * heroGlow.value.opacity}) 12%,
    rgba(168, 85, 247, ${0.08 * heroGlow.value.opacity}) 22%,
    rgba(15, 23, 42, 0) 34%)
  `
}))

const scrollToProducts = () => {
  document.getElementById('products-section')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
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
