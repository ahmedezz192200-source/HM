import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ChevronLeft, ChevronRight, FileDown, Minus, Plus, Printer, ShoppingBag, Trash2, UserRound } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { usePricing } from '../../context/PricingContext'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../constants/tiers'
import { mockOrders } from '../../data/mockOrders'
import { mockApi } from '../../services/mockApi'
import { useNotifications } from '../../context/NotificationContext'
import ProductCard from '../../components/shared/ProductCard'
import ProductImage from '../../components/shared/ProductImage'
import toast from 'react-hot-toast'
import logoUrl from '../../assets/Turquoise Circular AM Monogram.png'
import { getStockLabel, isOutOfStock } from '../../utils/inventory'
import { WHATSAPP_NUMBER } from '../../constants/contact'

const statuses = { pending:'قيد المراجعة', confirmed:'تم التأكيد', shipped:'تم الشحن', delivered:'تم التسليم', cancelled:'ملغي' }
const getProducts = (seed = []) => {
  const storedProducts = JSON.parse(localStorage.getItem('nour_products') || 'null')
  return Array.isArray(storedProducts) ? storedProducts : (Array.isArray(seed) ? seed : [])
}

export function CartPage() {
  const { items, updateQuantity, total } = useCart()
  const { getPrice } = usePricing()
  const products = getProducts()
  return <section><h1 className="mb-6 text-2xl font-extrabold">سلة المشتريات</h1>
    {!items.length ? <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-soft sm:px-10">
      <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><ShoppingBag size={30} /></span>
      <h2 className="text-xl font-bold">سلتك فارغة حالياً</h2>
      <p className="mx-auto mb-6 mt-2 max-w-md text-sm leading-6 text-gray-500">تصفح المنتجات وأضف احتياجاتك إلى السلة، وستظهر هنا لمراجعتها قبل إتمام الطلب.</p>
      <Link className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-dark" to="/">تصفح المنتجات</Link>
    </div>
      : <div className="grid gap-5 lg:grid-cols-[1fr_320px]">                  <div className="space-y-3">{items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft"><ProductImage src={item.images?.[0]} alt={item.name} className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><h3 className="font-bold">{item.name}</h3><p className="text-sm text-gray-500">{formatCurrency(getPrice(products.find((product)=>product.id===item.id)||item))}</p></div><div className="flex items-center gap-2"><button onClick={() => updateQuantity(item.id,item.quantity-1)} className="rounded-lg border p-1"><Minus size={15}/></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id,item.quantity+1)} className="rounded-lg border p-1"><Plus size={15}/></button></div><button onClick={() => updateQuantity(item.id,0)} aria-label="حذف المنتج" className="p-2 text-rose-500"><Trash2 size={18}/></button></div>)}</div>
      <aside className="h-fit rounded-2xl bg-white p-5 shadow-soft"><h2 className="mb-4 font-bold">ملخص الطلب</h2><div className="flex justify-between text-sm"><span>الإجمالي</span><b>{formatCurrency(total)}</b></div><p className="mt-2 text-xs text-gray-500">لا توجد ضرائب أو حد أدنى للطلب.</p><Link to="/checkout" className="mt-5 block rounded-xl bg-primary p-3 text-center font-bold text-white hover:bg-primary-dark">متابعة إلى إتمام الطلب</Link></aside></div>}
  </section>
}

export function CheckoutPage() {
  const { items, total, clear } = useCart()
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { getPrice } = usePricing()
  const products = getProducts()
  const submit = (event) => {
    event.preventDefault()
    if (!items.length) { toast.error('السلة فارغة'); return }
    if (address.trim().length < 8) { toast.error('يرجى إدخال عنوان توصيل كامل'); return }
    const order = { id:`ORD-${Date.now()}`, clientId:user.id, clientName:user.name, status:'pending', total, createdAt:new Date().toISOString().slice(0,10), address, notes, items:items.map((item)=>({productId:item.id,name:item.name,quantity:item.quantity,unitPrice:getPrice(products.find((product)=>product.id===item.id)||item)})) }
    const orders = JSON.parse(localStorage.getItem('nour_orders') || 'null') || mockOrders
    localStorage.setItem('nour_orders', JSON.stringify([order,...orders]))
    clear(); addNotification(`طلب جديد من ${user.name}`, { audience: 'admin' }); toast.success('تم إرسال طلبك بنجاح'); navigate('/orders')
  }
  return <section className="checkout-enter mx-auto max-w-2xl">
    <header className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-l from-primary/15 to-white p-5">
      <img src={logoUrl} alt="شعار AM" className="checkout-logo h-16 w-16 object-contain" />
      <div><p className="text-sm font-bold text-primary-dark">خطوة أخيرة</p><h1 className="mt-1 text-2xl font-extrabold">إتمام الطلب</h1><p className="mt-1 text-sm text-gray-500">أدخل عنوان التوصيل لمراجعة طلبك وإرساله.</p></div>
    </header>
    <div className="mb-4 flex items-center gap-3 text-sm text-gray-500"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">١</span><span className="font-bold text-ink">بيانات التوصيل</span><span className="h-px flex-1 bg-gray-200" /><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">٢</span><span>تأكيد الطلب</span></div>
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-soft">
      <label className="block text-sm font-bold">عنوان التوصيل<textarea value={address} onChange={(e)=>setAddress(e.target.value)} rows="3" required className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="المدينة، المنطقة، الشارع، رقم العقار..." /></label>
      <label className="block text-sm font-bold">ملاحظات إضافية (اختياري)<textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows="2" className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
      <div className="flex justify-between border-t pt-4 font-bold"><span>الإجمالي</span><span>{formatCurrency(total)}</span></div><button className="w-full rounded-xl bg-primary p-3 font-bold text-white transition hover:bg-primary-dark">تأكيد الطلب</button>
    </form>
  </section>
}

export function OrdersPage() {
  const { user } = useAuth()
  const orders = (JSON.parse(localStorage.getItem('nour_orders') || 'null') || mockOrders).filter((order) => order.clientId === user.id)
  return <section><h1 className="mb-6 text-2xl font-extrabold">طلباتي</h1>{orders.length ? <div className="overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full text-right text-sm"><thead className="bg-gray-50"><tr>{['رقم الطلب','التاريخ','الحالة','الإجمالي','المنتجات','الفاتورة'].map((x)=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{orders.map((order)=><tr key={order.id} className="border-t"><td className="p-4 font-bold">{order.id}</td><td className="p-4">{order.createdAt}</td><td className="p-4">{statuses[order.status] || order.status}</td><td className="p-4">{formatCurrency(order.total)}</td><td className="p-4">{order.items?.length || 0}</td><td className="p-4">{['confirmed','shipped','delivered'].includes(order.status) ? <Link className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-primary/10 px-3 py-2 font-bold text-primary-dark" to={`/orders/${order.id}/invoice`}><FileDown size={15}/>عرض الفاتورة</Link> : <span className="text-xs text-gray-400">بعد تأكيد الطلب</span>}</td></tr>)}</tbody></table></div> : <div className="rounded-xl bg-white p-10 text-center text-gray-500">لا توجد طلبات حتى الآن.</div>}</section>
}

export function InvoicePage() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const orders = JSON.parse(localStorage.getItem('nour_orders') || 'null') || mockOrders
  const order = orders.find((item) => item.id === orderId && item.clientId === user.id)
  const canInvoice = order && ['confirmed', 'shipped', 'delivered'].includes(order.status)
  if (!canInvoice) return <section className="rounded-2xl bg-white p-10 text-center shadow-soft"><h1 className="text-xl font-bold">الفاتورة غير متاحة حالياً</h1><p className="mt-2 text-sm text-gray-500">ستظهر الفاتورة بعد تأكيد الطلب.</p><Link className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-white" to="/orders">العودة إلى طلباتي</Link></section>
  const invoiceNumber = order.invoiceNumber || `INV-${order.id}`
  const orderItems = order.items || []
  return <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-soft sm:p-10">
    <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3"><Link to="/orders" className="text-sm font-bold text-primary-dark">العودة إلى الطلبات</Link><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-white"><Printer size={17}/>طباعة / حفظ PDF</button></div>
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
      <div className="flex items-center gap-3"><img src={logoUrl} alt="شعار AM" className="h-16 w-16 object-contain"/><div><h1 className="text-2xl font-extrabold">فاتورة مبيعات</h1><p className="mt-1 text-sm text-gray-500">H&amp;M Cosmatic.com</p></div></div>
      <div className="text-sm"><p><span className="text-gray-500">رقم الفاتورة:</span> <b>{invoiceNumber}</b></p><p className="mt-1"><span className="text-gray-500">التاريخ:</span> {order.confirmedAt || order.createdAt}</p></div>
    </div>
    <div className="grid gap-4 border-b py-5 text-sm sm:grid-cols-2"><div><p className="text-gray-500">فاتورة إلى</p><p className="mt-1 font-bold">{order.clientName || user.name}</p><p className="mt-1">{order.address || '—'}</p></div><div><p className="text-gray-500">حالة الطلب</p><p className="mt-1 inline-flex items-center gap-1 font-bold text-emerald-700"><CheckCircle2 size={16}/>{statuses[order.status] || order.status}</p><p className="mt-1 text-gray-500">رقم الطلب: {order.id}</p></div></div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[480px] text-right text-sm"><thead className="bg-gray-50"><tr>{['المنتج','الكمية','سعر الوحدة','الإجمالي'].map((label)=><th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{orderItems.map((item,index)=><tr key={`${item.productId||item.name}-${index}`} className="border-t"><td className="p-3 font-semibold">{item.name}</td><td className="p-3">{item.quantity}</td><td className="p-3">{formatCurrency(item.unitPrice)}</td><td className="p-3">{formatCurrency(Number(item.unitPrice||0)*Number(item.quantity||0))}</td></tr>)}</tbody></table></div>
    <div className="mt-5 flex justify-end"><div className="w-full max-w-xs border-t pt-4"><div className="flex justify-between text-sm"><span>الإجمالي قبل الضريبة</span><span>{formatCurrency(order.total)}</span></div><div className="mt-2 flex justify-between text-sm"><span>الضريبة</span><span>{formatCurrency(0)}</span></div><div className="mt-3 flex justify-between border-t pt-3 text-lg font-extrabold"><span>الإجمالي المستحق</span><span>{formatCurrency(order.total)}</span></div></div></div>
    <p className="mt-8 border-t pt-4 text-center text-sm text-gray-500">شكراً لثقتكم بنا</p>
  </section>
}

export function ProfilePage() {
  const { user } = useAuth()
  return <section className="mx-auto max-w-2xl"><h1 className="mb-6 text-2xl font-extrabold">الملف الشخصي</h1><div className="rounded-2xl bg-white p-6 shadow-soft"><div className="mb-5 flex items-center gap-3"><div className="rounded-full bg-primary/10 p-3 text-primary"><UserRound /></div><div><h2 className="font-bold">{user.name}</h2><p className="text-sm text-gray-500">{user.email}</p></div></div><dl className="grid gap-4 border-t pt-4 text-sm sm:grid-cols-2"><div><dt className="text-gray-500">رقم الهاتف</dt><dd className="mt-1 font-semibold">{user.phone}</dd></div><div><dt className="text-gray-500">تسعير مخصص لنشاطك</dt><dd className="mt-1 font-semibold">يتم تحديثه بواسطة الإدارة</dd></div></dl>
    <div className="mt-6 flex flex-wrap gap-2"><a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أرجو تغيير الشريحة السعرية')}`} target="_blank" rel="noreferrer" className="inline-flex rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary-dark">تواصل عبر واتساب لتغيير الشريحة</a><Link to="/export-prices" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"><FileDown size={16}/>تصدير قائمة الأسعار</Link></div>
  </div></section>
}

export function FavoritesPage() {
  const [ids, setIds] = useState(()=>JSON.parse(localStorage.getItem('nour_favorites') || '[]'))
  const {data:seed=[]}=useQuery({queryKey:['products'],queryFn:mockApi.products})
  const products = getProducts(seed).filter((item)=>item.published&&ids.includes(item.id))
  const remove = (id)=>{const next=ids.filter((item)=>item!==id);setIds(next);localStorage.setItem('nour_favorites',JSON.stringify(next))}
  return <section><h1 className="mb-6 text-2xl font-extrabold">المفضلة</h1>{products.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{products.map((product)=><ProductCard key={product.id} product={product} favorite onFavorite={remove}/>)}</div> : <p className="rounded-xl bg-white p-8 text-center text-gray-500">لم تضف منتجات للمفضلة بعد.</p>}</section>
}

export function ProductDetailPage() {
  const { productId }=useParams()
  const [imageIndex,setImageIndex]=useState(0)
  useEffect(() => { window.scrollTo(0, 0) }, [productId])
  const {data:seed=[],isLoading}=useQuery({queryKey:['products'],queryFn:mockApi.products})
  const product=getProducts(seed).find(item=>item.id===productId&&item.published)
  const {getPrice}=usePricing()
  const {add}=useCart()
  if(isLoading)return <div className="h-96 animate-pulse rounded-2xl bg-gray-200"/>
  if(!product)return <div className="rounded-xl bg-white p-10 text-center">المنتج غير موجود. <Link className="text-primary-dark" to="/">العودة للمنتجات</Link></div>
  return <div className="space-y-6">
    <section className="grid gap-7 rounded-2xl bg-white p-5 shadow-soft md:grid-cols-2 md:p-8">
      <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl bg-gray-50">
        <ProductImage src={product.images[imageIndex]} alt={product.name} className="h-full w-full object-contain p-4"/>
        {product.images.length>1&&<><button onClick={()=>setImageIndex((imageIndex+product.images.length-1)%product.images.length)} aria-label="الصورة السابقة" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"><ChevronRight size={20}/></button><button onClick={()=>setImageIndex((imageIndex+1)%product.images.length)} aria-label="الصورة التالية" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"><ChevronLeft size={20}/></button><div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">{product.images.map((image,index)=><button key={image} aria-label={`الصورة ${index+1}`} onClick={()=>setImageIndex(index)} className={`h-2 w-2 rounded-full ${index===imageIndex?'bg-primary':'bg-white'}`}/>)}</div></>}
      </div>
      <div className="flex flex-col justify-center"><p className="text-sm font-bold text-primary">{product.category}</p><h1 className="mt-2 text-3xl font-extrabold">{product.name}</h1><div className="mt-6 space-y-2"><p className="text-xl font-extrabold">{formatCurrency(getPrice(product))} <span className="text-sm font-normal text-gray-500">سعر القطعة</span></p><p className="text-sm text-gray-500">{formatCurrency(product.consumerPrice)} سعر المستهلك</p></div><p className={`mt-4 text-sm ${product.stock!==null&&product.stock<5?'text-amber-700':'text-emerald-700'}`}>{getStockLabel(product)}</p><button disabled={isOutOfStock(product)} onClick={()=>{add(product);toast.success('تمت إضافة المنتج إلى السلة')}} className="mt-6 rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary-dark disabled:bg-gray-300">أضف إلى السلة</button></div>
    </section>
    <section className="rounded-2xl bg-white p-6 shadow-soft sm:p-8"><h2 className="text-lg font-extrabold">وصف المنتج</h2><p className="mt-4 whitespace-pre-line text-sm leading-8 text-gray-600">{product.description || product.shortDescription || 'لا يتوفر وصف إضافي لهذا المنتج.'}</p></section>
  </div>
}

export function ExportPricesPage() {
  const { user }=useAuth()
  const { getPrice }=usePricing()
  const {data:seed=[],isLoading}=useQuery({queryKey:['products'],queryFn:mockApi.products})
  const [exportingPdf,setExportingPdf]=useState(false)
  const [pdfProgress,setPdfProgress]=useState(0)
  const [pdfDownloadUrl,setPdfDownloadUrl]=useState(null)
  useEffect(()=>()=>{if(pdfDownloadUrl)URL.revokeObjectURL(pdfDownloadUrl)},[pdfDownloadUrl])
  const products=getProducts(seed).filter((product)=>product.published)
  const exportExcel=async()=>{
    const XLSX=await import('xlsx')
    const ws=XLSX.utils.aoa_to_sheet([
      ['H&M Cosmatic.com | قائمة الأسعار'],
      [`اسم الشركة: ${user.name}`],
      [`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`],
      ['رمز المنتج SKU','اسم المنتج','سعر القطعة (ج.م)','سعر المستهلك (ج.م)','الوحدة'],
      ...products.map(p=>[p.sku,p.name,getPrice(p),p.consumerPrice,p.unit]),
    ])
    ws['!views']=[{rightToLeft:true}]
    ws['!cols']=[{wch:18},{wch:54},{wch:20},{wch:23},{wch:14}]
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'قائمة الأسعار');XLSX.writeFile(wb,'HM-price-list.xlsx')
  }
  const exportPdf=async()=>{
    setExportingPdf(true)
    setPdfProgress(0)
    setPdfDownloadUrl(null)
    try{
      const {default:jsPDF}=await import('jspdf')
      if(products.length===0){
        toast.error('لا توجد منتجات متاحة لتصديرها.')
        return
      }
      await document.fonts.ready
      const pageSize=48
      const pageCount=Math.ceil(products.length/pageSize)
      const date=new Intl.DateTimeFormat('ar-EG').format(new Date())
      const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true})
      const canvas=document.createElement('canvas')
      canvas.width=840
      canvas.height=594
      const context=canvas.getContext('2d')
      if(!context)throw new Error('Canvas 2D context is unavailable')
      context.scale(canvas.width/1122,canvas.height/794)
      const logo=new Image()
      logo.src=logoUrl
      if(!logo.complete)await new Promise((resolve,reject)=>{
        logo.onload=resolve
        logo.onerror=reject
      })
      if(!logo.naturalWidth)throw new Error('The company logo could not be loaded')
      const headers=['رمز المنتج SKU','اسم المنتج','سعر القطعة (ج.م)','سعر المستهلك (ج.م)','الوحدة']
      const columns=[0.12,0.44,0.16,0.18,0.10]
      const numberFormat=new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2})

      for(let pageIndex=0;pageIndex<pageCount;pageIndex+=1){
        context.fillStyle='#ffffff'
        context.fillRect(0,0,canvas.width,canvas.height)
        context.direction='rtl'
        context.textBaseline='middle'
        context.drawImage(logo,1022,20,62,62)
        context.textAlign='right'
        context.fillStyle='#1f2937'
        context.font='800 25px Cairo, Arial, sans-serif'
        context.fillText('قائمة أسعار المنتجات',990,43,920)
        context.fillStyle='#4b5563'
        context.font='400 13px Cairo, Arial, sans-serif'
        context.fillText(`الشركة: ${user.name}    |    التاريخ: ${date}`,990,68,920)
        context.fillStyle='#3DBABF'
        context.fillRect(34,99,1054,2)

        const tableTop=106
        const headerHeight=28
        const rowHeight=12.8
        let right=1088
        context.font='700 11px Cairo, Arial, sans-serif'
        headers.forEach((label,columnIndex)=>{
          const width=1054*columns[columnIndex]
          const left=right-width
          context.fillStyle='#2C9A9F'
          context.fillRect(left,tableTop,width,headerHeight)
          context.strokeStyle='#25888c'
          context.strokeRect(left,tableTop,width,headerHeight)
          context.fillStyle='#ffffff'
          context.textAlign=columnIndex===0?'center':'right'
          context.fillText(label,columnIndex===0?left+width/2:right-6,tableTop+headerHeight/2,width-12)
          right=left
        })

        const pageProducts=products.slice(pageIndex*pageSize,(pageIndex+1)*pageSize)
        pageProducts.forEach((product,rowIndex)=>{
          const top=tableTop+headerHeight+rowIndex*rowHeight
          const values=[product.sku,product.name,numberFormat.format(getPrice(product)),numberFormat.format(product.consumerPrice),product.unit||'قطعة']
          let cellRight=1088
          values.forEach((value,columnIndex)=>{
            const width=1054*columns[columnIndex]
            const left=cellRight-width
            context.fillStyle=rowIndex%2?'#f8fafc':'#ffffff'
            context.fillRect(left,top,width,rowHeight)
            context.strokeStyle='#e5e7eb'
            context.strokeRect(left,top,width,rowHeight)
            context.fillStyle='#1f2937'
            context.font='400 11px Cairo, Arial, sans-serif'
            context.textAlign=columnIndex===0?'center':'right'
            context.fillText(String(value??''),columnIndex===0?left+width/2:cellRight-6,top+rowHeight/2,width-12)
            cellRight=left
          })
        })

        context.strokeStyle='#e5e7eb'
        context.beginPath()
        context.moveTo(34,760)
        context.lineTo(1088,760)
        context.stroke()
        context.fillStyle='#6b7280'
        context.font='400 11px Cairo, Arial, sans-serif'
        context.textAlign='center'
        context.fillText(`H&M Cosmatic.com    •    صفحة ${pageIndex+1} من ${pageCount}`,561,778)

        if(pageIndex>0)doc.addPage()
        doc.addImage(canvas.toDataURL('image/jpeg',0.82),'JPEG',0,0,297,210,undefined,'FAST')
        setPdfProgress(Math.round(((pageIndex+1)/pageCount)*100))
        if((pageIndex+1)%5===0||pageIndex===pageCount-1)await new Promise(resolve=>setTimeout(resolve,0))
      }
      const pdfUrl=URL.createObjectURL(doc.output('blob'))
      setPdfDownloadUrl(pdfUrl)
      toast.success('تم تجهيز ملف PDF. اضغط على رابط التنزيل لحفظه.')
    }catch(error){console.error(error);toast.error('تعذر إنشاء ملف PDF. حاول مرة أخرى.')}
    finally{setExportingPdf(false);setPdfProgress(0)}
  }
  return <section className="mx-auto max-w-3xl"><h1 className="mb-3 text-2xl font-extrabold">تصدير قائمة الأسعار</h1><p className="mb-6 text-sm text-gray-500">ستتضمن القائمة الأسعار الخاصة بحسابك فقط واسم الشركة والتاريخ. يدعم الملف العربي واتجاه الكتابة من اليمين إلى اليسار.</p><div className="flex flex-wrap gap-3"><button disabled={isLoading} onClick={exportExcel} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:opacity-50"><FileDown size={18}/>تصدير Excel</button><button disabled={isLoading||exportingPdf} onClick={exportPdf} className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold disabled:opacity-50"><FileDown size={18}/>{exportingPdf?`جارٍ تجهيز PDF (${pdfProgress}%)`:'تصدير PDF'}</button>{pdfDownloadUrl&&<a href={pdfDownloadUrl} download="HM-price-list.pdf" className="flex items-center gap-2 rounded-xl bg-primary-dark px-5 py-3 font-bold text-white"><FileDown size={18}/>تنزيل قائمة الأسعار PDF</a>}</div>{exportingPdf&&<p role="status" className="mt-3 text-sm text-gray-600">يتم تجهيز قائمة الأسعار، لا تغلق الصفحة حتى يكتمل التجهيز.</p>}</section>
}
