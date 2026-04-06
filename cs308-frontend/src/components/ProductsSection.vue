<template>
  <section class="mb-10" v-if="products && products.length">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
      <span class="text-sm text-gray-500">{{ products.length }} products</span>
    </div>

    <div class="flex gap-4 overflow-x-auto pb-2">
      <router-link
        v-for="product in products"
        :key="product.productId"
        :to="`/products/${product.productId}`"
        class="block min-w-[260px] max-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex-shrink-0 cursor-pointer"
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

        <div class="mt-4">
          <p class="text-lg font-bold text-orange-600">
            ${{ Number(product.price).toLocaleString() }}
          </p>
          <p class="text-xs text-gray-500">
            Stock: {{ product.quantityInStock ?? 'N/A' }}
          </p>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  getCategoryLabel: {
    type: Function,
    required: true
  }
})
</script>