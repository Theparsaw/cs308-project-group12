import api from './authApi'
import { authStore } from '../store/auth'
import { getCartId } from './cartApi'

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
})

export const getCheckoutCart = (cartId = getCartId()) =>
  api.get(`/checkout/${cartId}`, getAuthConfig())

export const validateCheckout = (cartId = getCartId()) =>
  api.post(`/checkout/${cartId}/validate`, {}, getAuthConfig())

export const createOrder = (cartId = getCartId()) =>
  api.post(`/checkout/${cartId}/order`, {}, getAuthConfig())