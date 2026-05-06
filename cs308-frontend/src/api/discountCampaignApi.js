import api from './productApi'

export const getCampaigns = () =>
  api.get('/discount-campaigns')

export const createCampaign = (data) =>
  api.post('/discount-campaigns', data)

export const updateCampaign = (id, data) =>
  api.put(`/discount-campaigns/${id}`, data);

export const deactivateCampaign = (id) =>
  api.patch(`/discount-campaigns/${id}/deactivate`)
export const reactivateCampaign = (id) =>
  api.patch(`/discount-campaigns/${id}/reactivate`);

export const deleteCampaign = (id) =>
  api.delete(`/discount-campaigns/${id}`);