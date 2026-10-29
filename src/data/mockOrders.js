const statuses = ['pending','confirmed','shipped','delivered','cancelled','pending','confirmed','delivered','shipped','pending']
export const mockOrders = statuses.map((status, index) => ({
  id: `ORD-${String(1001 + index)}`,
  clientId: `CL-${String(index + 1).padStart(3, '0')}`,
  clientName: ['صيدلية الشفاء','مؤسسة الجمال','صيدلية الرحمة','شركة لمسة'][index % 4],
  status,
  total: 420 + index * 175,
  createdAt: `2026-10-${String(index + 1).padStart(2, '0')}`,
  items: [{ productId: `PR-${String(index + 1).padStart(3, '0')}`, name: 'سيروم عناية', quantity: 3, unitPrice: 140 }],
  address: 'القاهرة، مصر',
  notes: '',
}))
