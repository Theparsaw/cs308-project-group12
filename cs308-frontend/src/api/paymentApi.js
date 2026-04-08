import api from './authApi'
import { authStore } from '../store/auth'

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
})

export const getOrderForPayment = (orderId) =>
  api.get(`/payments/order/${orderId}`, getAuthConfig())

export const submitPayment = (orderId, paymentData) =>
  api.post(`/payments/${orderId}`, paymentData, getAuthConfig())