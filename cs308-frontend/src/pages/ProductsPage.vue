<template>
  <div class="bg-stone-50">
    <section v-if="!isSearching" class="relative overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#f5f5f4_36%,#1c1917_36%,#0c0a09_100%)]">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.24),transparent_24%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_22%)]" />
      <div class="relative mx-auto max-w-7xl px-4 py-10 md:px-6 lg:py-14">
        <div
          ref="heroPanelRef"
          class="group relative min-h-[38rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#292524_0%,#1c1917_42%,#7c2d12_100%)] shadow-2xl transition duration-150 md:min-h-[42rem]"
          :style="heroPanelStyle"
          @mousemove="updateHeroGlow"
          @mouseleave="resetHeroGlow"
        >
          <div class="absolute -inset-6 rounded-[2.5rem] bg-orange-500/18 blur-3xl" />
          <div class="absolute -left-16 top-10 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
          <div class="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-orange-500/16 blur-3xl" />
          <div class="absolute left-1/3 top-1/4 h-80 w-80 rounded-full bg-stone-100/6 blur-3xl" />
          <div
            class="pointer-events-none absolute inset-0 transition duration-200"
            :style="heroGlowStyle"
          />
          <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(251,146,60,0.16),transparent_34%,rgba(255,255,255,0.05)_60%,rgba(251,146,60,0.12)_100%)]" />
          <div class="relative z-10 flex min-h-[38rem] flex-col justify-between p-8 md:min-h-[42rem] md:p-10 lg:p-12">
            <div class="max-w-2xl">
              <p class="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-orange-300">
                CS308 Store
              </p>
              <h1 class="mb-5 text-4xl font-bold leading-tight text-white md:text-6xl">
                Tech essentials curated for people who want fast, reliable upgrades.
              </h1>
              <p class="mb-8 max-w-xl text-base leading-7 text-stone-200 md:text-lg">
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

            <div class="grid gap-4 md:grid-cols-3">
              <div class="rounded-[1.5rem] border border-white/10 bg-black/16 p-5 backdrop-blur-sm">
                <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Curated tech</p>
                <p class="mt-3 text-lg font-semibold text-white">Premium hardware across your daily setup.</p>
              </div>
              <div class="rounded-[1.5rem] border border-white/10 bg-black/16 p-5 backdrop-blur-sm">
                <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Interactive surface</p>
                <p class="mt-3 text-lg font-semibold text-white">The entire hero now responds to cursor movement.</p>
              </div>
              <div class="rounded-[1.5rem] border border-white/10 bg-black/16 p-5 backdrop-blur-sm">
                <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Faster entry</p>
                <p class="mt-3 text-lg font-semibold text-white">Users land directly into shopping without extra blocks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!isSearching" class="border-b border-stone-200 bg-white">
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
      <div v-if="isSearching || activeSort" class="flex items-center gap-3 flex-wrap mb-4 px-2">
        <p v-if="isSearching" class="text-sm text-gray-700">
          Showing results for:
          <span class="font-semibold text-orange-600">"{{ activeSearch }}"</span>
        </p>
        <p v-if="activeSort" class="text-sm text-gray-500">
          Sorted by:
          <span class="font-semibold text-gray-700">
            {{ sortOptions.find(o => o.value === activeSort)?.label }}
          </span>
        </p>
        <button
          v-if="isSearching || activeSort"
          @click="clearSearch"
          class="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors hover:underline"
        >
          &larr; Go back
        </button>
      </div>

      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Categories</h2>
          <button
            v-if="selectedCategories.length > 0"
            @click="selectedCategories = []"
            class="text-sm text-orange-600 hover:underline"
          >
            Clear filters
          </button>
        </div>

        <div class="flex gap-3 overflow-x-auto pb-2">
          <button
            @click="toggleCategory('')"
            :class="[
              'px-4 py-2 rounded-full border whitespace-nowrap transition',
              selectedCategories.length === 0
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
            ]"
          >
            All
          </button>

          <button
            v-for="categoryId in uniqueCategories"
            :key="categoryId"
            @click="toggleCategory(categoryId)"
            :class="[
              'px-4 py-2 rounded-full border whitespace-nowrap transition capitalize',
              selectedCategories.includes(categoryId)
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

        <template v-else-if="isSearching">
          <ProductSection
            :title="selectedCategories.length > 0 ? 'Filtered Search Results' : 'Search Results'"
            :products="filteredProducts"
            :getCategoryLabel="getCategoryLabel"
          />
        </template>

        <template v-else>
          <ProductSection
            v-if="selectedCategories.length > 0"
            :title="selectedCategories.length === 1 ? getCategoryLabel(selectedCategories[0]) : 'Selected Categories'"
            :products="filteredProducts"
            :getCategoryLabel="getCategoryLabel"
          />

          <template v-else>
            <ProductSection
              title="Popular Products"
              :products="popularProducts"
              :getCategoryLabel="getCategoryLabel"
            />
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

    <HeroSection  class="mt-8" />
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
const selectedCategories = ref([])
const heroPanelRef = ref(null)
const heroGlow = ref({
  x: 50,
  y: 50,
  opacity: 0,
  rotateX: 0,
  rotateY: 0
})

const toggleCategory = (categoryId) => {
  if (!categoryId) {
    // If "All" is clicked, clear the array
    selectedCategories.value = []
    return
  }
  
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryId)
  }
}

const sortOptions = [
  { value: '',           label: 'Recommended' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'newest',     label: 'Newest' },
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

const isSearching = computed(() => activeSearch.value.length > 0)

const activeSort = computed(() =>
  typeof route.query.sort === 'string' ? route.query.sort : ''
)

const categoryMap = computed(() => {
  return Object.fromEntries(categories.map(cat => [cat.categoryId, cat.name]))
})

const uniqueCategories = computed(() => {
  const ids = new Set(products.value.map(product => product.categoryId))
  const activeCategories = Array.from(ids).filter(Boolean)
  
  return activeCategories.sort((a, b) => {
    const labelA = getCategoryLabel(a) || ''
    const labelB = getCategoryLabel(b) || ''
    
    return labelA.localeCompare(labelB)
  })
})

const filteredProducts = computed(() => {
  if (selectedCategories.value.length === 0) return products.value
  return products.value.filter(product => selectedCategories.value.includes(product.categoryId))
})

const popularProducts = computed(() =>
  [...products.value]
    .sort((left, right) => {
      if ((right.popularity ?? 0) !== (left.popularity ?? 0)) {
        return (right.popularity ?? 0) - (left.popularity ?? 0)
      }
      return new Date(right.createdAt ?? 0) - new Date(left.createdAt ?? 0)
    })
    .slice(0, 8)
)

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
  const label = categoryMap.value[categoryId] || categoryId;
  if (!label) return '';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const loadProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getProducts(activeSearch.value, activeSort.value)
    products.value = res.data ?? []
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  selectedCategories.value = []
  router.push({ path: '/', query: {} })
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
  boxShadow: `0 28px 80px rgba(28, 25, 23, 0.34), 0 0 54px rgba(251, 146, 60, ${0.08 + heroGlow.value.opacity * 0.1})`
}))

const heroGlowStyle = computed(() => ({
  background: `
    radial-gradient(circle at ${heroGlow.value.x}% ${heroGlow.value.y}%,
    rgba(251, 146, 60, ${0.3 * heroGlow.value.opacity}) 0%,
    rgba(253, 186, 116, ${0.2 * heroGlow.value.opacity}) 16%,
    rgba(255, 237, 213, ${0.1 * heroGlow.value.opacity}) 30%,
    rgba(28, 25, 23, 0) 48%)
  `
}))

const scrollToProducts = () => {
  document.getElementById('products-section')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

watch(
  () => [route.query.search, route.query.sort],
  () => {
    loadProducts()
  },
  { immediate: true }
)
</script>