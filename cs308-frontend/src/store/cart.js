import { reactive } from 'vue'

export const cartStore = reactive({
  totalItems: 0,

  setTotalItems(totalItems) {
    this.totalItems = Number(totalItems) || 0
  },

  clear() {
    this.totalItems = 0
  },
})
