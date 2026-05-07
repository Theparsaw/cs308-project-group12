<template>
  <div>
    <div class="mb-6">
      <p class="text-sm font-semibold text-orange-600 mb-2">
        Pricing
      </p>

      <h1 class="text-3xl font-bold text-gray-900">
        Price Management
      </h1>

      <p class="text-gray-600 mt-2">
        Update product prices from the admin panel.
      </p>
    </div>

    <div class="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by product name or ID..."
        class="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
      />
    </div>

    <div
      v-if="loading"
      class="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600"
    >
      Loading products...
    </div>

    <div
      v-else-if="error"
      class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600"
    >
      {{ error }}
    </div>

    <div
      v-else
      class="rounded-3xl border border-gray-200 bg-white overflow-hidden"
    >
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">
              Product
            </th>

            <th class="text-left px-6 py-4 font-semibold text-gray-700">
              Category
            </th>

            <th class="text-left px-6 py-4 font-semibold text-gray-700">
              Current Price
            </th>

            <th class="text-left px-6 py-4 font-semibold text-gray-700">
              New Price
            </th>

            <th class="text-left px-6 py-4 font-semibold text-gray-700">
              Action
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="product in filteredProducts"
            :key="product.productId"
          >
            <td class="px-6 py-4">
              <p class="font-semibold text-gray-900">
                {{ product.name }} {{ product.model }}
              </p>

              <p class="text-gray-400 text-xs">
                {{ product.productId }}
              </p>
            </td>

            <td class="px-6 py-4 text-gray-600 capitalize">
              {{ product.categoryId }}
            </td>

            <td class="px-6 py-4 font-semibold text-gray-900">
              ${{ product.price.toFixed(2) }}
            </td>

            <td class="px-6 py-4">
              <input
                v-model="priceInputs[product.productId]"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter new price"
                class="w-32 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                :class="errors[product.productId] ? 'border-red-400' : ''"
              />

              <p
                v-if="errors[product.productId]"
                class="text-red-500 text-xs mt-1"
              >
                {{ errors[product.productId] }}
              </p>
            </td>

            <td class="px-6 py-4">
              <button
                @click="updatePrice(product)"
                :disabled="saving[product.productId]"
                class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {{
                  saving[product.productId]
                    ? 'Saving...'
                    : 'Save'
                }}
              </button>

              <span
                v-if="success[product.productId]"
                class="ml-2 text-green-600 text-xs font-semibold"
              >
                ✓ Updated
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="filteredProducts.length === 0"
        class="p-8 text-center text-gray-500"
      >
        No products found.
      </div>
    </div>

    <div class="mt-10 rounded-3xl border border-gray-200 bg-white p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Sales Reports</h2>
        <p class="text-gray-600 mt-2">
          View invoices, revenue, and discount loss by date range.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Start Date
          </label>
          <input
            v-model="reportFilters.startDate"
            type="date"
            class="w-full rounded-2xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            End Date
          </label>
          <input
            v-model="reportFilters.endDate"
            type="date"
            class="w-full rounded-2xl border border-gray-300 px-4 py-3"
          />
        </div>

        <button
          @click="loadSalesReports"
          :disabled="reportLoading"
          class="self-end rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {{ reportLoading ? 'Loading...' : 'Apply' }}
        </button>

        <button
          @click="printSalesReport"
          class="self-end rounded-2xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-200"
        >
          Print
        </button>
      </div>

      <p v-if="reportError" class="mt-3 text-sm text-red-600">
        {{ reportError }}
      </p>

      <div class="mt-6 grid gap-4 md:grid-cols-4">
        <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p class="text-sm text-gray-500">Revenue</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">
            {{ formatCurrency(salesReport.revenue) }}
          </p>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p class="text-sm text-gray-500">Discount Loss</p>
          <p class="mt-2 text-2xl font-bold text-red-600">
            {{ formatCurrency(salesReport.discountLoss) }}
          </p>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p class="text-sm text-gray-500">Estimated Profit</p>
          <p class="mt-2 text-2xl font-bold text-emerald-700">
            {{ formatCurrency(salesReport.estimatedProfit) }}
          </p>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p class="text-sm text-gray-500">Orders / Items</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">
            {{ salesReport.orderCount }} / {{ salesReport.itemsSold }}
          </p>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">
          Revenue and Loss Chart
        </h3>

        <div
          v-if="salesReport.chart.length === 0"
          class="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500"
        >
          No paid orders found for this date range.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="point in salesReport.chart"
            :key="point.date"
            class="rounded-2xl border border-gray-100 p-4"
          >
            <div class="mb-3 flex items-center justify-between gap-4">
              <p class="font-semibold text-gray-900">{{ point.date }}</p>
              <p class="text-sm text-gray-500">
                {{ point.orders }} order{{ point.orders === 1 ? '' : 's' }}
              </p>
            </div>

            <div class="space-y-2">
              <div>
                <div class="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Revenue</span>
                  <span>{{ formatCurrency(point.revenue) }}</span>
                </div>
                <div class="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-emerald-500"
                    :style="{ width: getChartWidth(point.revenue) }"
                  />
                </div>
              </div>

              <div>
                <div class="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Discount loss</span>
                  <span>{{ formatCurrency(point.discountLoss) }}</span>
                </div>
                <div class="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-red-500"
                    :style="{ width: getChartWidth(point.discountLoss) }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div class="mb-4 flex items-center justify-between gap-4">
          <h3 class="text-xl font-bold text-gray-900">
            Invoices in Range
          </h3>
          <p class="text-sm text-gray-500">
            {{ salesInvoiceSummary.count }} invoice{{ salesInvoiceSummary.count === 1 ? '' : 's' }}
            · {{ formatCurrency(salesInvoiceSummary.totalAmount) }}
          </p>
        </div>

        <div
          v-if="salesInvoices.length === 0"
          class="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500"
        >
          No invoices found for this date range.
        </div>

        <div v-else class="overflow-hidden rounded-2xl border border-gray-200">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Invoice</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="invoice in salesInvoices" :key="invoice.id">
                <td class="px-4 py-3">
                  <p class="font-semibold text-gray-900">{{ invoice.invoiceNumber }}</p>
                  <p class="text-xs text-gray-500">Order {{ invoice.orderId }}</p>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ invoice.customerName }}</p>
                  <p class="text-xs text-gray-500">{{ invoice.customerEmail }}</p>
                </td>
                <td class="px-4 py-3 text-gray-600">
                  {{ formatDate(invoice.createdAt) }}
                </td>
                <td class="px-4 py-3 font-semibold text-gray-900">
                  {{ formatCurrency(invoice.amount) }}
                </td>
                <td class="px-4 py-3">
                  <button
                    @click="handleDownloadSalesInvoice(invoice)"
                    :disabled="downloadingInvoiceId === invoice.id"
                    class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                  >
                    {{ downloadingInvoiceId === invoice.id ? 'Downloading...' : 'PDF' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CAMPAIGN MANAGEMENT -->

    <div
      ref="campaignFormSection"
      class="mt-10 rounded-3xl border border-gray-200 bg-white p-6"
    >

      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">
          Discount Campaign Management
        </h2>

        <p class="text-gray-600 mt-2">
          Create and manage product discount campaigns.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">

        <input
          v-model="campaignForm.name"
          type="text"
          placeholder="Campaign name"
          class="rounded-2xl border border-gray-300 px-4 py-3"
        />

        <input
          v-model.number="campaignForm.discountPercentage"
          type="number"
          min="1"
          max="100"
          placeholder="Discount %"
          class="rounded-2xl border border-gray-300 px-4 py-3"
        />

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Campaign Start Date
          </label>

          <input
            v-model="campaignForm.startDate"
            type="date"
            class="w-full rounded-2xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Campaign End Date
          </label>

          <input
            v-model="campaignForm.endDate"
            type="date"
            class="w-full rounded-2xl border border-gray-300 px-4 py-3"
          />
        </div>
      </div>

      <!-- PRODUCT SEARCH -->

      <div class="mt-6">
        <input
          v-model="campaignProductSearch"
          type="text"
          placeholder="Search products for campaign..."
          class="w-full rounded-2xl border border-gray-300 px-4 py-3"
        />
      </div>

      <!-- PRODUCT SELECT -->

      <div class="mt-6">
        <p class="text-sm font-semibold text-gray-700 mb-3">
          Select Products
        </p>

        <div class="max-h-60 overflow-y-auto rounded-2xl border border-gray-200 p-4 space-y-2">

          <label
            v-for="product in filteredCampaignProducts"
            :key="product.productId"
            class="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50"
          >
            <input
              v-model="campaignForm.productIds"
              :value="product.productId"
              type="checkbox"
            />

            <div>
              <p class="font-semibold text-gray-900">
                {{ product.name }} {{ product.model }}
              </p>

              <p class="text-xs text-gray-500">
                {{ product.productId }}
              </p>
            </div>
          </label>

        </div>
      </div>

      <!-- BUTTONS -->

      <div class="flex gap-3 mt-6">

        <button
          @click="handleSaveCampaign"
          :disabled="creatingCampaign"
          class="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {{
            creatingCampaign
              ? 'Saving...'
              : editingCampaignId
                ? 'Update Campaign'
                : 'Create Campaign'
          }}
        </button>

        <button
          v-if="editingCampaignId"
          @click="resetCampaignForm"
          class="rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-300"
        >
          Cancel Edit
        </button>

      </div>

      <p
        v-if="campaignSuccess"
        class="mt-3 text-sm text-green-600"
      >
        {{ campaignSuccess }}
      </p>

      <p
        v-if="campaignError"
        class="mt-3 text-sm text-red-600"
      >
        {{ campaignError }}
      </p>

      <!-- EXISTING CAMPAIGNS -->

      <div class="mt-10">
        <h3 class="text-xl font-bold text-gray-900 mb-4">
          Existing Campaigns
        </h3>

        <div
          v-if="loadingCampaigns"
          class="text-gray-500"
        >
          Loading campaigns...
        </div>

        <div
          v-else-if="campaigns.length === 0"
          class="text-gray-500"
        >
          No campaigns found.
        </div>

        <div v-else class="space-y-4">

          <div
            v-for="campaign in campaigns"
            :key="campaign._id"
            class="rounded-2xl border border-gray-200 p-5"
          >

            <div class="flex items-center justify-between">

              <div>
                <p class="font-bold text-gray-900">
                  {{ campaign.name }}
                </p>

                <p class="text-sm text-gray-600 mt-1">
                  {{ campaign.discountPercentage }}% discount
                </p>

                <p class="text-xs text-gray-500 mt-1">
                  {{ formatCampaignDate(campaign.startDate) }}
                  →
                  {{ formatCampaignDate(campaign.endDate) }}
                </p>
              </div>

                <div class="flex gap-2">

                  <button
                    @click="startEdit(campaign)"
                    class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    v-if="campaign.isActive"
                    @click="handleDeactivateCampaign(campaign._id)"
                    class="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Deactivate
                  </button>

                  <button
                    v-else
                    @click="handleReactivateCampaign(campaign._id)"
                    class="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                  >
                    Reactivate
                  </button>

                  <button
                    @click="handleDeleteCampaign(campaign._id)"
                    class="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                  >
                    Delete
                  </button>

                </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  reactive,
  nextTick
} from 'vue'

import {
  getProducts,
  updateProduct
} from '../../api/productApi'

import {
  getCampaigns,
  createCampaign,
  deactivateCampaign,
  reactivateCampaign,
  deleteCampaign,
  updateCampaign
} from '../../api/discountCampaignApi'

import {
  downloadSalesInvoice,
  getSalesInvoices,
  getSalesReport,
} from '../../api/invoiceApi'

const products = ref([])
const campaigns = ref([])

const loading = ref(true)
const loadingCampaigns = ref(false)

const error = ref('')

const searchTerm = ref('')
const campaignProductSearch = ref('')

const editingCampaignId = ref(null)
const campaignFormSection = ref(null)

const creatingCampaign = ref(false)

const campaignSuccess = ref('')
const campaignError = ref('')
const reportLoading = ref(false)
const reportError = ref('')
const salesInvoices = ref([])
const salesInvoiceSummary = ref({
  count: 0,
  totalAmount: 0,
})
const salesReport = ref({
  revenue: 0,
  discountLoss: 0,
  estimatedProfit: 0,
  orderCount: 0,
  itemsSold: 0,
  chart: [],
})
const downloadingInvoiceId = ref('')

const priceInputs = reactive({})
const saving = reactive({})
const success = reactive({})
const errors = reactive({})

const today = new Date()
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const toDateInput = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const reportFilters = ref({
  startDate: toDateInput(firstDayOfMonth),
  endDate: toDateInput(today),
})

const campaignForm = ref({
  name: '',
  productIds: [],
  discountPercentage: 10,
  startDate: '',
  endDate: '',
})

const filteredProducts = computed(() => {
  const term = searchTerm.value.toLowerCase()

  if (!term) return products.value

  return products.value.filter((p) =>
    `${p.name} ${p.model}`
      .toLowerCase()
      .includes(term)
    ||
    p.productId.toLowerCase().includes(term)
  )
})

const filteredCampaignProducts = computed(() => {
  return products.value.filter((p) =>
    `${p.name} ${p.model}`
      .toLowerCase()
      .includes(
        campaignProductSearch.value.toLowerCase()
      )
  )
})

const maxChartValue = computed(() => {
  const values = salesReport.value.chart.flatMap((point) => [
    Number(point.revenue || 0),
    Number(point.discountLoss || 0),
  ])

  return Math.max(...values, 1)
})

const reportParams = computed(() => ({
  startDate: reportFilters.value.startDate,
  endDate: reportFilters.value.endDate,
}))

const loadProducts = async () => {
  loading.value = true
  error.value = ''

  try {

    const res = await getProducts()

    products.value =
      (res.data || []).sort((a, b) =>
        `${a.name} ${a.model}`.localeCompare(
          `${b.name} ${b.model}`
        )
      )

  } catch (err) {

    error.value = 'Failed to load products'

  } finally {

    loading.value = false
  }
}

const loadCampaigns = async () => {
  loadingCampaigns.value = true

  try {

    const res = await getCampaigns()

    campaigns.value = res.data

  } catch (err) {

    console.error(err)

  } finally {

    loadingCampaigns.value = false
  }
}

const loadSalesReports = async () => {
  reportLoading.value = true
  reportError.value = ''

  try {
    const [invoicesRes, reportRes] = await Promise.all([
      getSalesInvoices(reportParams.value),
      getSalesReport(reportParams.value),
    ])

    salesInvoices.value = invoicesRes.data?.invoices || []
    salesInvoiceSummary.value = invoicesRes.data?.summary || {
      count: 0,
      totalAmount: 0,
    }
    salesReport.value = reportRes.data?.summary || {
      revenue: 0,
      discountLoss: 0,
      estimatedProfit: 0,
      orderCount: 0,
      itemsSold: 0,
      chart: [],
    }
  } catch (err) {
    reportError.value =
      err?.response?.data?.message ||
      'Failed to load sales reports'
  } finally {
    reportLoading.value = false
  }
}

const updatePrice = async (product) => {

  const raw = priceInputs[product.productId]

  errors[product.productId] = ''

  if (raw === undefined || raw === '') {
    errors[product.productId] =
      'Please enter a price'

    return
  }

  const newPrice = parseFloat(raw)

  if (isNaN(newPrice) || newPrice < 0) {

    errors[product.productId] =
      'Price must be positive'

    return
  }

  saving[product.productId] = true
  success[product.productId] = false

  try {

    await updateProduct(product.productId, {
      price: newPrice
    })

    product.price = newPrice

    priceInputs[product.productId] = ''

    success[product.productId] = true

    setTimeout(() => {
      success[product.productId] = false
    }, 3000)

  } catch (err) {

    errors[product.productId] =
      'Failed to update price'

  } finally {

    saving[product.productId] = false
  }
}

const resetCampaignForm = () => {

  editingCampaignId.value = null

  campaignForm.value = {
    name: '',
    productIds: [],
    discountPercentage: 10,
    startDate: '',
    endDate: '',
  }
}

const startEdit = (campaign) => {

  editingCampaignId.value = campaign._id

  campaignForm.value = {
    name: campaign.name || "",

    productIds:
      campaign.productIds
      ||
      campaign.products?.map(
        (p) => p.productId || p
      )
      ||
      [],

    discountPercentage:
      campaign.discountPercentage || 0,

    startDate:
      campaign.startDate
        ? campaign.startDate.split("T")[0]
        : "",

    endDate:
      campaign.endDate
        ? campaign.endDate.split("T")[0]
        : "",
  }

  nextTick(() => {
    campaignFormSection.value?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  })
}
const handleSaveCampaign = async () => {

  creatingCampaign.value = true

  campaignSuccess.value = ''
  campaignError.value = ''

  try {

    if (editingCampaignId.value) {

      await updateCampaign(
        editingCampaignId.value,
        campaignForm.value
      )

      campaignSuccess.value =
        'Campaign updated successfully'

    } else {

      await createCampaign(
        campaignForm.value
      )

      campaignSuccess.value =
        'Campaign created successfully'
    }

    resetCampaignForm()

    await loadCampaigns()

  } catch (err) {

    campaignError.value =
      err?.response?.data?.message
      ||
      'Failed to save campaign'

  } finally {

    creatingCampaign.value = false
  }
}

const handleDeactivateCampaign = async (id) => {

  try {

    await deactivateCampaign(id)

    await loadCampaigns()

  } catch (err) {

    console.error(err)
  }
}

const formatCampaignDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatDate = (value) => {
  if (!value) return 'Unknown date'
  return new Date(value).toLocaleDateString()
}

const getChartWidth = (value) => {
  const width = Math.round((Number(value || 0) / maxChartValue.value) * 100)
  return `${Math.max(width, Number(value || 0) > 0 ? 4 : 0)}%`
}

const printSalesReport = () => {
  window.print()
}

const handleDownloadSalesInvoice = async (invoice) => {
  downloadingInvoiceId.value = invoice.id
  reportError.value = ''

  try {
    const res = await downloadSalesInvoice(invoice.id)
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${invoice.invoiceNumber}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    reportError.value =
      err?.response?.data?.message ||
      'Failed to download invoice PDF'
  } finally {
    downloadingInvoiceId.value = ''
  }
}

const handleReactivateCampaign = async (id) => {

  try {

    await reactivateCampaign(id);

    await loadCampaigns();

  } catch (err) {

    console.error(err);
  }
}

const handleDeleteCampaign = async (id) => {

  const confirmed = confirm(
    "Delete this campaign permanently?"
  );

  if (!confirmed) return;

  try {

    await deleteCampaign(id);

    await loadCampaigns();

  } catch (err) {

    console.error(err);
  }
}

onMounted(async () => {

  await Promise.all([
    loadProducts(),
    loadCampaigns(),
    loadSalesReports(),
  ])
})
</script>
