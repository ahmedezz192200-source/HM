import { Link } from 'react-router-dom'
import { Clock3, Facebook, Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import {
  BUSINESS_DESCRIPTION,
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_LINK,
  FACEBOOK_URL,
} from '../../constants/contact'

export default function Footer() {
  return <footer className="mt-14 border-t bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:grid-cols-2 lg:grid-cols-3">
      <div><Logo /><p className="mt-3 max-w-xs text-sm leading-7 text-gray-500">{BUSINESS_DESCRIPTION}</p><p className="mt-1 text-sm text-gray-500">متجر مستلزمات طبية وصيدلانية</p></div>
      <div><h3 className="mb-3 font-bold">روابط سريعة</h3><div className="grid gap-2 text-sm text-gray-500"><Link to="/">المنتجات</Link><Link to="/orders">طلباتي</Link><Link to="/profile">حسابي</Link></div></div>
      <div>
        <h3 className="mb-3 font-bold">تواصل معنا</h3>
        <div className="grid gap-3 text-sm text-gray-500">
          <a href={`tel:${CONTACT_PHONE_LINK}`} className="flex items-center gap-2" dir="ltr"><Phone className="shrink-0" size={16} /> {CONTACT_PHONE}</a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2"><Mail className="shrink-0" size={16} /> <span dir="ltr">{CONTACT_EMAIL}</span></a>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT_ADDRESS)}`} target="_blank" rel="noreferrer" className="flex items-start gap-2"><MapPin className="mt-1 shrink-0" size={16} /> <span>{CONTACT_ADDRESS}</span></a>
          <p className="flex items-center gap-2 text-emerald-700"><Clock3 size={16} /> مفتوح دائمًا</p>
        </div>
        <div className="mt-4"><h4 className="mb-2 text-sm font-bold">تابعنا</h4><a href={FACEBOOK_URL} aria-label="Facebook" target="_blank" rel="noreferrer" className="inline-flex text-primary"><Facebook /></a></div>
      </div>
    </div>
    <div className="border-t py-4 text-center text-xs text-gray-400">© {new Date().getFullYear()} HM. جميع الحقوق محفوظة.</div>
  </footer>
}
