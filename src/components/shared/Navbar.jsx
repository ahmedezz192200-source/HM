import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import Logo from './Logo'
import { CATEGORIES } from '../../constants/categories'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar({ search, onSearch }) {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const categories = CATEGORIES.filter((category) => category !== 'جميع المنتجات')
  const selectedCategory = new URLSearchParams(location.search).get('category')
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button className="rounded-lg p-2 md:hidden" aria-label="القائمة" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <Link to="/"><Logo /></Link>
        <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 md:flex">
          <Search size={18} className="text-gray-400" />
          <input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(event) => onSearch?.(event.target.value)} placeholder="ابحث عن منتج..." />
        </div>
        <nav aria-label="التصنيفات" className="hidden shrink-0 items-center gap-4 whitespace-nowrap text-sm text-gray-600 xl:flex">
          {categories.slice(0, 3).map((item) => <Link key={item} to={`/?category=${encodeURIComponent(item)}`} className="hover:text-primary">{item}</Link>)}
        </nav>
        <div className="mr-auto flex items-center gap-1">
          <Link to="/favorites" className="rounded-lg p-2 text-gray-600 hover:bg-gray-50" aria-label="المفضلة"><Heart size={19} /></Link>
          <Link to="/cart" className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-50" aria-label="السلة">
            <ShoppingBag size={19} />{count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] text-white">{count}</span>}
          </Link>
          {user ? <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfile((visible) => !visible)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
              aria-label="الحساب"
              aria-expanded={showProfile}
              aria-haspopup="menu"
            >
              <UserRound size={19} />
            </button>
            {showProfile && <div role="menu" className="absolute left-0 top-10 z-40 w-44 rounded-xl border bg-white p-2 shadow-lg">
              <p className="truncate px-2 py-2 text-sm font-bold">{user.name}</p>
              <Link role="menuitem" onClick={() => setShowProfile(false)} className="block rounded-lg px-2 py-2 text-sm hover:bg-gray-50" to={user.role === 'admin' ? '/admin' : '/profile'}>حسابي</Link>
              <button role="menuitem" className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50" onClick={() => { setShowProfile(false); logout(); navigate('/login') }}><LogOut size={15} /> تسجيل الخروج</button>
            </div>}
          </div> : <Link className="rounded-lg px-3 py-2 text-sm text-primary" to="/login">دخول</Link>}
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-2 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(event) => onSearch?.(event.target.value)} placeholder="ابحث عن منتج..." />
        </div>
      </div>
      <nav aria-label="تصفح التصنيفات" className="flex gap-5 overflow-x-auto border-t border-gray-100 px-4 py-2.5 text-sm text-gray-600 xl:hidden">
        {categories.map((item) => (
          <Link
            key={item}
            to={`/?category=${encodeURIComponent(item)}`}
            className={`shrink-0 whitespace-nowrap transition hover:text-primary ${selectedCategory === item ? 'font-bold text-primary' : ''}`}
          >
            {item}
          </Link>
        ))}
      </nav>
      {open && <div className="border-t bg-white p-4 md:hidden">
        <div className="flex flex-wrap gap-3">{categories.map((item) => <Link key={item} onClick={() => setOpen(false)} to={`/?category=${encodeURIComponent(item)}`} className="text-sm">{item}</Link>)}</div>
      </div>}
    </header>
  )
}
