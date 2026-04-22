<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-2xl mx-auto px-4">
      <!-- Page title -->
      <div class="flex items-center justify-between gap-4 mb-8">
        <h1 class="text-3xl font-bold text-gray-800">My Profile</h1>

        <!-- Show the edit button only when the profile is loaded and we are not already editing -->
        <button
          v-if="!loading && !error && !isEditing"
          type="button"
          class="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          @click="startEditing"
        >
          Edit Profile
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-gray-500 text-center py-20">
        Loading your profile...
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-red-500 text-center py-20">
        {{ error }}
      </div>

      <!-- Profile card -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <!-- Avatar and name -->
        <div class="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
          <!-- Show the uploaded profile image when available -->
          <img
            v-if="displayProfileImage"
            :src="getProfileImageUrl(displayProfileImage)"
            alt="Profile photo"
            class="w-20 h-20 rounded-full object-cover border-2 border-orange-200 shrink-0"
          />

          <!-- Otherwise fall back to an avatar circle with the first letter of name -->
          <div
            v-else
            class="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold shrink-0"
          >
            {{ user.name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800">{{ user.name }}</h2>
            <!-- Role badge -->
            <span class="inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium"
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

        <!-- Show success or error feedback after save attempts -->
        <div v-if="formMessage" class="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {{ formMessage }}
        </div>
        <div v-if="formError" class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ formError }}
        </div>

        <!-- Read-only profile view -->
        <div v-if="!isEditing" class="space-y-5">
          <!-- Email -->
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-400 uppercase tracking-wide">Email</span>
            <span class="text-gray-800 font-medium">{{ user.email }}</span>
          </div>

          <!-- Tax ID -->
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-400 uppercase tracking-wide">Tax ID</span>
            <span class="text-gray-800 font-medium">
              {{ user.taxId || 'Not provided' }}
            </span>
          </div>

          <!-- Address -->
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-400 uppercase tracking-wide">Address</span>
            <span class="text-gray-800 font-medium">
              {{ user.address || 'Not provided' }}
            </span>
          </div>

          <!-- Member since -->
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-400 uppercase tracking-wide">Member Since</span>
            <span class="text-gray-800 font-medium">{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>

        <!-- Edit form -->
        <form v-else class="space-y-5" @submit.prevent="saveProfile">
          <!-- Hidden file input used by the custom photo buttons -->
          <input
            ref="photoInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handlePhotoSelected"
          />

          <!-- Photo upload controls -->
          <div class="flex flex-col gap-3">
            <span class="text-sm font-medium text-gray-400 uppercase tracking-wide">Profile Photo</span>
            <div class="flex flex-wrap items-center gap-4">
              <img
                v-if="displayProfileImage"
                :src="getProfileImageUrl(displayProfileImage)"
                alt="Selected profile photo preview"
                class="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
              />
              <div
                v-else
                class="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold shrink-0"
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

          <!-- Name field -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-400 uppercase tracking-wide" for="name">
              Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="rounded-xl border px-4 py-3 text-gray-800 outline-none transition"
              :class="fieldErrors.name
                ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'"
              placeholder="Enter your full name"
              @input="clearFieldError('name')"
            />
            <p v-if="fieldErrors.name" class="text-sm text-red-600">{{ fieldErrors.name }}</p>
          </div>

          <!-- Email stays read-only because this flow only edits profile fields -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-400 uppercase tracking-wide" for="email">
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

          <!-- Tax ID field -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-400 uppercase tracking-wide" for="taxId">
              Tax ID
            </label>
            <input
              id="taxId"
              v-model="form.taxId"
              type="text"
              class="rounded-xl border px-4 py-3 text-gray-800 outline-none transition"
              :class="fieldErrors.taxId
                ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'"
              placeholder="Enter your tax ID"
              @input="clearFieldError('taxId')"
            />
            <p v-if="fieldErrors.taxId" class="text-sm text-red-600">{{ fieldErrors.taxId }}</p>
          </div>

          <!-- Address field -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-400 uppercase tracking-wide" for="address">
              Address
            </label>
            <textarea
              id="address"
              v-model="form.address"
              rows="4"
              class="rounded-xl border px-4 py-3 text-gray-800 outline-none transition"
              :class="fieldErrors.address
                ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'"
              placeholder="Enter your home address"
              @input="clearFieldError('address')"
            />
            <p v-if="fieldErrors.address" class="text-sm text-red-600">{{ fieldErrors.address }}</p>
          </div>

          <!-- Form actions -->
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { getProfile, updateProfile, resolveAssetUrl } from '../api/authApi'
import { authStore } from '../store/auth'

// The full user object fetched from the backend
const user = ref({})
const loading = ref(true)
const error = ref('')
const isEditing = ref(false)
const saving = ref(false)
const formError = ref('')
const formMessage = ref('')
const photoError = ref('')
const photoInput = ref(null)
const selectedPhotoFile = ref(null)
const selectedPhotoPreview = ref('')
const shouldRemovePhoto = ref(false)
const fieldErrors = ref({
  name: '',
  taxId: '',
  address: '',
})

// This form holds only the fields the user is allowed to edit
const form = ref({
  name: '',
  taxId: '',
  address: '',
  profileImage: '',
})

// Use the current saved image in view mode and the selected image in edit mode
const displayProfileImage = computed(() => {
  if (isEditing.value && selectedPhotoPreview.value) {
    return selectedPhotoPreview.value
  }

  if (isEditing.value && shouldRemovePhoto.value) {
    return ''
  }

  return form.value.profileImage || user.value.profileImage || ''
})

// Turn backend upload paths into browser-friendly URLs
const getProfileImageUrl = (value) => resolveAssetUrl(value)

// Fetch the user's full profile when the page loads
const fetchProfile = async () => {
  try {
    const res = await getProfile()
    // The backend returns { user: { ... } }
    user.value = res.data.user
    // Keep the form in sync with the latest saved profile
    syncFormWithUser()
  } catch (err) {
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Convert role key to a readable label
const formatRole = (role) => {
  const roles = {
    customer: 'Customer',
    sales_manager: 'Sales Manager',
    product_manager: 'Product Manager',
  }
  return roles[role] || role
}

// Format the MongoDB date into a readable string
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Copy the current profile values into the edit form
const syncFormWithUser = () => {
  form.value = {
    name: user.value.name || '',
    taxId: user.value.taxId || '',
    address: user.value.address || '',
    profileImage: user.value.profileImage || '',
  }
}

// Enter edit mode and clear old messages
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

// Exit edit mode and reset the form back to the saved user values
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

// Reset every field-level validation message
const clearFieldErrors = () => {
  fieldErrors.value = {
    name: '',
    taxId: '',
    address: '',
  }
}

// Clear a single field's error as soon as the user edits it
const clearFieldError = (fieldName) => {
  fieldErrors.value[fieldName] = ''
}

// Open the hidden file input when the user clicks the custom button
const openPhotoPicker = () => {
  photoInput.value?.click()
}

// Read the selected image file so it can be previewed and sent to the backend
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

// Clear the selected profile image from the form so the user can save without a photo
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

// Validate each editable field and return whether the form is valid
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

// Validate and save the editable profile fields
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

    // Update the shared auth store so other UI areas show the new name immediately
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
