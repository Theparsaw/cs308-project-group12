import { reactive } from 'vue'

// This is our shared auth state — any component can read from this
export const authStore = reactive({
  // The JWT token stored in memory
  token: localStorage.getItem('token') || null,

  // The logged-in user's info
  user: JSON.parse(localStorage.getItem('user')) || null,

  // Check if the user is currently logged in
  get isLoggedIn() {
    return !!this.token
  },

  // Check the user's role
  get role() {
    return this.user?.role || null
  },

  // Called when user logs in or registers — saves token and user info
  setAuth(token, user) {
    this.token = token
    this.user = user
    // Save to localStorage so the user stays logged in after page refresh
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  // Called when user logs out — clears everything
  clearAuth() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
})