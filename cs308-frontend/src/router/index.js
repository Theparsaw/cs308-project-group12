import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/auth'

// Public pages
import ProductsPage from '../pages/ProductsPage.vue'
import ProductDetailPage from '../pages/ProductDetailPage.vue'
import CartPage from '../pages/CartPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import PaymentPage from '../pages/PaymentPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
// Admin layout + pages
import AdminLayout from '../components/admin/AdminLayout.vue'
import AdminProductsPage from '../pages/admin/AdminProductsPage.vue'
import AddProductPage from '../pages/admin/AddProductPage.vue'
import EditProductPage from '../pages/admin/EditProductPage.vue'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.vue'
import AdminReviewsPage from '../pages/admin/AdminReviewsPage.vue'
import AdminStockPage from '../pages/admin/AdminStockPage.vue'

const adminMeta = {
  requiresAuth: true,
  roles: ['sales_manager', 'product_manager'],
}

const routes = [
  // Public routes
  { path: '/', component: ProductsPage },
  { path: '/products', redirect: '/' },
  { path: '/products/:id', component: ProductDetailPage },
  { path: '/cart', component: CartPage },
  { path: '/checkout', component: CheckoutPage, meta: { requiresAuth: true } },
  { path: '/payment/:orderId', component: PaymentPage, meta: { requiresAuth: true } },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
  // Admin routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: adminMeta,
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        component: AdminDashboardPage,
        meta: adminMeta,
      },
      {
        path: 'products',
        component: AdminProductsPage,
        meta: adminMeta,
      },
      {
        path: 'products/add',
        component: AddProductPage,
        meta: adminMeta,
      },
      {
        path: 'products/edit/:id',
        component: EditProductPage,
        meta: adminMeta,
      },
      {
        path: 'reviews',
        component: AdminReviewsPage,
        meta: adminMeta,
      },
      {
        path: 'stock',
        component: AdminStockPage,
        meta: adminMeta,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth) {
    if (!authStore.isLoggedIn) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath },
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