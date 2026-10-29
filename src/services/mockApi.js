import { mockClients, mockAdmins } from '../data/mockClients'
import { mockOrders } from '../data/mockOrders'

const delay = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 120))
export const mockApi = {
  products: async () => {
    const { mockProducts } = await import('../data/mockProducts')
    return delay(mockProducts)
  },
  clients: () => delay(mockClients),
  admins: () => delay(mockAdmins),
  orders: () => delay(mockOrders),
}
