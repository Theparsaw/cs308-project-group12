<template>
  <div>
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-orange-600 mb-2">Moderation</p>
        <h1 class="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
        <p class="text-gray-600 mt-2">
          Review customer feedback and approve or reject submissions.
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">Pending Reviews</p>
        <p class="text-3xl font-bold text-gray-900">{{ pendingReviews.length }}</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">Approved This Session</p>
        <p class="text-3xl font-bold text-gray-900">{{ approvedCount }}</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">Rejected This Session</p>
        <p class="text-3xl font-bold text-gray-900">{{ rejectedCount }}</p>
      </div>
    </div>

    <div class="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by product name, product ID, or comment..."
        class="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
      />
    </div>

    <div v-if="loading" class="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
      Loading pending reviews...
    </div>

    <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <div
      v-else-if="filteredReviews.length === 0"
      class="rounded-3xl border border-gray-200 bg-white p-8 text-gray-600"
    >
      No pending reviews found.
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="review in filteredReviews"
        :key="review._id"
        class="rounded-3xl border border-gray-200 bg-white p-5"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex gap-4 min-w-0">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <img
                v-if="getProduct(review.productId)?.imageUrl"
                :src="getProduct(review.productId).imageUrl"
                :alt="getProduct(review.productId)?.name || 'Product image'"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-xs text-gray-400"
              >
                No image
              </div>
            </div>

            <div class="min-w-0">
              <p class="text-lg font-bold text-gray-900">
                {{ getProduct(review.productId)?.name || 'Unknown Product' }}
              </p>
              <p class="text-sm text-gray-500 mb-2">
                Product ID: {{ review.productId }}
              </p>

              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm font-medium text-gray-700">Rating:</span>
                <span class="text-sm font-semibold text-orange-600">
                  {{ review.rating }}/5
                </span>
              </div>

              <p class="text-sm text-gray-700 leading-6">
                {{ getModerationComment(review) || 'No comment provided.' }}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-2 shrink-0">
            <button
              @click="handleApprove(review._id)"
              class="rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              Approve
            </button>

            <button
              @click="handleReject(review._id)"
              class="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <p
      v-if="successMessage"
      class="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700"
    >
      {{ successMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '../../api/productApi'
import { getPendingReviews, approveReview, rejectReview } from '../../api/reviewApi'

const pendingReviews = ref([])
const products = ref([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')
const searchTerm = ref('')
const approvedCount = ref(0)
const rejectedCount = ref(0)

const productMap = computed(() => {
  return Object.fromEntries(
    products.value.map((product) => [product.productId, product])
  )
})

const getProduct = (productId) => {
  return productMap.value[productId]
}

const filteredReviews = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  if (!term) return pendingReviews.value

  return pendingReviews.value.filter((review) => {
    const product = getProduct(review.productId)

    return (
      String(review.productId ?? '').toLowerCase().includes(term) ||
      String(review.comment ?? '').toLowerCase().includes(term) ||
      String(review.pendingComment ?? '').toLowerCase().includes(term) ||
      String(product?.name ?? '').toLowerCase().includes(term)
    )
  })
})

const getModerationComment = (review) =>
  review.commentStatus === 'pending' && review.pendingComment
    ? review.pendingComment
    : review.comment

const loadModerationData = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const [reviewsRes, productsRes] = await Promise.all([
      getPendingReviews(),
      getProducts(),
    ])

    pendingReviews.value = reviewsRes.data?.data ?? []
    products.value = productsRes.data ?? []
  } catch (err) {
    error.value = 'Failed to load review moderation data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id) => {
  try {
    await approveReview(id)
    pendingReviews.value = pendingReviews.value.filter((review) => review._id !== id)
    approvedCount.value += 1
    successMessage.value = 'Review approved successfully'
  } catch (err) {
    error.value = 'Failed to approve review'
    console.error(err)
  }
}

const handleReject = async (id) => {
  try {
    await rejectReview(id)
    pendingReviews.value = pendingReviews.value.filter((review) => review._id !== id)
    rejectedCount.value += 1
    successMessage.value = 'Review rejected successfully'
  } catch (err) {
    error.value = 'Failed to reject review'
    console.error(err)
  }
}

onMounted(loadModerationData)
</script>
