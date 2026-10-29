import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockAdmins, mockClients } from '../data/mockClients'

const AuthContext = createContext(null)
const savedUsers = JSON.parse(localStorage.getItem('nour_users') || 'null')

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(savedUsers || mockClients)
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('nour_user') || 'null'))

  useEffect(() => {
    const sync = (event) => {
      if (!event.key || event.key === 'nour_users') {
        const nextUsers = JSON.parse(localStorage.getItem('nour_users') || 'null')
        if (nextUsers) {
          setUsers(nextUsers)
          const currentUser = JSON.parse(localStorage.getItem('nour_user') || 'null')
          if (currentUser?.role === 'client') {
            const updatedUser = nextUsers.find((item) => item.id === currentUser.id)
            if (updatedUser) {
              if (updatedUser.status !== 'active') {
                localStorage.removeItem('nour_token')
                localStorage.removeItem('nour_user')
                setUser(null)
              } else {
                const { password: _password, ...safeUser } = updatedUser
                const sessionUser = { ...safeUser, role: 'client' }
                setUser(sessionUser)
                localStorage.setItem('nour_user', JSON.stringify(sessionUser))
              }
            }
          }
        }
      }
      if (event.key === 'nour_user') setUser(JSON.parse(localStorage.getItem('nour_user') || 'null'))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const saveUsers = (next) => {
    setUsers(next)
    localStorage.setItem('nour_users', JSON.stringify(next))
  }

  const login = (email, password) => {
    const adminAccount = mockAdmins.find((item) => item.email === email && password === 'admin123')
    if (adminAccount) {
      const admin = { ...adminAccount, role: 'admin' }
      localStorage.setItem('nour_token', 'demo-admin-token')
      localStorage.setItem('nour_user', JSON.stringify(admin))
      setUser(admin)
      return { ok: true, user: admin }
    }
    const client = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
    if (!client || password !== (client.password || 'client123')) return { ok: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }
    if (client.status === 'pending') return { ok: false, message: 'حسابك قيد المراجعة. سنبلغك فور اعتماد طلبك.' }
    if (client.status === 'suspended') return { ok: false, message: 'تم إيقاف حسابك مؤقتاً. يرجى التواصل مع الدعم.' }
    if (client.status === 'rejected') return { ok: false, message: `تعذر اعتماد الحساب: ${client.rejectionReason || 'يرجى التواصل مع الدعم.'}` }
    const activeUser = { ...client, password: undefined, role: 'client', forcePasswordChange: Boolean(client.forcePasswordChange) }
    localStorage.setItem('nour_token', `demo-${client.id}`)
    localStorage.setItem('nour_user', JSON.stringify(activeUser))
    setUser(activeUser)
    return { ok: true, user: activeUser }
  }

  const register = ({ name, email, phone, password }) => {
    if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: 'هذا البريد مسجل بالفعل.' }
    }
    const client = {
      id: `CL-${Date.now()}`, name, email, phone, password, status: 'pending', forcePasswordChange: true,
      tier: 'list', rejectionReason: '', createdAt: new Date().toISOString().slice(0, 10),
    }
    saveUsers([client, ...users])
    return { ok: true }
  }

  const updateClient = (id, updates) => {
    const updated = users.map((item) => item.id === id ? { ...item, ...updates } : item)
    saveUsers(updated)
    if (user?.id === id) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('nour_user', JSON.stringify(updatedUser))
    }
  }

  const changePassword = (password) => {
    const updatedUser = { ...user, forcePasswordChange: false }
    setUser(updatedUser)
    localStorage.setItem('nour_user', JSON.stringify(updatedUser))
    saveUsers(users.map((item) => item.id === user.id ? { ...updatedUser, password } : item))
  }

  const resetPassword = (email, password) => {
    const target = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
    if (!target) return false
    saveUsers(users.map((item) => item.id === target.id ? { ...item, password } : item))
    return true
  }

  const logout = () => {
    localStorage.removeItem('nour_token')
    localStorage.removeItem('nour_user')
    setUser(null)
  }

  const value = useMemo(() => ({
    user, users, login, register, updateClient, changePassword, resetPassword, logout,
    isAdmin: user?.role === 'admin',
  }), [user, users])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
