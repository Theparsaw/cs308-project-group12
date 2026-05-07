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

export const getSalesInvoices = (params = {}) =>
  api.get('/invoices/sales', {
    ...getAuthConfig(),
    params,
  })

export const getSalesReport = (params = {}) =>
  api.get('/invoices/sales/report', {
    ...getAuthConfig(),
    params,
  })

export const downloadSalesInvoice = (invoiceId) =>
  api.get(`/invoices/sales/${invoiceId}/download`, {
    ...getAuthConfig(),
    responseType: 'blob',
  })
