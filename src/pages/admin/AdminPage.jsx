import { useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { AlertTriangle, Check, Download, Package, Plus, Save, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { mockApi } from '../../services/mockApi'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { CATEGORIES } from '../../constants/categories'
import { TIERS, formatCurrency } from '../../constants/tiers'
import { mockOrders } from '../../data/mockOrders'
import { isLowStock } from '../../utils/inventory'

const statusNames = { pending:'قيد المراجعة', active:'نشط', suspended:'موقوف', rejected:'مرفوض' }
const orderNames = { pending:'قيد المراجعة', confirmed:'مؤكد', shipped:'تم الشحن', delivered:'تم التسليم', cancelled:'ملغي' }
const getStored = (key, fallback) => JSON.parse(localStorage.getItem(key) || 'null') || fallback
const recordAudit = (entry) => {
  const logs = getStored('nour_audit', [])
  const actor = JSON.parse(localStorage.getItem('nour_user') || 'null')?.name || 'مدير النظام'
  localStorage.setItem('nour_audit', JSON.stringify([{ id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`, actor, date:new Date().toISOString(), ...entry }, ...logs]))
}
const card = 'rounded-2xl border border-gray-100 bg-white p-5 shadow-soft'

function DataTable({ columns, data }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
  return <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-right text-sm">
    <thead className="bg-gray-50">{table.getHeaderGroups().map(group=><tr key={group.id}>{group.headers.map(header=><th key={header.id} className="whitespace-nowrap p-4 font-bold">{flexRender(header.column.columnDef.header,header.getContext())}</th>)}</tr>)}</thead>
    <tbody>{table.getRowModel().rows.map(row=><tr key={row.id} className="border-t">{row.getVisibleCells().map(cell=><td key={cell.id} className="whitespace-nowrap p-3">{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)}</tbody>
  </table></div>
}

function Dashboard({ users, products, orders }) {
  const activeOrders = orders.filter(o=>!['delivered','cancelled'].includes(o.status))
  const lowStock = products.filter(isLowStock)
  const stats = [
    {label:'إجمالي الطلبات',value:orders.length,Icon:Package,to:'/admin/orders',filter:'all'},
    {label:'طلبات تحتاج متابعة',value:activeOrders.length,Icon:AlertTriangle,to:'/admin/orders',filter:'follow-up'},
    {label:'عملاء بانتظار الموافقة',value:users.filter(u=>u.status==='pending').length,Icon:Users,to:'/admin/users',filter:'pending'},
    {label:'مخزون منخفض',value:lowStock.length,Icon:AlertTriangle,to:'/admin/products',filter:'low-stock'},
  ]
  return <><h1 className="mb-6 text-2xl font-extrabold">لوحة التحكم</h1><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({label,value,Icon,to,filter})=><Link key={label} to={`${to}?filter=${filter}`} aria-label={`${label}: ${value}`} className={`${card} block transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary`}><div className="flex justify-between text-gray-500"><span>{label}</span><Icon size={19} className="text-primary"/></div><p className="mt-4 text-3xl font-extrabold">{value}</p><span className="mt-2 block text-xs text-primary-dark">عرض التفاصيل ←</span></Link>)}</div><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className={card}><h2 className="mb-4 font-bold">آخر الطلبات</h2>{orders.slice(0,5).map(o=><div key={o.id} className="flex justify-between border-t py-3 text-sm"><span>{o.id} · {o.clientName}</span><span>{orderNames[o.status]}</span></div>)}</section><section className={card}><h2 className="mb-4 font-bold">مخزون منخفض</h2>{lowStock.slice(0,6).map(p=><div key={p.id} className="flex justify-between border-t py-3 text-sm"><span>{p.name}</span><span className="text-amber-700">{p.stock} قطع</span></div>)}{!lowStock.length&&<p className="text-sm text-gray-500">لا توجد منتجات منخفضة المخزون.</p>}</section></div></>
}

function UsersAdmin({ users, updateClient }) {
  const [searchParams,setSearchParams]=useSearchParams()
  const filter=searchParams.get('filter')
  const visibleUsers=filter==='pending'?users.filter(user=>user.status==='pending'):users
  const { addNotification } = useNotifications()
  const columns = useMemo(()=>[
    {accessorKey:'name',header:'النشاط التجاري'},
    {accessorKey:'email',header:'البريد'},
    {accessorKey:'status',header:'الحالة',cell:({row})=><span className="rounded-full bg-gray-100 px-2 py-1">{statusNames[row.original.status] || row.original.status}</span>},
    {id:'tier',header:'الشريحة السعرية',cell:({row})=><select aria-label={`الشريحة السعرية لـ ${row.original.name}`} value={row.original.tier} onChange={e=>{const old=TIERS.find(t=>t.id===row.original.tier)?.label;const next=TIERS.find(t=>t.id===e.target.value)?.label;updateClient(row.original.id,{tier:e.target.value});recordAudit({entity:row.original.name,field:'الشريحة السعرية',oldValue:old,newValue:next});addNotification(`تم تحديث الشريحة السعرية لحسابك إلى ${next}`,{audience:'client',recipientId:row.original.id});toast.success('تم تحديث الشريحة والأسعار فوراً')}} className="rounded-lg border px-2 py-1">{TIERS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select>},
    {id:'actions',header:'إجراءات',cell:({row})=><div className="flex gap-1">{row.original.status!=='active'&&<button title="موافقة" onClick={()=>{updateClient(row.original.id,{status:'active'});recordAudit({entity:row.original.name,field:'الحالة',oldValue:statusNames[row.original.status],newValue:'نشط'});addNotification('تم اعتماد حسابك ويمكنك الآن تسجيل الدخول',{audience:'client',recipientId:row.original.id});toast.success('تم اعتماد العميل')}} className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Check size={15}/></button>}<button onClick={()=>{const reason=window.prompt('سبب رفض الطلب؟','يرجى استكمال المستندات المطلوبة');if(reason===null)return;updateClient(row.original.id,{status:'rejected',rejectionReason:reason});recordAudit({entity:row.original.name,field:'الحالة',oldValue:statusNames[row.original.status],newValue:`مرفوض: ${reason}`});toast.success('تم رفض الطلب')}} className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-700">رفض</button><button onClick={()=>{const status=row.original.status==='suspended'?'active':'suspended';updateClient(row.original.id,{status});recordAudit({entity:row.original.name,field:'الحالة',oldValue:statusNames[row.original.status],newValue:statusNames[status]});toast.success(status==='active'?'تم تفعيل العميل':'تم إيقاف العميل')}} className="rounded-lg bg-gray-100 px-2 py-1 text-xs">{row.original.status==='suspended'?'تفعيل':'إيقاف'}</button></div>},
  ],[updateClient])
  return <><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{filter==='pending'?'عملاء بانتظار الموافقة':'إدارة العملاء'}</h1>{filter&&<button onClick={()=>setSearchParams({})} className="rounded-lg border bg-white px-3 py-2 text-sm">عرض كل العملاء</button>}</div><p className="mb-4 text-sm text-gray-500">اعتماد الحسابات وتحديد الشريحة السعرية مسؤولية الإدارة فقط. ({visibleUsers.length})</p><DataTable columns={columns} data={visibleUsers}/></>
}

function ProductsAdmin({ products, onSave }) {
  const [searchParams,setSearchParams]=useSearchParams()
  const lowStockOnly=searchParams.get('filter')==='low-stock'
  const [query,setQuery]=useState('')
  const [page,setPage]=useState(1)
  const [draft,setDraft]=useState(null)
  const [adding,setAdding]=useState(false)
  const pageSize=50
  const visible=useMemo(()=>products.filter(p=>(!lowStockOnly||isLowStock(p))&&(p.name.includes(query)||String(p.sku||'').toLowerCase().includes(query.toLowerCase()))),[products,lowStockOnly,query])
  const pageCount=Math.max(1,Math.ceil(visible.length/pageSize))
  const pageProducts=visible.slice((page-1)*pageSize,page*pageSize)
  const saveProduct=(product)=>{
    if(!product.name.trim()){toast.error('اسم المنتج مطلوب');return}
    let next
    if(product.id) next=products.map(p=>p.id===product.id?product:p)
    else next=[{...product,id:`PR-${Date.now()}`,sku:`NR-${Date.now()}`,stock:Number(product.stock)||0,category:product.category||CATEGORIES[0],unit:'قطعة',images:['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=720&q=80'],published:true,available:true,featured:false,prices:{pharmacies:0,wholesale:0,retail:0,list:0,companies:0},consumerPrice:0},...products]
    onSave(next);setDraft(null);setAdding(false);toast.success('تم حفظ المنتج')
  }
  const deleteProduct=(product)=>{if(!window.confirm(`حذف ${product.name}؟`))return;onSave(products.filter(p=>p.id!==product.id));toast.success('تم حذف المنتج')}
  return <><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{lowStockOnly?'منتجات المخزون المنخفض':'إدارة المنتجات'}</h1><div className="flex gap-2">{lowStockOnly&&<button onClick={()=>setSearchParams({})} className="rounded-xl border bg-white px-3 py-2 text-sm">عرض كل المنتجات</button>}<button onClick={()=>{setDraft({name:'',shortDescription:'',stock:0,category:CATEGORIES[0]});setAdding(true)}} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"><Plus size={17}/>إضافة منتج</button></div></div>
    <input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="ابحث باسم المنتج أو SKU" className="mb-4 w-full rounded-xl border bg-white px-4 py-3 sm:max-w-sm"/>
    {(draft||adding)&&<ProductForm product={draft} onChange={setDraft} onCancel={()=>{setDraft(null);setAdding(false)}} onSave={saveProduct}/>}
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500"><span>عرض {visible.length?((page-1)*pageSize+1):0}–{Math.min(page*pageSize,visible.length)} من {visible.length} منتج</span>{!visible.length&&<span>لا توجد منتجات مطابقة.</span>}</div>
    <div className="overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full min-w-[1180px] text-right text-sm"><thead className="bg-gray-50"><tr>{['المنتج','SKU','المخزون',...TIERS.map(t=>t.label),'إجراءات'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{pageProducts.map(p=><tr className="border-t" key={p.id}><td className="p-3 font-semibold">{p.name}</td><td className="p-3">{p.sku}</td><td className="p-3">{p.stock??'غير محدد'}</td>{TIERS.map(t=><td className="p-3" key={t.id}>{formatCurrency(p.prices[t.id])}</td>)}<td className="p-3"><button onClick={()=>{setDraft({...p});setAdding(false)}} className="ml-2 rounded-lg border px-3 py-1.5">تعديل</button><button onClick={()=>deleteProduct(p)} className="rounded-lg bg-rose-50 p-2 text-rose-600" aria-label="حذف"><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>
    {pageCount>1&&<nav aria-label="صفحات المنتجات" className="mt-4 flex items-center justify-center gap-3"><button type="button" disabled={page===1} onClick={()=>setPage(value=>Math.max(1,value-1))} className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40">السابق</button><span className="text-sm text-gray-600">صفحة {page} من {pageCount}</span><button type="button" disabled={page===pageCount} onClick={()=>setPage(value=>Math.min(pageCount,value+1))} className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40">التالي</button></nav>}
  </>
}

function ProductForm({ product, onChange, onCancel, onSave }) {
  const set=(field,value)=>onChange({...product,[field]:value})
  return <form onSubmit={e=>{e.preventDefault();onSave(product)}} className={`${card} mb-5 grid gap-3 sm:grid-cols-2`}>
    <label className="text-sm">اسم المنتج<input required value={product.name} onChange={e=>set('name',e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
    <label className="text-sm">التصنيف<select value={product.category||CATEGORIES[0]} onChange={e=>set('category',e.target.value)} className="mt-1 w-full rounded-lg border p-2">{CATEGORIES.filter(c=>c!=='جميع المنتجات').map(c=><option key={c}>{c}</option>)}</select></label>
    <label className="text-sm">المخزون<input type="number" min="0" value={product.stock} onChange={e=>set('stock',Number(e.target.value))} className="mt-1 w-full rounded-lg border p-2"/></label>
    {TIERS.map(t=><label key={t.id} className="text-sm">سعر البيع - {t.label}<input type="number" min="0" value={product.prices?.[t.id] ?? 0} onChange={e=>onChange({...product,prices:{...(product.prices||{}),[t.id]:Number(e.target.value)}})} className="mt-1 w-full rounded-lg border p-2"/></label>)}
    <div className="flex gap-2 sm:col-span-2"><button className="rounded-lg bg-primary px-4 py-2 font-bold text-white">حفظ</button><button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2">إلغاء</button></div>
  </form>
}

function ImportAdmin({ products, onSave }) {
  const [rows,setRows]=useState([])
  const [errors,setErrors]=useState([])
  const [message,setMessage]=useState('')
  const expected=['المعرف','رمز المنتج SKU','الاسم','وصف قصير','الوصف','تم النشر','هل هي مميزة','متوفر','المخزون','التصنيفات','العلامات التجارية','الصور','سعر التخفيض','السعر الافتراضي']
  const readFile=async(file)=>{
    setMessage('');setErrors([]);setRows([])
    if(file.size>10*1024*1024){setMessage('حجم الملف يتجاوز الحد المسموح (10 ميجابايت).');return}
    try{
      const XLSX=await import('xlsx')
      const workbook=XLSX.read(await file.arrayBuffer(),{type:'array'})
      const sheet=workbook.Sheets[workbook.SheetNames[0]]
      const data=XLSX.utils.sheet_to_json(sheet,{defval:''})
      if(!data.length){setMessage('الملف لا يحتوي على صفوف بيانات.');return}
      if(data.length>5000){setErrors(['الحد الأقصى للاستيراد هو 5000 صف في الملف الواحد.']);return}
      const missing=expected.filter(col=>!Object.hasOwn(data[0],col))
      if(missing.length){setErrors([`أعمدة مطلوبة غير موجودة: ${missing.join('، ')}`]);return}
      const issues=[]
      const mapped=data.map((row,index)=>{
        const name=String(row['الاسم']).trim(),sku=String(row['رمز المنتج SKU']).trim(),stockValue=row['المخزون'],stock=stockValue===''||stockValue==null?null:Number(stockValue),price=Number(row['سعر التخفيض']),consumer=Number(row['السعر الافتراضي'])
        if(!name)issues.push(`الصف ${index+2}: الاسم مطلوب`)
        if(!sku)issues.push(`الصف ${index+2}: رمز SKU مطلوب`)
        if(stock!==null&&(!Number.isFinite(stock)||stock<0))issues.push(`الصف ${index+2}: المخزون يجب أن يكون رقماً غير سالب`)
        if(!Number.isFinite(price)||price<0)issues.push(`الصف ${index+2}: سعر التخفيض غير صحيح`)
        if(!Number.isFinite(consumer)||consumer<0)issues.push(`الصف ${index+2}: السعر الافتراضي غير صحيح`)
        const category=String(row['التصنيفات']||CATEGORIES[0]).split(',')[0].trim()
        // سعر التخفيض هو سعر البيع للعميل؛ والسعر الافتراضي مخصص لسعر المستهلك.
        return {id:String(row['المعرف']||`IMP-${Date.now()}-${index}`),sku,name,shortDescription:String(row['وصف قصير']||''),description:String(row['الوصف']||''),published:!['0','false','لا'].includes(String(row['تم النشر']).toLowerCase()),featured:['1','true','نعم'].includes(String(row['هل هي مميزة']).toLowerCase()),available:!['0','false','لا'].includes(String(row['متوفر']).toLowerCase()),stock:stock!==null&&Number.isFinite(stock)?stock:null,category,categories:String(row['التصنيفات']||CATEGORIES[0]).split(',').map(value=>value.trim()).filter(Boolean),brand:String(row['العلامات التجارية']||''),images:String(row['الصور']||'').split(',').map(s=>s.trim()).filter(Boolean),prices:Object.fromEntries(TIERS.map(t=>[t.id,Number.isFinite(price)?price:0])),consumerPrice:Number.isFinite(consumer)?consumer:0,unit:'قطعة'}
      })
      setRows(mapped);setErrors(issues);setMessage(`تمت قراءة ${mapped.length} صفاً. راجع المعاينة قبل الحفظ.`)
    }catch(error){console.error(error);setMessage('تعذر قراءة ملف Excel. تأكد من صيغة الملف.')}
  }
  const importRows=()=>{
    if(errors.length){toast.error('أصلح أخطاء التحقق قبل الحفظ');return}
    const categories=[...new Set([...getStored('nour_categories',CATEGORIES.filter(c=>c!=='جميع المنتجات')),...rows.flatMap(row=>row.categories)])]
    localStorage.setItem('nour_categories',JSON.stringify(categories))
    onSave([...rows,...products]);setRows([]);setMessage('تم استيراد المنتجات والتصنيفات بنجاح.');toast.success('اكتمل الاستيراد')
  }
  const downloadTemplate=async()=>{const XLSX=await import('xlsx');const ws=XLSX.utils.aoa_to_sheet([expected]);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'المنتجات');XLSX.writeFile(wb,'nour-products-template.xlsx')}
  return <><h1 className="mb-5 text-2xl font-extrabold">استيراد المنتجات من Excel</h1><div className={card}>
    <p className="text-sm leading-7 text-gray-600">ارفع ملف .xlsx أو .xls بالأعمدة المطلوبة. أسعار التخفيض تُستخدم كسعر قطعة، والسعر الافتراضي كسعر المستهلك. تُنشأ التصنيفات الجديدة تلقائياً.</p>
    <div className="my-4 flex flex-wrap gap-3"><label className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">اختيار ملف Excel<input type="file" accept=".xlsx,.xls" className="hidden" onChange={e=>e.target.files?.[0]&&readFile(e.target.files[0])}/></label><button onClick={downloadTemplate} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm"><Download size={16}/>تنزيل قالب الاستيراد</button></div>
    {message&&<p className="mb-3 text-sm">{message}</p>}
    {errors.length>0&&<div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><h2 className="mb-2 font-bold">أخطاء التحقق ({errors.length})</h2>{errors.map((error,i)=><p key={i}>• {error}</p>)}</div>}
    {rows.length>0&&<><div className="max-h-96 overflow-auto rounded-xl border"><table className="w-full min-w-[700px] text-right text-xs"><thead className="sticky top-0 bg-gray-100"><tr>{['SKU','الاسم','التصنيف','المخزون','سعر القطعة','سعر المستهلك'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.id}-${i}`} className="border-t"><td className="p-3">{r.sku}</td><td className="p-3">{r.name}</td><td className="p-3">{r.category}</td><td className="p-3">{r.stock??'غير محدد'}</td><td className="p-3">{r.prices.list}</td><td className="p-3">{r.consumerPrice}</td></tr>)}</tbody></table></div><button disabled={errors.length>0} onClick={importRows} className="mt-4 rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:opacity-50">حفظ المنتجات ({rows.length})</button></>}
  </div></>
}

function CategoriesAdmin() {
  const [categories,setCategories]=useState(()=>getStored('nour_categories',CATEGORIES.filter(c=>c!=='جميع المنتجات')))
  const [value,setValue]=useState('')
  const persist=(next)=>{setCategories(next);localStorage.setItem('nour_categories',JSON.stringify(next));window.dispatchEvent(new Event('nour-products-updated'))}
  return <><h1 className="mb-5 text-2xl font-extrabold">التصنيفات</h1><form onSubmit={e=>{e.preventDefault();if(!value.trim()||categories.includes(value.trim()))return toast.error('التصنيف موجود أو الاسم فارغ');persist([...categories,value.trim()]);setValue('');toast.success('تمت إضافة التصنيف')}} className="mb-5 flex max-w-lg gap-2"><input value={value} onChange={e=>setValue(e.target.value)} placeholder="اسم التصنيف" className="min-w-0 flex-1 rounded-xl border bg-white px-3"/><button className="rounded-xl bg-primary px-4 font-bold text-white">إضافة</button></form><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map(category=><div key={category} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-soft"><span>{category}</span><button onClick={()=>{persist(categories.filter(c=>c!==category));toast.success('تم حذف التصنيف')}} className="text-rose-500" aria-label="حذف التصنيف"><Trash2 size={17}/></button></div>)}</div></>
}

function OrdersAdmin({orders,setOrders}) {
  const [searchParams,setSearchParams]=useSearchParams()
  const filter=searchParams.get('filter')
  const visibleOrders=filter==='follow-up'?orders.filter(order=>!['delivered','cancelled'].includes(order.status)):orders
  const update=(id,status)=>{const order=orders.find(item=>item.id===id);const next=orders.map(o=>o.id===id?{...o,status}:o);setOrders(next);localStorage.setItem('nour_orders',JSON.stringify(next));recordAudit({entity:order?.id||id,field:'حالة الطلب',oldValue:orderNames[order?.status]||order?.status,newValue:orderNames[status]});toast.success('تم تحديث حالة الطلب')}
  return <><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{filter==='follow-up'?'طلبات تحتاج متابعة':'إدارة الطلبات'}</h1>{filter&&<button onClick={()=>setSearchParams({})} className="rounded-lg border bg-white px-3 py-2 text-sm">عرض كل الطلبات</button>}</div><p className="mb-3 text-sm text-gray-500">عدد الطلبات: {visibleOrders.length}</p><div className="overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full min-w-[750px] text-right text-sm"><thead className="bg-gray-50"><tr>{['رقم الطلب','العميل','التاريخ','الإجمالي','الحالة'].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{visibleOrders.map(o=><tr key={o.id} className="border-t"><td className="p-4 font-bold">{o.id}</td><td className="p-4">{o.clientName}</td><td className="p-4">{o.createdAt}</td><td className="p-4">{formatCurrency(o.total)}</td><td className="p-4"><select value={o.status} onChange={e=>update(o.id,e.target.value)} className="rounded-lg border p-2">{Object.entries(orderNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></td></tr>)}</tbody></table></div></>
}

function PricingAdmin({products,onSave}) {
  const [tier,setTier]=useState(TIERS[0].id)
  const [factor,setFactor]=useState(1)
  const {addNotification}=useNotifications()
  const bulk=()=>{const next=products.map(p=>({...p,prices:{...p.prices,[tier]:Math.round(Number(p.prices.list)*Number(factor)*100)/100}}));onSave(next);addNotification('تم تحديث أسعار المنتجات',{audience:'clients'});toast.success('تم تحديث الأسعار')}
  return <><h1 className="mb-5 text-2xl font-extrabold">تعديل الأسعار بالجملة</h1><div className={`${card} max-w-xl`}><p className="mb-4 text-sm text-gray-500">حدد الشريحة ومعامل السعر. سيتم حفظ التعديلات وتسجيلها في سجل المراجعة.</p><label className="mb-4 block text-sm font-bold">الشريحة<select value={tier} onChange={e=>setTier(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{TIERS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></label><label className="mb-5 block text-sm font-bold">معامل سعر القائمة<input type="number" step="0.01" min="0" value={factor} onChange={e=>setFactor(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><button onClick={bulk} className="rounded-xl bg-primary px-5 py-3 font-bold text-white">تحديث أسعار {products.length} منتجاً</button></div></>
}

function AuditAdmin() {
  const logs=getStored('nour_audit',[])
  return <><h1 className="mb-5 text-2xl font-extrabold">سجل التعديلات</h1>{logs.length?<div className="overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full min-w-[650px] text-right text-sm"><thead className="bg-gray-50"><tr>{['التاريخ','المستخدم','العنصر','الحقل','القيمة القديمة','القيمة الجديدة'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{logs.map(log=><tr key={log.id} className="border-t"><td className="p-3">{new Date(log.date).toLocaleString('ar-EG')}</td><td className="p-3">{log.actor}</td><td className="p-3">{log.entity}</td><td className="p-3">{log.field}</td><td className="p-3">{log.oldValue}</td><td className="p-3">{log.newValue}</td></tr>)}</tbody></table></div>:<p className={`${card} text-gray-500`}>لا توجد تعديلات مسجلة بعد.</p>}</>
}

function NotificationsAdmin() {
  const {notifications,markRead}=useNotifications()
  return <><div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-extrabold">إدارة الإشعارات</h1><button onClick={markRead} className="rounded-lg border px-3 py-2 text-sm">تحديد الكل كمقروء</button></div>{notifications.length?notifications.map(n=><div key={n.id} className={`${card} mb-3 flex justify-between`}><span>{n.message}</span><time className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString('ar-EG')}</time></div>):<div className={card}><p className="text-gray-500">لا توجد إشعارات حالياً.</p></div>}</>
}

export default function AdminPage() {
  const location=useLocation()
  const {users,updateClient}=useAuth()
  const queryClient=useQueryClient()
  const {data:seedProducts=[]}=useQuery({queryKey:['products'],queryFn:mockApi.products})
  const products=getStored('nour_products',seedProducts)
  const [orders,setOrders]=useState(()=>getStored('nour_orders',mockOrders))
  const saveProducts=(next)=>{
    const previous=getStored('nour_products',seedProducts)
    const oldById=new Map(previous.map(product=>[product.id,product]))
    const nextById=new Map(next.map(product=>[product.id,product]))
    for(const product of next){
      const old=oldById.get(product.id)
      if(!old){recordAudit({entity:product.name,field:'المنتج',oldValue:'—',newValue:'إضافة منتج'});continue}
      for(const [field,label] of [['name','اسم المنتج'],['category','التصنيف'],['stock','المخزون'],['consumerPrice','سعر المستهلك']]){
        if(old[field]!==product[field])recordAudit({entity:product.name,field:label,oldValue:String(old[field]??''),newValue:String(product[field]??'')})
      }
      for(const tier of TIERS){
        if(old.prices[tier.id]!==product.prices[tier.id]){
          recordAudit({entity:product.name,field:`سعر البيع - ${tier.label}`,oldValue:formatCurrency(old.prices[tier.id]),newValue:formatCurrency(product.prices[tier.id])})
        }
      }
    }
    for(const product of previous){if(!nextById.has(product.id))recordAudit({entity:product.name,field:'المنتج',oldValue:'موجود',newValue:'حذف منتج'})}
    localStorage.setItem('nour_products',JSON.stringify(next));queryClient.setQueryData(['products'],next);window.dispatchEvent(new Event('nour-products-updated'))
  }
  const path=location.pathname.replace('/admin','')||'/'
  if(path==='/users')return <UsersAdmin users={users} updateClient={updateClient}/>
  if(path==='/products')return <ProductsAdmin products={products} onSave={saveProducts}/>
  if(path==='/categories')return <CategoriesAdmin/>
  if(path==='/import')return <ImportAdmin products={products} onSave={saveProducts}/>
  if(path==='/orders')return <OrdersAdmin orders={orders} setOrders={setOrders}/>
  if(path==='/pricing')return <PricingAdmin products={products} onSave={saveProducts}/>
  if(path==='/audit')return <AuditAdmin/>
  if(path==='/notifications')return <NotificationsAdmin/>
  if(path==='/excluded-products')return <><h1 className="mb-5 text-2xl font-extrabold">الأصناف المستثناة</h1><div className={`${card} py-16 text-center`}><Package className="mx-auto mb-3 text-gray-300" size={40}/><p className="font-bold">لا توجد أصناف مستثناة</p><p className="mt-2 text-sm text-gray-500">ستظهر المنتجات المستثناة هنا عند إضافتها.</p></div></>
  return <Dashboard users={users} products={products} orders={orders}/>
}
