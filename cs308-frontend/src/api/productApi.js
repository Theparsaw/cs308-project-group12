import axios from 'axios'
import { authStore } from '../store/auth'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

api.interceptors.request.use((config) => {
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authErrorCodes = new Set([
      'AUTH_REQUIRED',
      'TOKEN_EXPIRED',
      'INVALID_TOKEN',
      'INVALID_TOKEN_FORMAT',
      'USER_NOT_FOUND',
    ])

    if (authStore.token && authErrorCodes.has(error?.response?.data?.code)) {
      authStore.clearAuth()

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login?reason=session-expired')
      }
    }

    return Promise.reject(error)
  }
)

export const getProducts = (search = '') =>
  api.get('/products', {
    params: search && search.trim() ? { search: search.trim() } : {},
  })

export const getProductById = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

export default api