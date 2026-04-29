import api from './authApi'
import { authStore } from '../store/auth'

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
})

export const getMyReturnRequests = () => api.get('/returns/my-returns', getAuthConfig())

export const submitReturnRequest = (payload) =>
  api.post('/returns', payload, getAuthConfig())
