<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="block mb-1 font-medium">Product ID</label>
        <input
        v-model="form.productId"
        :disabled="disableProductId"
        class="w-full border rounded p-2 bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <p v-if="errors.productId" class="text-red-600 text-sm">{{ errors.productId }}</p>
      </div>

      <div>
        <label class="block mb-1 font-medium">Category</label>
        <select v-model="form.categoryId" class="w-full border rounded p-2">
          <option value="">Select category</option>
          <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
            {{ cat.name }}
          </option>
        </select>
        <p v-if="errors.categoryId" class="text-red-600 text-sm">{{ errors.categoryId }}</p>
      </div>

      <div>
        <label class="block mb-1 font-medium">Brand</label>
        <input v-model="form.name" class="w-full border rounded p-2" />
        <p v-if="errors.name" class="text-red-600 text-sm">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block mb-1 font-medium">Model</label>
        <input v-model="form.model" class="w-full border rounded p-2" />
        <p v-if="errors.model" class="text-red-600 text-sm">{{ errors.model }}</p>
      </div>

      <div>
        <label class="block mb-1 font-medium">Serial Number</label>
        <input v-model="form.serialNumber" class="w-full border rounded p-2" />
        <p v-if="errors.serialNumber" class="text-red-600 text-sm">{{ errors.serialNumber }}</p>
      </div>

      <div>
        <label class="block mb-1 font-medium">Quantity In Stock</label>
        <input v-model.number="form.quantityInStock" type="number" min="0" class="w-full border rounded p-2" />
        <p v-if="errors.quantityInStock" class="text-red-600 text-sm">{{ errors.quantityInStock }}</p>
      </div>

      <div>
        <label class="block mb-1 font-medium">Price</label>
        <input v-model.number="form.price" type="number" min="0" class="w-full border rounded p-2" />
        <p v-if="errors.price" class="text-red-600 text-sm">{{ errors.price }}</p>
      </div>

      <div>
        <label class="block mb-1 font-medium">Warranty Status</label>
        <input v-model="form.warrantyStatus" class="w-full border rounded p-2" />
        <p v-if="errors.warrantyStatus" class="text-red-600 text-sm">{{ errors.warrantyStatus }}</p>
      </div>
    </div>

    <div>
      <label class="block mb-1 font-medium">Distributor Info</label>
      <input v-model="form.distributorInfo" class="w-full border rounded p-2" />
      <p v-if="errors.distributorInfo" class="text-red-600 text-sm">{{ errors.distributorInfo }}</p>
    </div>

    <div>
      <label class="block mb-1 font-medium">Description</label>
      <textarea v-model="form.description" rows="4" class="w-full border rounded p-2"></textarea>
      <p v-if="errors.description" class="text-red-600 text-sm">{{ errors.description }}</p>
    </div>

    <div class="flex gap-3">
      <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {{ submitLabel }}
      </button>

      <button type="button" @click="$emit('cancel')" class="px-4 py-2 border rounded">
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({
      productId: '',
      categoryId: '',
      name: '',
      model: '',
      serialNumber: '',
      description: '',
      quantityInStock: 0,
      price: 0,
      warrantyStatus: '',
      distributorInfo: '',
    }),
  },
  submitLabel: {
    type: String,
    default: 'Save',
  },
  categories: {
    type: Array,
    default: () => [],
  },
  disableProductId: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ ...props.initialValues })
const errors = reactive({})

watch(
  () => props.initialValues,
  (newVal) => {
    Object.assign(form, newVal)
  },
  { deep: true }
)

const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.productId) errors.productId = 'Product ID is required'
  if (!form.categoryId) errors.categoryId = 'Category is required'
  if (!form.name) errors.name = 'Brand is required'
  if (!form.model) errors.model = 'Model is required'
  if (!form.serialNumber) errors.serialNumber = 'Serial number is required'
  if (!form.description) errors.description = 'Description is required'
  if (form.quantityInStock === '' || form.quantityInStock < 0) errors.quantityInStock = 'Stock must be 0 or more'
  if (form.price === '' || form.price < 0) errors.price = 'Price must be 0 or more'
  if (!form.warrantyStatus) errors.warrantyStatus = 'Warranty status is required'
  if (!form.distributorInfo) errors.distributorInfo = 'Distributor info is required'

  return Object.keys(errors).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>
