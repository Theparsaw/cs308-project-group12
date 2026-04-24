import api from './authApi'
import { authStore } from '../store/auth'

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
})

export const getMyInvoices = () => api.get('/invoices/my-invoices', getAuthConfig())

export const downloadInvoice = (invoiceId) =>
  api.get(`/invoices/${invoiceId}/download`, {
    ...getAuthConfig(),
    responseType: 'blob',
  })
