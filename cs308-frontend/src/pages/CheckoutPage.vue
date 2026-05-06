<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Checkout</h1>
        <p class="text-slate-500 mt-1">
          Review your items and place your order.
        </p>
      </div>
      <router-link to="/cart" class="text-blue-600 hover:underline">
        Back to Cart
      </router-link>
    </div>

    <div v-if="loading" class="text-slate-600">Loading checkout...</div>

    <div v-else-if="pageError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      {{ pageError }}
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div class="space-y-4">
        <div
          v-for="item in cart.items"
          :key="item.productId"
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 class="text-xl font-semibold text-slate-900">{{ item.name }}</h2>
          <p class="mt-1 text-slate-500">Product ID: {{ item.productId }}</p>
          <div class="mt-3">
            <p class="text-lg font-semibold text-green-700">
              ${{ item.unitPrice.toLocaleString() }}
            </p>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Quantity: {{ item.quantity }}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            Subtotal: ${{ (item.unitPrice * item.quantity).toLocaleString() }}
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

        <button
          class="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          :disabled="submitting"
          @click="handlePlaceOrder"
        >
          {{ submitting ? 'Placing Order...' : 'Place Order' }}
        </button>

        <p v-if="actionMessage" class="mt-4 text-sm text-green-700">
          {{ actionMessage }}
        </p>

        <p v-if="actionError" class="mt-4 text-sm text-red-600">
          {{ actionError }}
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createOrder, getCheckoutCart, validateCheckout } from '../api/checkoutApi'

const router = useRouter()

const cart = ref({
  cartId: '',
  items: [],
  totalItems: 0,
  totalPrice: 0,
})

const loading = ref(true)
const submitting = ref(false)
const pageError = ref('')
const actionError = ref('')
const actionMessage = ref('')

const setCartState = (data) => {
  cart.value = {
    cartId: data.cartId,
    items: data.items ?? [],
    totalItems: data.totalItems ?? 0,
    totalPrice: data.totalPrice ?? 0,
  }
}

const loadCheckout = async () => {
  loading.value = true
  pageError.value = ''

  try {
    const res = await getCheckoutCart()
    setCartState(res.data)
  } catch (err) {
    pageError.value = err?.response?.data?.message || 'Failed to load checkout'
  } finally {
    loading.value = false
  }
}

const handlePlaceOrder = async () => {
  submitting.value = true
  actionError.value = ''
  actionMessage.value = ''

  try {
    await validateCheckout()
    const res = await createOrder()
    const orderId = res.data.order.id
    router.push(`/payment/${orderId}`)
  } catch (err) {
    actionError.value = err?.response?.data?.message || 'Failed to place order'
  } finally {
    submitting.value = false
  }
}

onMounted(loadCheckout)
</script>