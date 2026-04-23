import api from './authApi'
import { authStore } from '../store/auth'

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
})

export const getDeliveries = () =>
  api.get('/deliveries', getAuthConfig())

export const updateDeliveryStatus = (deliveryId, status) =>
  api.patch(`/deliveries/${deliveryId}/status`, { status }, getAuthConfig())