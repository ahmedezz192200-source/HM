import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Boxes, ClipboardList, FileSpreadsheet, FileText, Layers3, PackageX, Users, ScrollText, Bell } from 'lucide-react'
import Logo from '../components/shared/Logo'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
const links = [
  ['لوحة التحكم','/admin',BarChart3], ['العملاء','/admin/users',Users], ['المنتجات','/admin/products',Boxes],
  ['التصنيفات','/admin/categories',Layers3], ['استيراد Excel','/admin/import',FileSpreadsheet],
  ['الطلبات','/admin/orders',ClipboardList], ['الأسعار','/admin/pricing',FileText],
  ['سجل التعديلات','/admin/audit',ScrollText], ['الإشعارات','/admin/notifications',Bell], ['الأصناف المستثناة','/admin/excluded-products',PackageX],
]
export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return <div className="min-h-screen bg-gray-50 md:flex">
    <aside className="flex flex-col border-b bg-white p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-hidden md:border-b-0 md:border-l">
      <div className="flex items-center justify-between md:block"><Logo /><span className="mr-2 text-sm font-bold text-primary">لوحة الإدارة</span></div>
      <nav aria-label="قائمة الإدارة" className="mt-5 flex max-h-[calc(100vh-150px)] flex-col gap-2 overflow-y-auto overscroll-contain md:min-h-0 md:max-h-none md:flex-1">
        {links.map(([label,to,Icon]) => <NavLink key={to} to={to} end={to === '/admin'} className={({isActive}) => `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-primary/10 font-bold text-primary-dark' : 'text-gray-600 hover:bg-gray-50'}`}><Icon size={17} />{label}</NavLink>)}
      </nav>
      <button onClick={() => { logout(); navigate('/login') }} className="mt-3 shrink-0 text-right text-sm text-rose-600">تسجيل الخروج</button>
    </aside>
    <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
  </div>
}
