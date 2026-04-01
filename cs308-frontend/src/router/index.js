import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/auth'

// Import all pages
import HomePage from '../pages/HomePage.vue'
import ProductsPage from '../pages/ProductsPage.vue'
import ProductDetailPage from '../pages/ProductDetailPage.vue'
import CartPage from '../pages/CartPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import AdminProductsPage from '../pages/admin/AdminProductsPage.vue'
import AddProductPage from '../pages/admin/AddProductPage.vue'
import EditProductPage from '../pages/admin/EditProductPage.vue'

const routes = [
  // Public routes — anyone can access these
  { path: '/', component: HomePage },
  { path: '/products', component: ProductsPage },
  { path: '/products/:id', component: ProductDetailPage },
  { path: '/cart', component: CartPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },

  // Protected admin routes — only sales_manager and product_manager can access
  {
    path: '/admin/products',
    component: AdminProductsPage,
    meta: { requiresAuth: true, roles: ['sales_manager', 'product_manager'] }
  },
  {
    path: '/admin/products/add',
    component: AddProductPage,
    meta: { requiresAuth: true, roles: ['sales_manager', 'product_manager'] }
  },
  {
    path: '/admin/products/edit/:id',
    component: EditProductPage,
    meta: { requiresAuth: true, roles: ['sales_manager', 'product_manager'] }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard — runs before every page change
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth) {
    // If not logged in, redirect to login page
    if (!authStore.isLoggedIn) {
      return next('/login')
    }

    // If logged in but wrong role, redirect to home page
    const allowedRoles = to.meta.roles || []
    if (!allowedRoles.includes(authStore.role)) {
      return next('/')
    }
  }

  // All checks passed — allow navigation
  next()
})

export default router