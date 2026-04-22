<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="mx-auto max-w-5xl px-4">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">My Profile</h1>
          <p class="mt-2 text-sm text-gray-500">
            Manage your account details and track current deliveries.
          </p>
        </div>

        <button
          v-if="activeTab === 'profile' && !loading && !error && !isEditing"
          type="button"
          class="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          @click="startEditing"
        >
          Edit Profile
        </button>
      </div>

      <div class="mb-8 flex flex-wrap gap-3">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="rounded-full border px-4 py-2 text-sm font-semibold transition"
          :class="
            activeTab === tab.id
              ? 'border-orange-500 bg-orange-500 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
          "
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'profile'">
        <div v-if="loading" class="py-20 text-center text-gray-500">
          Loading your profile...
        </div>

        <div v-else-if="error" class="py-20 text-center text-red-500">
          {{ error }}
        </div>

        <div v-else class="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div class="mb-8 flex items-center gap-5 border-b border-gray-100 pb-8">
            <img
              v-if="displayProfileImage"
              :src="getProfileImageUrl(displayProfileImage)"
              alt="Profile photo"
              class="h-20 w-20 shrink-0 rounded-full border-2 border-orange-200 object-cover"
            />

            <div
              v-else
              class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-500 text-3xl font-bold text-white"
            >
              {{ user.name?.charAt(0).toUpperCase() }}
            </div>

            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ user.name }}</h2>
              <span
                class="mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium"
                :class="{
                  'bg-blue-100 text-blue-700': user.role === 'customer',
                  'bg-green-100 text-green-700': user.role === 'sales_manager',
                  'bg-purple-100 text-purple-700': user.role === 'product_manager',
                }"
              >
                {{ formatRole(user.role) }}
              </span>
            </div>
          </div>

          <div
            v-if="formMessage"
            class="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {{ formMessage }}
          </div>
          <div
            v-if="formError"
            class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ formError }}
          </div>

          <div v-if="!isEditing" class="space-y-5">
            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium uppercase tracking-wide text-gray-400">Email</span>
              <span class="font-medium text-gray-800">{{ user.email }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium uppercase tracking-wide text-gray-400">Tax ID</span>
              <span class="font-medium text-gray-800">{{ user.taxId || 'Not provided' }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium uppercase tracking-wide text-gray-400">Address</span>
              <span class="font-medium text-gray-800">{{ user.address || 'Not provided' }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium uppercase tracking-wide text-gray-400">Member Since</span>
              <span class="font-medium text-gray-800">{{ formatDate(user.createdAt) }}</span>
            </div>
          </div>

          <form v-else class="space-y-5" @submit.prevent="saveProfile">
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handlePhotoSelected"
            />

            <div class="flex flex-col gap-3">
              <span class="text-sm font-medium uppercase tracking-wide text-gray-400">Profile Photo</span>
              <div class="flex flex-wrap items-center gap-4">
                <img
                  v-if="displayProfileImage"
                  :src="getProfileImageUrl(displayProfileImage)"
                  alt="Selected profile photo preview"
                  class="h-20 w-20 rounded-full border-2 border-orange-200 object-cover"
                />
                <div
                  v-else
                  class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-500 text-3xl font-bold text-white"
                >
                  {{ form.name?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() }}
                </div>

                <div class="flex flex-wrap gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    @click="openPhotoPicker"
                  >
                    Choose Photo
                  </button>
                  <button
                    v-if="displayProfileImage"
                    type="button"
                    class="inline-flex items-center rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    @click="removePhoto"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-500">Use a small image file like JPG or PNG for best results.</p>
              <p v-if="photoError" class="text-sm text-red-600">{{ photoError }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium uppercase tracking-wide text-gray-400" for="name">
                Name
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="rounded-xl border px-4 py-3 text-gray-800 outline-none transition"
                :class="
                  fieldErrors.name
                    ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                "
                placeholder="Enter your full name"
                @input="clearFieldError('name')"
              />
              <p v-if="fieldErrors.name" class="text-sm text-red-600">{{ fieldErrors.name }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium uppercase tracking-wide text-gray-400" for="email">
                Email
              </label>
              <input
                id="email"
                :value="user.email"
                type="email"
                disabled
                class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium uppercase tracking-wide text-gray-400" for="taxId">
                Tax ID
              </label>
              <input
                id="taxId"
                v-model="form.taxId"
                type="text"
                class="rounded-xl border px-4 py-3 text-gray-800 outline-none transition"
                :class="
                  fieldErrors.taxId
                    ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                "
                placeholder="Enter your tax ID"
                @input="clearFieldError('taxId')"
              />
              <p v-if="fieldErrors.taxId" class="text-sm text-red-600">{{ fieldErrors.taxId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium uppercase tracking-wide text-gray-400" for="address">
                Address
              </label>
              <textarea
                id="address"
                v-model="form.address"
                rows="4"
                class="rounded-xl border px-4 py-3 text-gray-800 outline-none transition"
                :class="
                  fieldErrors.address
                    ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                "
                placeholder="Enter your home address"
                @input="clearFieldError('address')"
              />
              <p v-if="fieldErrors.address" class="text-sm text-red-600">{{ fieldErrors.address }}</p>
            </div>

            <div class="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                class="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                :disabled="saving"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                :disabled="saving"
                @click="cancelEditing"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Order Tracking</h2>
              <p class="text-sm text-gray-500">
                Review your recent purchases and shipment progress.
              </p>
            </div>
            <span class="text-sm font-medium text-gray-500">
              {{ orders.length }} {{ orders.length === 1 ? 'order' : 'orders' }}
            </span>
          </div>
        </div>

        <div v-if="ordersLoading" class="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading your orders...
        </div>

        <div
          v-else-if="ordersError"
          class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm"
        >
          {{ ordersError }}
        </div>

        <div
          v-else-if="orders.length === 0"
          class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 shadow-sm"
        >
          You have no orders yet.
        </div>

        <div v-else class="space-y-6">
          <article
            v-for="order in orders"
            :key="order.id"
            class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div class="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="text-lg font-semibold text-gray-900">Order #{{ order.id.slice(-8).toUpperCase() }}</h3>
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                    :class="getDeliveryBadgeClass(order.deliveryStatus)"
                  >
                    {{ formatDeliveryStatus(order.deliveryStatus) }}
                  </span>
                </div>
                <p class="mt-2 text-sm text-gray-500">Placed on {{ formatDateTime(order.createdAt) }}</p>
                <p class="mt-1 text-sm text-gray-500">
                  Tracking number: <span class="font-medium text-gray-700">{{ order.trackingNumber }}</span>
                </p>
                <p class="mt-1 text-sm text-gray-500">
                  Estimated delivery: <span class="font-medium text-gray-700">{{ formatDate(order.estimatedDeliveryAt) }}</span>
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <p>
                  Payment state:
                  <span class="font-semibold text-gray-900">{{ formatPaymentStatus(order.status) }}</span>
                </p>
                <p class="mt-1">
                  Total:
                  <span class="font-semibold text-gray-900">${{ Number(order.totalPrice || 0).toLocaleString() }}</span>
                </p>
              </div>
            </div>

            <div class="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section>
                <h4 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Ordered Items</h4>
                <div class="mt-4 space-y-3">
                  <div
                    v-for="item in order.items"
                    :key="`${order.id}-${item.productId}`"
                    class="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4"
                  >
                    <div>
                      <p class="font-semibold text-gray-900">{{ item.name }}</p>
                      <p class="mt-1 text-sm text-gray-500">Product ID: {{ item.productId }}</p>
                    </div>
                    <div class="text-right text-sm text-gray-600">
                      <p>Qty {{ item.quantity }}</p>
                      <p class="mt-1 font-semibold text-gray-900">
                        ${{ Number(item.unitPrice * item.quantity).toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Shipment Timeline</h4>
                <div class="mt-4 space-y-4">
                  <div
                    v-for="step in order.timeline"
                    :key="step.key"
                    class="flex items-start gap-4"
                  >
                    <div class="flex flex-col items-center">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                        :class="getTimelineDotClass(step.state)"
                      >
                        {{ getTimelineMarker(step) }}
                      </div>
                      <div
                        v-if="step.key !== 'delivered'"
                        class="mt-2 h-12 w-px"
                        :class="step.state === 'completed' ? 'bg-orange-300' : 'bg-gray-200'"
                      />
                    </div>
                    <div class="pt-1">
                      <p class="font-semibold text-gray-900">{{ step.label }}</p>
                      <p class="text-sm text-gray-500">{{ formatDate(step.date) }}</p>
                      <p class="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                        {{ formatTimelineState(step.state) }}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProfile, resolveAssetUrl, updateProfile } from '../api/authApi'
import { getMyOrders } from '../api/orderApi'
import { authStore } from '../store/auth'

const route = useRoute()
const router = useRouter()

const tabs = [
  { id: 'profile', label: 'Profile Details' },
  { id: 'orders', label: 'Order Tracking' },
]

const user = ref({})
const loading = ref(true)
const error = ref('')
const isEditing = ref(false)
const saving = ref(false)
const formError = ref('')
const formMessage = ref('')
const photoError = ref('')
const orders = ref([])
const ordersLoading = ref(false)
const ordersError = ref('')
const photoInput = ref(null)
const selectedPhotoFile = ref(null)
const selectedPhotoPreview = ref('')
const shouldRemovePhoto = ref(false)
const fieldErrors = ref({
  name: '',
  taxId: '',
  address: '',
})

const form = ref({
  name: '',
  taxId: '',
  address: '',
  profileImage: '',
})

const activeTab = computed(() => (route.query.tab === 'orders' ? 'orders' : 'profile'))

const displayProfileImage = computed(() => {
  if (isEditing.value && selectedPhotoPreview.value) {
    return selectedPhotoPreview.value
  }

  if (isEditing.value && shouldRemovePhoto.value) {
    return ''
  }

  return form.value.profileImage || user.value.profileImage || ''
})

const getProfileImageUrl = (value) => resolveAssetUrl(value)

const setActiveTab = (tabId) => {
  const nextQuery = { ...route.query }

  if (tabId === 'orders') {
    nextQuery.tab = 'orders'
  } else {
    delete nextQuery.tab
  }

  router.replace({
    query: nextQuery,
  })
}

const fetchProfile = async () => {
  try {
    const res = await getProfile()
    user.value = res.data.user
    syncFormWithUser()
  } catch (err) {
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
}

const fetchOrders = async () => {
  ordersLoading.value = true
  ordersError.value = ''

  try {
    const res = await getMyOrders()
    orders.value = res.data.orders || []
  } catch (err) {
    ordersError.value = err?.response?.data?.message || 'Failed to load orders. Please try again.'
  } finally {
    ordersLoading.value = false
  }
}

const formatRole = (role) => {
  const roles = {
    customer: 'Customer',
    sales_manager: 'Sales Manager',
    product_manager: 'Product Manager',
  }
  return roles[role] || role
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatPaymentStatus = (status) => {
  const labels = {
    pending_payment: 'Pending Payment',
    paid: 'Paid',
    payment_failed: 'Payment Failed',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}

const formatDeliveryStatus = (status) => {
  const labels = {
    processing: 'Processing',
    in_transit: 'In Transit',
    delivered: 'Delivered',
  }
  return labels[status] || status
}

const getDeliveryBadgeClass = (status) => {
  const classes = {
    processing: 'bg-amber-100 text-amber-700',
    in_transit: 'bg-sky-100 text-sky-700',
    delivered: 'bg-emerald-100 text-emerald-700',
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getTimelineDotClass = (state) => {
  const classes = {
    completed: 'bg-orange-500 text-white',
    current: 'bg-orange-100 text-orange-700 ring-4 ring-orange-50',
    pending: 'bg-gray-100 text-gray-400',
  }
  return classes[state] || classes.pending
}

const getTimelineMarker = (step) => {
  if (step.state === 'completed') return 'OK'
  if (step.state === 'current') return 'NOW'
  return step.label.slice(0, 1).toUpperCase()
}

const formatTimelineState = (state) => {
  const labels = {
    completed: 'Completed',
    current: 'Current Step',
    pending: 'Upcoming',
  }
  return labels[state] || state
}

const syncFormWithUser = () => {
  form.value = {
    name: user.value.name || '',
    taxId: user.value.taxId || '',
    address: user.value.address || '',
    profileImage: user.value.profileImage || '',
  }
}

const startEditing = () => {
  formError.value = ''
  formMessage.value = ''
  photoError.value = ''
  clearFieldErrors()
  syncFormWithUser()
  selectedPhotoFile.value = null
  selectedPhotoPreview.value = ''
  shouldRemovePhoto.value = false
  isEditing.value = true
}

const cancelEditing = () => {
  formError.value = ''
  formMessage.value = ''
  photoError.value = ''
  clearFieldErrors()
  syncFormWithUser()
  selectedPhotoFile.value = null
  selectedPhotoPreview.value = ''
  shouldRemovePhoto.value = false
  if (photoInput.value) {
    photoInput.value.value = ''
  }
  isEditing.value = false
}

const clearFieldErrors = () => {
  fieldErrors.value = {
    name: '',
    taxId: '',
    address: '',
  }
}

const clearFieldError = (fieldName) => {
  fieldErrors.value[fieldName] = ''
}

const openPhotoPicker = () => {
  photoInput.value?.click()
}

const handlePhotoSelected = (event) => {
  photoError.value = ''
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    photoError.value = 'Please choose a valid image file.'
    event.target.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    photoError.value = 'Please choose an image smaller than 2MB.'
    event.target.value = ''
    return
  }

  selectedPhotoFile.value = file
  selectedPhotoPreview.value = URL.createObjectURL(file)
  shouldRemovePhoto.value = false
}

const removePhoto = () => {
  photoError.value = ''
  form.value.profileImage = ''
  selectedPhotoFile.value = null
  selectedPhotoPreview.value = ''
  shouldRemovePhoto.value = true
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const validateForm = (payload) => {
  clearFieldErrors()

  if (!payload.name) {
    fieldErrors.value.name = 'Name is required.'
  }

  if (!payload.taxId) {
    fieldErrors.value.taxId = 'Tax ID is required.'
  }

  if (!payload.address) {
    fieldErrors.value.address = 'Address is required.'
  }

  return !fieldErrors.value.name && !fieldErrors.value.taxId && !fieldErrors.value.address
}

const saveProfile = async () => {
  formError.value = ''
  formMessage.value = ''

  const payload = {
    name: form.value.name.trim(),
    taxId: form.value.taxId.trim(),
    address: form.value.address.trim(),
  }

  if (!validateForm(payload)) {
    formError.value = 'Name, tax ID, and address are required.'
    const firstInvalidField =
      (!payload.name && document.getElementById('name')) ||
      (!payload.taxId && document.getElementById('taxId')) ||
      (!payload.address && document.getElementById('address'))

    firstInvalidField?.focus()
    return
  }

  saving.value = true

  try {
    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('taxId', payload.taxId)
    formData.append('address', payload.address)

    if (selectedPhotoFile.value) {
      formData.append('profileImage', selectedPhotoFile.value)
    }

    if (shouldRemovePhoto.value) {
      formData.append('removeProfileImage', 'true')
    }

    const res = await updateProfile(formData)
    user.value = res.data.user
    clearFieldErrors()
    photoError.value = ''
    selectedPhotoFile.value = null
    selectedPhotoPreview.value = ''
    shouldRemovePhoto.value = false

    authStore.updateUser({
      ...authStore.user,
      name: res.data.user.name,
      email: res.data.user.email,
      role: res.data.user.role,
      profileImage: res.data.user.profileImage || '',
    })

    syncFormWithUser()
    isEditing.value = false
    formMessage.value = 'Profile updated successfully.'
  } catch (err) {
    formError.value = err.response?.data?.message || 'Failed to update profile. Please try again.'
  } finally {
    saving.value = false
  }
}

watch(
  () => activeTab.value,
  (tab) => {
    if (tab === 'orders' && !ordersLoading.value) {
      fetchOrders()
    }
  },
  { immediate: true }
)

onMounted(fetchProfile)
</script>
