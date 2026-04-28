import api from './authApi'
import { authStore } from '../store/auth'

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
})

export const getMyOrders = () => api.get('/orders/my-orders', getAuthConfig())

export const cancelOrder = (orderId) =>
  api.patch(`/orders/${orderId}/cancel`, {}, getAuthConfig())
