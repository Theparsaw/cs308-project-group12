<template>
  <div class="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_48%,#fff7ed_100%)]">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

      <h1 class="text-2xl font-bold mb-6 text-center">Create Account</h1>

      <!-- Show error message if registration fails -->
      <p v-if="error" class="text-red-500 text-sm mb-4 text-center">{{ error }}</p>

      <form @submit.prevent="handleRegister">

        <!-- Name field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Enter your full name"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Email field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Password field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Confirm password field -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>

      </form>

      <!-- Link to login page -->
      <p class="mt-4 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/login" class="text-blue-600 hover:underline">Login</router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../api/authApi'
import { activateUserCartId, getCart, getGuestCart, mergeGuestCartIntoUserCart } from '../api/cartApi'
import { authStore } from '../store/auth'
import { cartStore } from '../store/cart'

const CART_MERGE_ERROR_KEY = 'cart-merge-error'

// Router lets us redirect the user after registration
const router = useRouter()

// Form fields
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// State for loading and error
const loading = ref(false)
const error = ref('')

const syncCartTotalItems = async () => {
  try {
    const cartRes = await getCart()
    cartStore.setTotalItems(cartRes.data?.totalItems)
  } catch {
    cartStore.clear()
  }
}

const hasGuestCartItems = async () => {
  const guestCartRes = await getGuestCart()
  return Number(guestCartRes.data?.totalItems || 0) > 0
}

const handleRegister = async () => {
  // Clear any previous error
  error.value = ''

  // Frontend validation — check passwords match before sending to backend
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  // Frontend validation — password must be at least 6 characters
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true

  try {
    const shouldOpenCartAfterRegister = await hasGuestCartItems()

    // Send name, email, password to the backend
    const res = await registerUser({
      name: name.value,
      email: email.value,
      password: password.value,
    })

    // Save the token and user info in the auth store
    authStore.setAuth(res.data.token, res.data.user)
    activateUserCartId()

    try {
      await mergeGuestCartIntoUserCart()
      await syncCartTotalItems()
    } catch (mergeError) {
      const message =
        mergeError?.response?.data?.message || 'Account created, but some cart items could not be restored.'

      localStorage.setItem(CART_MERGE_ERROR_KEY, message)
      await syncCartTotalItems()

      router.push('/cart')
      return
    }

    router.push(shouldOpenCartAfterRegister ? '/cart' : '/')

  } catch (err) {
    // Show the error message from the backend
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
