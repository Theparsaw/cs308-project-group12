import { describe, it, expect } from 'vitest'

// Mirrors the filteredProducts logic from ProductsPage.vue
function filterProducts(products, selectedCategoryId) {
  if (selectedCategoryId === null || selectedCategoryId === undefined) return products
  return products.filter(p => p.categoryId === selectedCategoryId)
}

const products = [
  { productId: 1, name: 'A', categoryId: 0 },
  { productId: 2, name: 'B', categoryId: 1 },
  { productId: 3, name: 'C', categoryId: 0 },
]

describe('filterProducts', () => {
  it('returns all products when selectedCategoryId is null', () => {
    expect(filterProducts(products, null)).toHaveLength(3)
  })

  it('returns all products when selectedCategoryId is undefined', () => {
    expect(filterProducts(products, undefined)).toHaveLength(3)
  })

  it('filters correctly when categoryId is 0', () => {
    const result = filterProducts(products, 0)
    expect(result).toHaveLength(2)
    expect(result.every(p => p.categoryId === 0)).toBe(true)
  })

  it('filters correctly when categoryId is a non-zero number', () => {
    const result = filterProducts(products, 1)
    expect(result).toHaveLength(1)
    expect(result[0].productId).toBe(2)
  })
})
