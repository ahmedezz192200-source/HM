import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../constants/tiers'
import { usePricing } from '../../context/PricingContext'
import { useCart } from '../../context/CartContext'
import { getStockLabel, isLowStock, isOutOfStock } from '../../utils/inventory'
import ProductImage from './ProductImage'
import toast from 'react-hot-toast'

export default function ProductCard({ product, favorite, onFavorite }) {
  const { getPrice } = usePricing()
  const { add } = useCart()
  const addToCart = () => {
    if (isOutOfStock(product)) return
    add(product)
    toast.success('تمت إضافة المنتج إلى السلة')
  }
  return <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft transition hover:-translate-y-0.5">
    <div className="relative">
      <Link to={`/products/${product.id}`} className="block aspect-square w-full bg-gray-50">
        <ProductImage src={product.images[0]} alt={product.name} className="h-full w-full object-contain p-3" />
      </Link>
      <button onClick={() => onFavorite(product.id)} aria-label="إضافة للمفضلة" className={`absolute left-3 top-3 rounded-full bg-white p-2 shadow ${favorite ? 'text-rose-500' : 'text-gray-500'}`}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
      {isLowStock(product) && <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800">{getStockLabel(product)}</span>}
      {isOutOfStock(product) && <span className="absolute right-3 top-3 rounded-full bg-gray-800 px-2.5 py-1 text-xs text-white">غير متوفر</span>}
    </div>
    <div className="p-4">
      <p className="text-xs text-primary">{product.category}</p>
      <Link to={`/products/${product.id}`}><h3 className="mt-1 line-clamp-1 font-bold">{product.name}</h3></Link>
      <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">{product.shortDescription}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div><p className="text-sm font-extrabold text-ink">{formatCurrency(getPrice(product))} <span className="text-xs font-normal text-gray-500">سعر القطعة</span></p><p className="mt-1 text-xs text-gray-500">{formatCurrency(product.consumerPrice)} سعر المستهلك</p></div>
        <button disabled={isOutOfStock(product)} onClick={addToCart} className="rounded-xl bg-primary p-2.5 text-white hover:bg-primary-dark disabled:bg-gray-300" aria-label="أضف للسلة"><ShoppingCart size={17} /></button>
      </div>
    </div>
  </article>
}
