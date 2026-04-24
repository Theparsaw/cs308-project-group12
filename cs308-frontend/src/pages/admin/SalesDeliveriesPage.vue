<template>
  <div>
    <div class="mb-6">
      <p class="text-sm font-semibold text-orange-600 mb-2">Sales Management</p>
      <h1 class="text-3xl font-bold text-gray-900">Shipment Status Management</h1>
      <p class="text-gray-600 mt-2">
        Monitor paid orders and update delivery progress quickly.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-6">
      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">Total</p>
        <p class="text-3xl font-bold text-gray-900">{{ deliveries.length }}</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">Processing</p>
        <p class="text-3xl font-bold text-gray-900">{{ processingCount }}</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">Shipped</p>
        <p class="text-3xl font-bold text-gray-900">{{ shippedCount }}</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">In transit</p>
        <p class="text-3xl font-bold text-gray-900">{{ outForDeliveryCount }}</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-3xl p-5">
        <p class="text-sm text-gray-500 mb-2">Delivered</p>
        <p class="text-3xl font-bold text-gray-900">{{ deliveredCount }}</p>
      </div>
    </div>

    <div class="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            class="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            @click="statusFilter = option.value"
            class="rounded-full border px-4 py-2 text-sm font-medium transition"
            :class="statusFilter === option.value
              ? 'border-orange-500 bg-orange-500 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400'"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
      Loading deliveries...
    </div>

    <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <div
      v-else-if="filteredDeliveries.length === 0"
      class="rounded-3xl border border-gray-200 bg-white p-8 text-gray-600"
    >
      No deliveries found.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="delivery in filteredDeliveries"
        :key="delivery.id"
        class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div class="space-y-4 flex-1">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Order ID</p>
                <p class="text-lg font-bold text-gray-900 break-all">{{ delivery.orderId }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  Created {{ formatDate(delivery.createdAt) }}
                </p>
              </div>

              <div>
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  :class="getStatusBadgeClass(delivery.status)"
                >
                  {{ formatStatusLabel(delivery.status) }}
                </span>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Customer</p>
                <p class="font-semibold text-gray-900">
                  {{ delivery.customerName || 'Unknown User' }}
                </p>
                <p class="text-sm text-gray-500 break-all">
                  {{ delivery.customerEmail || 'No email' }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Order Total</p>
                <p class="text-xl font-bold text-gray-900">
                  {{ formatCurrency(delivery.totalPrice) }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Address</p>
                <p class="text-sm text-gray-700">
                  {{ delivery.address || 'Not provided' }}
                </p>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-gray-900">Items</p>
                <p class="text-xs text-gray-500">
                  {{ getTotalItemCount(delivery.items) }} item(s)
                </p>
              </div>

              <div class="space-y-2">
                <div
                  v-for="item in delivery.items"
                  :key="`${delivery.id}-${item.productId}`"
                  class="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                >
                  <div class="pr-4">
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">Product ID: {{ item.productId }}</p>
                  </div>

                  <div class="text-sm text-gray-700 whitespace-nowrap">
                    × {{ item.quantity }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="xl:w-[320px] xl:pl-4">
            <div class="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <p class="text-sm font-semibold text-orange-700 mb-3">Update Shipment Status</p>

              <label class="block text-sm text-gray-700 mb-2">New status</label>
              <select
                v-model="selectedStatuses[delivery.id]"
                class="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-500"
              >
                <option
                  v-for="status in allowedStatuses"
                  :key="status"
                  :value="status"
                >
                  {{ formatStatusLabel(status) }}
                </option>
              </select>

              <button
                @click="handleUpdateStatus(delivery)"
                :disabled="savingIds.has(delivery.id)"
                class="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {{ savingIds.has(delivery.id) ? 'Updating...' : 'Save Status Update' }}
              </button>
            </div>
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
import { getDeliveries, updateDeliveryStatus } from '../../api/deliveryApi'

const deliveries = ref([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')
const searchTerm = ref('')
const statusFilter = ref('all')
const selectedStatuses = ref({})
const savingIds = ref(new Set())

const allowedStatuses = [
  'processing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'In transit', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const processingCount = computed(() =>
  deliveries.value.filter((d) => d.status === 'processing').length
)

const shippedCount = computed(() =>
  deliveries.value.filter((d) => d.status === 'shipped').length
)

const outForDeliveryCount = computed(() =>
  deliveries.value.filter((d) => d.status === 'out_for_delivery').length
)

const deliveredCount = computed(() =>
  deliveries.value.filter((d) => d.status === 'delivered').length
)

const filteredDeliveries = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return deliveries.value.filter((delivery) => {
    const matchesSearch =
      !term ||
      String(delivery.orderId ?? '').toLowerCase().includes(term) ||
      String(delivery.customerName ?? '').toLowerCase().includes(term) ||
      String(delivery.customerEmail ?? '').toLowerCase().includes(term)

    const matchesFilter =
      statusFilter.value === 'all' || delivery.status === statusFilter.value

    return matchesSearch && matchesFilter
  })
})

const formatDate = (value) => {
  if (!value) return 'Unknown date'
  return new Date(value).toLocaleString()
}

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString()}`
}

const getTotalItemCount = (items = []) => {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}

const formatStatusLabel = (status) => {
  switch (status) {
    case 'processing':
      return 'Processing'
    case 'shipped':
      return 'Shipped'
    case 'out_for_delivery':
      return 'In transit'
    case 'delivered':
      return 'Delivered'
    case 'cancelled':
      return 'Canceled'
    default:
      return status
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'processing':
      return 'bg-yellow-100 text-yellow-700'
    case 'shipped':
      return 'bg-blue-100 text-blue-700'
    case 'out_for_delivery':
      return 'bg-purple-100 text-purple-700'
    case 'delivered':
      return 'bg-green-100 text-green-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const loadDeliveries = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const res = await getDeliveries()
    deliveries.value = res.data?.data ?? []

    const initialSelections = {}
    for (const delivery of deliveries.value) {
      initialSelections[delivery.id] = delivery.status
    }
    selectedStatuses.value = initialSelections
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to load deliveries'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleUpdateStatus = async (delivery) => {
  error.value = ''
  successMessage.value = ''

  const nextStatus = selectedStatuses.value[delivery.id]

  if (!nextStatus || nextStatus === delivery.status) {
    successMessage.value = 'No status change to save.'
    return
  }

  try {
    savingIds.value.add(delivery.id)
    savingIds.value = new Set(savingIds.value)

    const res = await updateDeliveryStatus(delivery.id, nextStatus)
    const updatedDelivery = res.data?.data

    deliveries.value = deliveries.value.map((item) =>
      item.id === delivery.id ? updatedDelivery : item
    )

    selectedStatuses.value[delivery.id] = updatedDelivery.status
    successMessage.value = `Shipment status for order ${delivery.orderId} updated successfully.`
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to update shipment status'
    console.error(err)
  } finally {
    savingIds.value.delete(delivery.id)
    savingIds.value = new Set(savingIds.value)
  }
}

onMounted(loadDeliveries)
</script>
