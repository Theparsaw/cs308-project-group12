import api from './productApi'

const CART_ID_KEY = 'guest-cart-id'

const createCartId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `guest-${Date.now()}`
}

export const getCartId = () => {
  const existingCartId = localStorage.getItem(CART_ID_KEY)

  if (existingCartId) {
    return existingCartId
  }

  const newCartId = createCartId()
  localStorage.setItem(CART_ID_KEY, newCartId)

  return newCartId
}

export const getCart = (cartId = getCartId()) => api.get(`/cart/${cartId}`)

export const addItemToCart = (productId, quantity = 1, cartId = getCartId()) =>
  api.post(`/cart/${cartId}/items`, { productId, quantity })

export const updateCartItemQuantity = (productId, quantity, cartId = getCartId()) =>
  api.patch(`/cart/${cartId}/items/${productId}`, { quantity })

export const removeCartItem = (productId, cartId = getCartId()) =>
  api.delete(`/cart/${cartId}/items/${productId}`)
