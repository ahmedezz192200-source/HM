import { Outlet, Link } from 'react-router-dom'
import Logo from '../components/shared/Logo'
export default function AuthLayout() {
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-white to-gray-50 px-4 py-8">
    <div className="w-full max-w-md"><Link to="/" className="mb-6 block text-center"><Logo className="mx-auto h-12 w-12" /></Link><div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft sm:p-8"><Outlet /></div><p className="mt-5 text-center text-xs text-gray-400">© نور لمستحضرات التجميل</p></div>
  </div>
}
