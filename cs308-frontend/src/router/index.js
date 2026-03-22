import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ProductsPage from '../pages/ProductsPage.vue'
import ProductDetailPage from '../pages/ProductDetailPage.vue'
import AdminProductsPage from '../pages/admin/AdminProductsPage.vue'
import AddProductPage from '../pages/admin/AddProductPage.vue'
import EditProductPage from '../pages/admin/EditProductPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/products', component: ProductsPage },
  { path: '/products/:id', component: ProductDetailPage },
  { path: '/admin/products', component: AdminProductsPage },
  { path: '/admin/products/add', component: AddProductPage },
  { path: '/admin/products/edit/:id', component: EditProductPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router