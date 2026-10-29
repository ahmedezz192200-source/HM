import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, GitCompare, Search, SlidersHorizontal } from 'lucide-react'
import { mockApi } from '../../services/mockApi'
import { CATEGORIES } from '../../constants/categories'
import ProductCard from '../../components/shared/ProductCard'
import Logo from '../../components/shared/Logo'
import toast from 'react-hot-toast'

const getStored = (key, fallback) => JSON.parse(localStorage.getItem(key) || 'null') || fallback
export default function CatalogPage() {
  const { search } = useOutletContext()
  const [params, setParams] = useSearchParams()
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)
  const [pageInput, setPageInput] = useState('')
  const [dataVersion, setDataVersion] = useState(0)
  const [categories, setCategories] = useState(() => getStored('nour_categories', CATEGORIES.filter((item) => item !== 'جميع المنتجات')))
  const [favorites, setFavorites] = useState(() => getStored('nour_favorites', []))
  const [compare, setCompare] = useState(() => getStored('nour_compare', []))
  const { data: seed = [], isLoading, error } = useQuery({ queryKey: ['products'], queryFn: mockApi.products })
  useEffect(() => {
    const refresh = () => {
      setDataVersion((version) => version + 1)
      setCategories(getStored('nour_categories', CATEGORIES.filter((item) => item !== 'جميع المنتجات')))
    }
    window.addEventListener('storage', refresh)
    window.addEventListener('nour-products-updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('nour-products-updated', refresh)
    }
  }, [])
  const products = getStored('nour_products', seed)
  const category = params.get('category') || 'جميع المنتجات'
  const filtered = useMemo(() => products.filter((product) =>
    product.published && (category === 'جميع المنتجات' || product.categories?.includes(category) || product.category === category) &&
    `${product.name} ${product.category} ${product.brand}`.toLowerCase().includes((search || '').trim().toLowerCase())
  ).sort((a, b) => sort === 'price' ? a.prices.list - b.prices.list : a.name.localeCompare(b.name, 'ar')), [products, category, search, sort, dataVersion])
  const pages = Math.max(1, Math.ceil(filtered.length / 12))
  const pageNumbers = Array.from(
    { length: Math.min(3, pages) },
    (_, index) => Math.max(1, Math.min(page - 1, pages - 2)) + index,
  )
  const firstVisiblePage = pageNumbers[0]
  const lastVisiblePage = pageNumbers[pageNumbers.length - 1]
  useEffect(() => {
    setPage((current) => Math.min(current, pages))
  }, [pages])
  const goToPage = (event) => {
    event.preventDefault()
    const requestedPage = Number(pageInput)
    if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > pages) {
      toast.error(`أدخل رقم صفحة من 1 إلى ${pages}`)
      return
    }
    setPage(requestedPage)
    setPageInput('')
  }
  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    setFavorites(next); localStorage.setItem('nour_favorites', JSON.stringify(next))
  }
  const toggleCompare = (product) => {
    if (compare.includes(product.id)) {
      const next = compare.filter((id) => id !== product.id); setCompare(next); localStorage.setItem('nour_compare', JSON.stringify(next)); return
    }
    if (compare.length === 4) { toast.error('يمكن مقارنة 4 منتجات كحد أقصى'); return }
    const next = [...compare, product.id]; setCompare(next); localStorage.setItem('nour_compare', JSON.stringify(next)); toast.success('أضيف المنتج للمقارنة')
  }
  if (isLoading) return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:8},(_,i)=><div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-200" />)}</div>
  if (error) return <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">تعذر تحميل المنتجات. حاول تحديث الصفحة.</p>
  return <div>
    <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-l from-primary/20 to-white px-6 py-8 sm:px-10">
      <Logo className="h-12 w-12" /><h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">عناية تستحقها أعمالك</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">اكتشف مجموعة منتجات التجميل والعناية بأسعار مخصصة لنشاطك التجاري.</p>
    </section>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-extrabold">{category} <span className="text-sm font-normal text-gray-500">({filtered.length} منتج)</span></h2>
      <div className="flex items-center gap-2">
        <select value={category} onChange={(event) => { setParams(event.target.value === 'جميع المنتجات' ? {} : {category:event.target.value}); setPage(1) }} className="rounded-xl border bg-white px-3 py-2 text-sm"><option>جميع المنتجات</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option value="name">الاسم</option><option value="price">السعر</option></select>
        <span className="hidden text-gray-400 sm:inline">{sort === 'name' ? <ArrowDownAZ size={18} /> : <ArrowUpAZ size={18} />}</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{filtered.slice((page - 1) * 12, page * 12).map((product) => <div key={product.id} className="relative">
      <ProductCard product={product} favorite={favorites.includes(product.id)} onFavorite={toggleFavorite} />
      <button onClick={() => toggleCompare(product)} title="مقارنة" className={`absolute bottom-20 right-3 rounded-full p-2 ${compare.includes(product.id) ? 'bg-primary text-white' : 'bg-white text-gray-500 shadow'}`}><GitCompare size={15} /></button>
    </div>)}</div>
    {!filtered.length && <div className="rounded-xl bg-white p-10 text-center text-gray-500"><SlidersHorizontal className="mx-auto mb-2" />لا توجد منتجات مطابقة.</div>}
    <nav aria-label="التنقل بين صفحات المنتجات" className="mt-9 flex w-full flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label="الصفحة السابقة"
        disabled={page === 1}
        onClick={() => setPage((current) => Math.max(1, current - 1))}
        className="flex h-10 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={17} />
        <span className="hidden sm:inline">السابق</span>
      </button>
      <div className="flex items-center gap-1" dir="ltr">
        {firstVisiblePage > 1 && (
          <>
            <button
              type="button"
              aria-label="الصفحة 1"
              onClick={() => setPage(1)}
              className="h-9 min-w-8 rounded-xl px-1 text-sm font-bold text-gray-500 transition hover:bg-primary/10 hover:text-primary-dark sm:h-10 sm:min-w-10 sm:px-2"
            >
              1
            </button>
            {firstVisiblePage > 2 && <span aria-hidden="true" className="px-1 text-gray-400">…</span>}
          </>
        )}
        {pageNumbers.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            aria-label={`الصفحة ${pageNumber}`}
            aria-current={pageNumber === page ? 'page' : undefined}
            onClick={() => setPage(pageNumber)}
            className={`h-9 min-w-8 rounded-xl px-1 text-sm font-bold transition sm:h-10 sm:min-w-10 sm:px-2 ${
              pageNumber === page
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-primary/10 hover:text-primary-dark'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        {lastVisiblePage < pages && (
          <>
            {lastVisiblePage < pages - 1 && <span aria-hidden="true" className="px-1 text-gray-400">…</span>}
            <button
              type="button"
              aria-label={`الصفحة ${pages}`}
              onClick={() => setPage(pages)}
              className="h-9 min-w-8 rounded-xl px-1 text-sm font-bold text-gray-500 transition hover:bg-primary/10 hover:text-primary-dark sm:h-10 sm:min-w-10 sm:px-2"
            >
              {pages}
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        aria-label="الصفحة التالية"
        disabled={page === pages}
        onClick={() => setPage((current) => Math.min(pages, current + 1))}
        className="flex h-10 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="hidden sm:inline">التالي</span>
        <ChevronLeft size={17} />
      </button>
      <span className="mr-1 whitespace-nowrap text-xs text-gray-400 sm:text-sm">{page} من {pages}</span>
      <form onSubmit={goToPage} className="flex h-10 basis-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 sm:mr-2 sm:basis-auto">
        <label htmlFor="page-number" className="sr-only">الانتقال إلى رقم الصفحة</label>
        <input
          id="page-number"
          type="number"
          min="1"
          max={pages}
          value={pageInput}
          onChange={(event) => setPageInput(event.target.value)}
          placeholder="رقم الصفحة"
          className="w-20 bg-transparent px-2 text-center text-xs outline-none sm:w-24 sm:text-sm"
        />
        <button
          type="submit"
          aria-label="اذهب إلى الصفحة"
          className="flex h-full items-center gap-1 bg-gray-50 px-2 text-xs font-semibold text-gray-600 transition hover:bg-primary/10 hover:text-primary-dark sm:px-3"
        >
          <Search size={15} />
          <span className="hidden sm:inline">اذهب</span>
        </button>
      </form>
    </nav>
    {compare.length > 0 && <a href="/compare" className="fixed bottom-5 left-5 z-20 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-lg">قارن المنتجات ({compare.length})</a>}
  </div>
}
