<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Pending Refund Requests</h1>

    <div v-if="isLoading" class="text-center text-gray-500 py-10">Loading requests...</div>
    <div v-else-if="requests.length === 0" class="text-center text-gray-500 py-10 bg-white rounded shadow">
      No pending return requests found.
    </div>

    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="req in requests" :key="req._id">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ req.userId?.name || 'Unknown' }}</div>
              <div class="text-sm text-gray-500">{{ req.userId?.email || 'N/A' }}</div>
            </td>
            <td class="px-6 py-4">
              <ul class="text-sm text-gray-700 list-disc pl-4">
                <li v-for="item in req.items" :key="item.productId">{{ item.quantity }}x {{ item.name }}</li>
              </ul>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" :title="req.reason">{{ req.reason }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${{ req.refundAmount.toFixed(2) }}</td>
            <td class="px-6 py-4 text-center space-x-2">
              <button @click="approve(req._id)" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">Approve</button>
              <button @click="openRejectModal(req._id)" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 class="text-lg font-bold mb-4">Reject Refund</h3>
        <textarea v-model="managerNotes" class="w-full border rounded p-2 mb-4" rows="3" placeholder="Manager Notes..."></textarea>
        <div class="flex justify-end space-x-2">
          <button @click="showModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button @click="confirmReject" class="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPendingReturnRequests, approveReturnRequest, rejectReturnRequest } from '../../api/returnApi'

const requests = ref([])
const isLoading = ref(true)
const showModal = ref(false)
const selectedRequestId = ref(null)
const managerNotes = ref('')

const loadRequests = async () => {
  isLoading.value = true
  try {
    const res = await getPendingReturnRequests()
    requests.value = res.data.data || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const approve = async (id) => {
  if (!confirm('Approve refund and restore stock?')) return
  try {
    await approveReturnRequest(id)
    loadRequests()
  } catch (error) {
    alert('Failed to approve refund.')
  }
}

const openRejectModal = (id) => {
  selectedRequestId.value = id
  managerNotes.value = ''
  showModal.value = true
}

const confirmReject = async () => {
  try {
    await rejectReturnRequest(selectedRequestId.value, managerNotes.value)
    showModal.value = false
    loadRequests()
  } catch (error) {
    alert('Failed to reject refund.')
  }
}

onMounted(() => loadRequests())
</script>