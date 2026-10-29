import { forwardRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

const email = z.string().email('أدخل بريداً إلكترونياً صحيحاً')
const password = z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')

const FormField = forwardRef(function FormField({ label, error, ...props }, ref) {
  return <label className="mb-4 block text-sm font-semibold">{label}<input {...props} ref={ref} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>
})
function Submit({ children }) { return <button className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white transition hover:bg-primary-dark">{children}</button> }

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const schema = z.object({ email, password })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const submit = (values) => {
    const result = login(values.email, values.password)
    if (!result.ok) { setMessage(result.message); return }
    navigate(result.user.role === 'admin' ? '/admin' : result.user.forcePasswordChange ? '/change-password' : '/')
  }
  return <><h1 className="text-2xl font-extrabold">مرحباً بعودتك</h1><p className="mb-6 mt-2 text-sm text-gray-500">سجل الدخول إلى بوابة نور للأعمال</p>
    {message && <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{message}</div>}
    <form onSubmit={handleSubmit(submit)}><FormField label="البريد الإلكتروني" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} /><FormField label="كلمة المرور" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} /><div className="mb-5 text-left"><Link className="text-sm text-primary-dark" to="/forgot-password">نسيت كلمة المرور؟</Link></div><Submit>{isSubmitting ? 'جارٍ الدخول...' : 'تسجيل الدخول'}</Submit></form>
    <p className="mt-5 text-center text-sm text-gray-500">ليس لديك حساب؟ <Link className="font-bold text-primary-dark" to="/register">إنشاء حساب جديد</Link></p>
    <div className="mt-5 rounded-xl bg-gray-50 p-3 text-xs leading-6 text-gray-500">تجربة المدير: admin@nour.com / admin123<br />تجربة عميل نشط: client8@example.com / client123</div>
  </>
}

export function RegisterPage() {
  const { register: createAccount } = useAuth()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()
  const schema = z.object({ name: z.string().min(2, 'الاسم مطلوب'), email, phone: z.string().min(8, 'أدخل رقم هاتف صحيحاً'), password })
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const submit = (values) => {
    const result = createAccount(values)
    if (!result.ok) { toast.error(result.message); return }
    addNotification('طلب تسجيل عميل جديد قيد المراجعة', { audience: 'admin' })
    toast.success('تم إنشاء الحساب، وهو الآن قيد مراجعة الإدارة')
    navigate('/login')
  }
  return <><h1 className="text-2xl font-extrabold">إنشاء حساب أعمال</h1><p className="mb-6 mt-2 text-sm text-gray-500">سيراجع فريقنا بياناتك قبل تفعيل الحساب.</p>
    <form onSubmit={handleSubmit(submit)}><FormField label="اسم النشاط التجاري" error={errors.name?.message} {...register('name')} /><FormField label="البريد الإلكتروني" type="email" error={errors.email?.message} {...register('email')} /><FormField label="رقم الهاتف" type="tel" error={errors.phone?.message} {...register('phone')} /><FormField label="كلمة المرور" type="password" error={errors.password?.message} {...register('password')} /><Submit>إرسال طلب التسجيل</Submit></form>
    <p className="mt-5 text-center text-sm text-gray-500">لديك حساب؟ <Link className="font-bold text-primary-dark" to="/login">تسجيل الدخول</Link></p>
  </>
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const schema = z.object({ email })
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  return <><h1 className="text-2xl font-extrabold">استعادة كلمة المرور</h1><p className="mb-6 mt-2 text-sm text-gray-500">أدخل بريدك وسنرسل لك تعليمات إعادة التعيين.</p>
    {sent ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">إذا كان البريد مسجلاً، ستصلك تعليمات إعادة التعيين. <Link className="font-bold underline" to="/reset-password">إعادة تعيين كلمة المرور في الوضع التجريبي</Link></div>
      : <form onSubmit={handleSubmit(() => setSent(true))}><FormField label="البريد الإلكتروني" type="email" error={errors.email?.message} {...register('email')} /><Submit>إرسال تعليمات الاستعادة</Submit></form>}
    <Link className="mt-5 block text-center text-sm text-primary-dark" to="/login">العودة لتسجيل الدخول</Link>
  </>
}

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [done, setDone] = useState(false)
  const schema = z.object({ email, password, confirm: z.string() }).refine((values) => values.password === values.confirm, { path: ['confirm'], message: 'كلمتا المرور غير متطابقتين' })
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  return <><h1 className="text-2xl font-extrabold">إعادة تعيين كلمة المرور</h1><p className="mb-6 mt-2 text-sm text-gray-500">أدخل البريد المسجل وكلمة المرور الجديدة.</p>
    {done ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">تم تحديث كلمة المرور. <Link className="font-bold underline" to="/login">تسجيل الدخول</Link></div>
      : <form onSubmit={handleSubmit((values) => { if (resetPassword(values.email, values.password)) setDone(true); else toast.error('لا يوجد حساب مسجل بهذا البريد') })}><FormField label="البريد الإلكتروني" type="email" error={errors.email?.message} {...register('email')} /><FormField label="كلمة المرور الجديدة" type="password" error={errors.password?.message} {...register('password')} /><FormField label="تأكيد كلمة المرور" type="password" error={errors.confirm?.message} {...register('confirm')} /><Submit>حفظ كلمة المرور الجديدة</Submit></form>}
  </>
}

export function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const navigate = useNavigate()
  const schema = z.object({ password: password, confirm: z.string() }).refine((values) => values.password === values.confirm, { path: ['confirm'], message: 'كلمتا المرور غير متطابقتين' })
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  return <><h1 className="text-2xl font-extrabold">تغيير كلمة المرور</h1><p className="mb-6 mt-2 text-sm text-gray-500">يرجى تعيين كلمة مرور جديدة للمتابعة.</p>
    <form onSubmit={handleSubmit((values) => { changePassword(values.password); toast.success('تم تحديث كلمة المرور'); navigate('/') })}><FormField label="كلمة المرور الجديدة" type="password" error={errors.password?.message} {...register('password')} /><FormField label="تأكيد كلمة المرور" type="password" error={errors.confirm?.message} {...register('confirm')} /><Submit>حفظ كلمة المرور</Submit></form>
  </>
}
