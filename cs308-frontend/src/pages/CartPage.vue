<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Your Cart</h1>
        <p class="text-slate-500 mt-1">Review items, adjust quantities, and check your total.</p>
      </div>
      <router-link to="/products" class="text-blue-600 hover:underline">
        Continue Shopping
      </router-link>
    </div>

    <div v-if="loading" class="text-slate-600">Loading cart...</div>
    <div v-else-if="pageNotice" class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
      {{ pageNotice }}
    </div>
    <div v-else-if="pageError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      {{ pageError }}
    </div>
    <div
      v-if="!loading && !pageError && cart.items.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"
    >
      <h2 class="text-2xl font-semibold text-slate-800">Your cart is empty</h2>
      <p class="mt-2 text-slate-500">Add products from the catalog to see them here.</p>
      <router-link
        to="/products"
        class="inline-flex mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
      >
        Browse Products
      </router-link>
    </div>
    <div v-if="!loading && !pageError && cart.items.length > 0" class="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div class="space-y-4">
        <div
          v-for="item in cart.items"
          :key="item.productId"
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex gap-4">
              <div class="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  No image
                </div>
              </div>

              <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ item.name }}</h2>
              <p class="mt-3 text-lg font-semibold text-green-700">
                ${{ item.unitPrice.toLocaleString() }}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                Subtotal: ${{ (item.unitPrice * item.quantity).toLocaleString() }}
              </p>
              </div>
            </div>

            <div class="sm:text-right">
              <div class="inline-flex items-center rounded-lg border border-slate-300">
                <button
                  class="px-3 py-2 text-lg text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                  :disabled="isUpdating(item.productId) || item.quantity <= 1"
                  @click="changeQuantity(item, item.quantity - 1)"
                >
                  -
                </button>
                <span class="min-w-12 px-4 py-2 text-center font-medium text-slate-900">
                  {{ item.quantity }}
                </span>
                <button
                  class="px-3 py-2 text-lg text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                  :disabled="isUpdating(item.productId)"
                  @click="changeQuantity(item, item.quantity + 1)"
                >
                  +
                </button>
              </div>

              <button
                class="block mt-3 text-sm font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-red-300"
                :disabled="isUpdating(item.productId)"
                @click="handleRemoveItem(item.productId)"
              >
                Remove item
              </button>
            </div>
          </div>

          <p v-if="itemErrors[item.productId]" class="mt-3 text-sm text-red-600">
            {{ itemErrors[item.productId] }}
          </p>
        </div>
      </div>

      <aside class="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-900">Order Summary</h2>
        <div class="mt-4 flex items-center justify-between text-slate-600">
          <span>Total Items</span>
          <span class="font-medium text-slate-900">{{ cart.totalItems }}</span>
        </div>
        <div class="mt-3 flex items-center justify-between text-lg">
          <span class="font-medium text-slate-700">Total Price</span>
          <span class="font-bold text-slate-900">${{ cart.totalPrice.toLocaleString() }}</span>
        </div>
        <router-link
          to="/checkout"
          class="mt-6 block w-full rounded-lg bg-slate-900 px-4 py-3 text-center text-white hover:bg-slate-800"
        >
          Proceed to Checkout
        </router-link>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getCart, removeCartItem, updateCartItemQuantity } from '../api/cartApi'
import { cartStore } from '../store/cart'

const CART_MERGE_ERROR_KEY = 'cart-merge-error'

const cart = ref({
  cartId: '',
  items: [],
  totalItems: 0,
  totalPrice: 0,
})
const loading = ref(true)
const pageError = ref('')
const pageNotice = ref('')
const itemErrors = ref({})
const pendingItems = ref({})

const setCartState = (nextCart) => {
  cart.value = {
    cartId: nextCart.cartId,
    items: nextCart.items ?? [],
    totalItems: nextCart.totalItems ?? 0,
    totalPrice: nextCart.totalPrice ?? 0,
  }
  cartStore.setTotalItems(cart.value.totalItems)
}

const loadCart = async () => {
  loading.value = true
  pageError.value = ''
  pageNotice.value = localStorage.getItem(CART_MERGE_ERROR_KEY) || ''
  localStorage.removeItem(CART_MERGE_ERROR_KEY)

  try {
    const res = await getCart()
    setCartState(res.data)
  } catch (err) {
    pageError.value = 'Failed to load cart'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const isUpdating = (productId) => Boolean(pendingItems.value[productId])

const setPending = (productId, value) => {
  pendingItems.value = {
    ...pendingItems.value,
    [productId]: value,
  }
}

const setItemError = (productId, message = '') => {
  itemErrors.value = {
    ...itemErrors.value,
    [productId]: message,
  }
}

const changeQuantity = async (item, nextQuantity) => {
  setPending(item.productId, true)
  setItemError(item.productId)

  try {
    const res = await updateCartItemQuantity(item.productId, nextQuantity)
    setCartState(res.data)
  } catch (err) {
    setItemError(
      item.productId,
      err?.response?.data?.message || 'Failed to update quantity'
    )
  } finally {
    setPending(item.productId, false)
  }
}

const handleRemoveItem = async (productId) => {
  setPending(productId, true)
  setItemError(productId)

  try {
    const res = await removeCartItem(productId)
    setCartState(res.data)
  } catch (err) {
    setItemError(productId, err?.response?.data?.message || 'Failed to remove item')
  } finally {
    setPending(productId, false)
  }
}

onMounted(loadCart)
</script>
