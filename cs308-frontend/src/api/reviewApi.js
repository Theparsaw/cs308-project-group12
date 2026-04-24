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

export const updateReview = (id, data) =>
  api.patch(`/reviews/${id}`, data, {
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
  })

export const getPendingReviews = () =>
  api.get('/moderation/reviews/pending')

export const approveReview = (id) =>
  api.patch(`/moderation/reviews/${id}/approve`)

export const rejectReview = (id) =>
  api.patch(`/moderation/reviews/${id}/reject`)
