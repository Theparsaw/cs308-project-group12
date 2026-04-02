import api from './productApi'
import { authStore } from '../store/auth'

export const getApprovedReviewsByProductId = (productId) =>
  api.get(`/reviews/product/${productId}`)

export const createReview = (data) =>
  api.post('/reviews', data, {
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
  })
