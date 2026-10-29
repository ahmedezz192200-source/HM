const names = ['صيدلية الشفاء','مؤسسة الجمال','صيدلية الرحمة','شركة لمسة','مركز الأناقة','صيدلية النور','متجر روز','شركة بيور','صيدلية الأمل','مؤسسة العناية','صيدلية الحياة','متجر لمار','شركة الورد','صيدلية السلام','مركز لونا','مؤسسة الجود','صيدلية الصفوة','متجر ندى','شركة رين','صيدلية اليسر']
const statuses = ['pending','active','suspended','active','pending','active','rejected','active','pending','active','active','suspended','active','pending','active','active','rejected','active','pending','active']
const tiers = ['pharmacies','wholesale','retail','companies','list']

export const mockClients = names.map((name, index) => ({
  id: `CL-${String(index + 1).padStart(3, '0')}`,
  name,
  email: `client${index + 1}@example.com`,
  phone: `010${String(10000000 + index * 12439).slice(0, 8)}`,
  status: statuses[index],
  tier: tiers[index % tiers.length],
  forcePasswordChange: statuses[index] === 'active',
  rejectionReason: statuses[index] === 'rejected' ? 'يرجى استكمال المستندات المطلوبة' : '',
  createdAt: `2026-10-${String(index % 26 + 1).padStart(2, '0')}`,
}))

export const mockAdmins = [
  { id: 'AD-001', name: 'مدير النظام', email: 'admin@nour.com', role: 'admin' },
  { id: 'AD-002', name: 'مدير المبيعات', email: 'sales@nour.com', role: 'admin' },
  { id: 'AD-003', name: 'مدير المنتجات', email: 'products@nour.com', role: 'admin' },
]
