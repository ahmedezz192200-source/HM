import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ClientLayout from './layouts/ClientLayout'
import AdminLayout from './layouts/AdminLayout'
import AuthLayout from './layouts/AuthLayout'
import { ChangePasswordPage, ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/auth/AuthPages'
import CatalogPage from './pages/client/CatalogPage'
import AdminPage from './pages/admin/AdminPage'
import { CartPage, CheckoutPage, ExportPricesPage, FavoritesPage, InvoicePage, OrdersPage, ProductDetailPage, ProfilePage } from './pages/client/ClientPages'

function RequireClient() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.forcePasswordChange && location.pathname !== '/change-password') return <Navigate to="/change-password" replace />
  return <Outlet />
}
function RequireAdmin() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />
}
function PasswordChangeGuard() {
  const { user } = useAuth()
  return user ? <ChangePasswordPage /> : <Navigate to="/login" replace />
}

export default function App() {
  return <Routes>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Route>
    <Route path="/change-password" element={<AuthLayout />}>
      <Route index element={<PasswordChangeGuard />} />
    </Route>
    <Route element={<RequireAdmin />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPage />} />
        {['users','products','categories','import','orders','pricing','audit','notifications','excluded-products'].map(path=><Route key={path} path={path} element={<AdminPage/>}/>)}
      </Route>
    </Route>
    <Route element={<RequireClient />}>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId/invoice" element={<InvoicePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/export-prices" element={<ExportPricesPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
