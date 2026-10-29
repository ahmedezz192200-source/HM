export const TIERS = [
  { id: 'pharmacies', label: 'صيدليات' },
  { id: 'wholesale', label: 'جملة' },
  { id: 'retail', label: 'قطاعي' },
  { id: 'list', label: 'قائمة' },
  { id: 'companies', label: 'شركات' },
]

export const formatCurrency = (amount) =>
  `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(Number(amount) || 0)} ج.م`
