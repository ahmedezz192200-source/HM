import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePricing } from './PricingContext'

const CartContext = createContext(null)
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('nour_cart') || '[]'))
  const [productsVersion, setProductsVersion] = useState(0)
  const { getPrice } = usePricing()
  useEffect(() => localStorage.setItem('nour_cart', JSON.stringify(items)), [items])
  useEffect(() => {
    const refresh = () => setProductsVersion((value) => value + 1)
    window.addEventListener('storage', refresh)
    window.addEventListener('nour-products-updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('nour-products-updated', refresh)
    }
  }, [])
  const products = JSON.parse(localStorage.getItem('nour_products') || 'null') || []
  const currentPrice = (item) => getPrice(products.find((product) => product.id === item.id) || item)
  const add = (product) => setItems((current) => {
    const existing = current.find((entry) => entry.id === product.id)
    return existing
      ? current.map((entry) => entry.id === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry)
      : [...current, { ...product, quantity: 1 }]
  })
  const updateQuantity = (id, quantity) => setItems((current) =>
    quantity <= 0 ? current.filter((item) => item.id !== id)
      : current.map((item) => item.id === id ? { ...item, quantity: Number(quantity) } : item))
  const clear = () => setItems([])
  const value = useMemo(() => ({
    items, add, updateQuantity, clear, count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + currentPrice(item) * item.quantity, 0),
  }), [items, getPrice, productsVersion])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext)
