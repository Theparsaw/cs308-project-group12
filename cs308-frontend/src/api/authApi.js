import axios from 'axios'

// Create an axios instance pointing to our backend
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

// Convert backend-relative upload paths into browser-friendly image URLs
export const resolveAssetUrl = (value) => {
  if (!value) return ''
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value
  }

  return `http://localhost:5001${value}`
}

// Send registration data to the backend
export const registerUser = (data) => api.post('/auth/register', data)

// Send login credentials to the backend
export const loginUser = (data) => api.post('/auth/login', data)

// Fetch the full profile of the currently logged in user
// We pass the token in the Authorization header so the backend knows who we are
export const getProfile = () => {
  const token = localStorage.getItem('token')
  return api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Send updated profile fields for the currently logged in user
export const updateProfile = (data) => {
  const token = localStorage.getItem('token')
  return api.put('/auth/me', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
}

export default api
