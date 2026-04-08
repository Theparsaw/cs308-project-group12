import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/auth'

// Import pages
import ProductsPage from '../pages/ProductsPage.vue'
import ProductDetailPage from '../pages/ProductDetailPage.vue'
import CartPage from '../pages/CartPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import AdminProductsPage from '../pages/admin/AdminProductsPage.vue'
import AddProductPage from '../pages/admin/AddProductPage.vue'
import EditProductPage from '../pages/admin/EditProductPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import PaymentPage from '../pages/PaymentPage.vue'

const routes = [
  // Public routes
  { path: '/', component: ProductsPage },
  { path: '/products', redirect: '/' },
  { path: '/products/:id', component: ProductDetailPage },
  { path: '/cart', component: CartPage },
  { path: '/checkout',component: CheckoutPage, meta: { requiresAuth: true } },
  { path: '/payment/:orderId', component: PaymentPage, meta: { requiresAuth: true } },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
 
  // Protected admin routes
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

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth) {
    if (!authStore.isLoggedIn) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }

    const allowedRoles = to.meta.roles || []

    if (allowedRoles.length > 0 && !allowedRoles.includes(authStore.role)) {
      return next('/')
    }
  }

  next()
})


export default router