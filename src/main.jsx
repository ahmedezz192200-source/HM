import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { PricingProvider } from './context/PricingContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import { CATEGORIES } from './constants/categories'
import './index.css'

const catalogVersion = 'csv-2026-10-29-v1'
if (localStorage.getItem('nour_catalog_version') !== catalogVersion) {
  localStorage.removeItem('nour_products')
  localStorage.removeItem('nour_cart')
  localStorage.removeItem('nour_favorites')
  localStorage.removeItem('nour_compare')
  const categories = [...new Set([
    ...CATEGORIES.filter((category) => category !== 'جميع المنتجات'),
  ])]
  localStorage.setItem('nour_categories', JSON.stringify(categories))
  localStorage.setItem('nour_catalog_version', catalogVersion)
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PricingProvider>
          <CartProvider>
            <NotificationProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <App />
                <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
              </BrowserRouter>
            </NotificationProvider>
          </CartProvider>
        </PricingProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
