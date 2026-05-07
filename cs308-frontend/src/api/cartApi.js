import api from './productApi'
import { authStore } from '../store/auth'

const CART_ID_KEY = 'guest-cart-id'
const GUEST_CART_KEY = 'guest-cart'

const calculateTotalItems = (items = []) =>
  items.reduce((count, item) => count + item.quantity, 0)

const calculateTotalPrice = (items = []) =>
  items.reduce((total, item) => total + item.unitPrice * item.quantity, 0)

const normalizeGuestCart = (cartId, items = []) => ({
  cartId,
  items,
  totalItems: calculateTotalItems(items),
  totalPrice: calculateTotalPrice(items),
})

const createInsufficientStockError = (availableStock) => {
  const error = new Error('Requested quantity exceeds available stock')

  error.response = {
    data: {
      message: 'Requested quantity exceeds available stock',
      code: 'INSUFFICIENT_STOCK',
      availableStock,
    },
  }

  return error
}

const normalizeAvailableStock = (value) => {
  const stock = Number(value)
  return Number.isFinite(stock) ? Math.max(0, stock) : null
}

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

export const resetCartId = () => {
  const newCartId = createCartId()
  localStorage.setItem(CART_ID_KEY, newCartId)
  return newCartId
}

const getStoredGuestItems = () => {
  const rawGuestCart = localStorage.getItem(GUEST_CART_KEY)

  if (!rawGuestCart) {
    return []
  }

  try {
    const parsedGuestCart = JSON.parse(rawGuestCart)
    return Array.isArray(parsedGuestCart?.items) ? parsedGuestCart.items : []
  } catch {
    return []
  }
}

const storeGuestItems = (items) => {
  localStorage.setItem(
    GUEST_CART_KEY,
    JSON.stringify({
      items,
      updatedAt: new Date().toISOString(),
    })
  )
}

const getGuestCartPayload = () => normalizeGuestCart(getCartId(), getStoredGuestItems())

const resolveGuestCartResponse = (items) => {
  storeGuestItems(items)
  return Promise.resolve({
    data: normalizeGuestCart(getCartId(), items),
  })
}

const getServerCart = (cartId = getCartId()) => api.get(`/cart/${cartId}`)

const addServerItemToCart = (productId, quantity = 1, cartId = getCartId()) =>
  api.post(`/cart/${cartId}/items`, { productId, quantity })

const updateServerCartItemQuantity = (productId, quantity, cartId = getCartId()) =>
  api.patch(`/cart/${cartId}/items/${productId}`, { quantity })

const removeServerCartItem = (productId, cartId = getCartId()) =>
  api.delete(`/cart/${cartId}/items/${productId}`)

export const getGuestCart = () =>
  Promise.resolve({
    data: getGuestCartPayload(),
  })

export const addGuestItemToCart = (product, quantity = 1) => {
  const guestItems = getStoredGuestItems()
  const existingItem = guestItems.find((item) => item.productId === product.productId)
  const availableStock = normalizeAvailableStock(product.quantityInStock)
  const nextQuantity = (Number(existingItem?.quantity) || 0) + quantity

  if (availableStock !== null && nextQuantity > availableStock) {
    return Promise.reject(createInsufficientStockError(availableStock))
  }

  if (existingItem) {
    existingItem.quantity = nextQuantity
    existingItem.unitPrice = product.price
    existingItem.name = product.model
    existingItem.imageUrl = product.imageUrl || ''
    existingItem.quantityInStock = availableStock
  } else {
    guestItems.push({
      productId: product.productId,
      name: product.model,
      imageUrl: product.imageUrl || '',
      unitPrice: product.price,
      quantity,
      quantityInStock: availableStock,
    })
  }

  return resolveGuestCartResponse(guestItems)
}

export const updateGuestCartItemQuantity = async (productId, quantity) => {
  const guestItems = getStoredGuestItems()
  const existingItem = guestItems.find((item) => item.productId === productId)

  if (!existingItem) {
    return resolveGuestCartResponse(guestItems)
  }

  const productRes = await api.get(`/products/${productId}`)
  const product = productRes.data
  const availableStock = normalizeAvailableStock(product.quantityInStock)

  if (availableStock !== null && quantity > availableStock) {
    throw createInsufficientStockError(availableStock)
  }

  const nextItems = guestItems.map((item) =>
    item.productId === productId
      ? {
          ...item,
          name: product.model,
          imageUrl: product.imageUrl || '',
          unitPrice: product.price,
          quantity,
          quantityInStock: availableStock,
        }
      : item
  )

  return resolveGuestCartResponse(nextItems)
}

export const removeGuestCartItem = (productId) => {
  const guestItems = getStoredGuestItems()
  const nextItems = guestItems.filter((item) => item.productId !== productId)

  return resolveGuestCartResponse(nextItems)
}

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY)
}

export const mergeGuestCartIntoUserCart = async () => {
  const guestItems = getStoredGuestItems()

  if (!authStore.isLoggedIn || guestItems.length === 0) {
    return { mergedItemCount: 0 }
  }

  for (const item of guestItems) {
    await addServerItemToCart(item.productId, item.quantity)
  }

  clearGuestCart()

  return {
    mergedItemCount: guestItems.length,
  }
}

export const getCart = (cartId = getCartId()) =>
  authStore.isLoggedIn ? getServerCart(cartId) : getGuestCart()

export const addItemToCart = (productId, quantity = 1, cartId = getCartId()) =>
  addServerItemToCart(productId, quantity, cartId)

export const updateCartItemQuantity = (productId, quantity, cartId = getCartId()) =>
  authStore.isLoggedIn
    ? updateServerCartItemQuantity(productId, quantity, cartId)
    : updateGuestCartItemQuantity(productId, quantity)

export const removeCartItem = (productId, cartId = getCartId()) =>
  authStore.isLoggedIn
    ? removeServerCartItem(productId, cartId)
    : removeGuestCartItem(productId)

export const checkoutCart = (paymentMethod, cartId = getCartId()) =>
  api.post(`/cart/${cartId}/checkout`, { paymentMethod })
