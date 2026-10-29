import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, Phone } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return <footer className="mt-14 border-t bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:grid-cols-2 lg:grid-cols-4">
      <div><Logo /><p className="mt-3 max-w-xs text-sm leading-7 text-gray-500">بوابتك الموثوقة لتوريد مستحضرات التجميل والعناية للشركات والمتاجر.</p></div>
      <div><h3 className="mb-3 font-bold">روابط سريعة</h3><div className="grid gap-2 text-sm text-gray-500"><Link to="/">المنتجات</Link><Link to="/orders">طلباتي</Link><Link to="/profile">حسابي</Link></div></div>
      <div><h3 className="mb-3 font-bold">تواصل معنا</h3><div className="grid gap-2 text-sm text-gray-500"><span className="flex gap-2"><Phone size={16} /> 01000000000</span><span className="flex gap-2"><Mail size={16} /> info@nour.com</span></div></div>
      <div><h3 className="mb-3 font-bold">تابعنا</h3><div className="flex gap-3 text-primary"><a href="https://instagram.com" aria-label="Instagram"><Instagram /></a><a href="https://facebook.com" aria-label="Facebook"><Facebook /></a></div></div>
    </div>
    <div className="border-t py-4 text-center text-xs text-gray-400">© {new Date().getFullYear()} نور لمستحضرات التجميل. جميع الحقوق محفوظة.</div>
  </footer>
}
