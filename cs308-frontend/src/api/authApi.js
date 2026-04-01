import axios from 'axios'

// Create an axios instance pointing to our backend
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

// Send registration data to the backend
export const registerUser = (data) => api.post('/auth/register', data)

// Send login credentials to the backend
export const loginUser = (data) => api.post('/auth/login', data)

export default api