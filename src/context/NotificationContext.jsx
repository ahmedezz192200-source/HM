import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)
const readNotifications = () => JSON.parse(localStorage.getItem('nour_notifications') || '[]')

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [storedNotifications, setStoredNotifications] = useState(readNotifications)

  useEffect(() => {
    const syncNotifications = (event) => {
      if (!event.key || event.key === 'nour_notifications') {
        setStoredNotifications(readNotifications())
      }
    }
    window.addEventListener('storage', syncNotifications)
    return () => window.removeEventListener('storage', syncNotifications)
  }, [])

  const addNotification = (message, { audience = 'client', recipientId = user?.id } = {}) => {
    const current = readNotifications()
    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      audience,
      ...(recipientId ? { recipientId } : {}),
      createdAt: new Date().toISOString(),
      read: false,
    }
    const next = [notification, ...current]
    setStoredNotifications(next)
    localStorage.setItem('nour_notifications', JSON.stringify(next))
  }

  const notifications = useMemo(() => {
    if (user?.role === 'admin') {
      // الإشعارات القديمة بلا جمهور كانت مخصصة للوحة الإدارة فقط.
      return storedNotifications.filter((item) => item.audience === 'admin' || !item.audience)
    }
    if (user?.role === 'client') {
      return storedNotifications.filter((item) =>
        item.audience === 'clients' ||
        (item.audience === 'client' && item.recipientId === user.id)
      )
    }
    return []
  }, [storedNotifications, user?.id, user?.role])

  const markRead = () => {
    const visibleIds = new Set(notifications.map((item) => item.id))
    const next = readNotifications().map((item) =>
      visibleIds.has(item.id) ? { ...item, read: true } : item
    )
    setStoredNotifications(next)
    localStorage.setItem('nour_notifications', JSON.stringify(next))
  }

  const value = useMemo(() => ({
    notifications,
    addNotification,
    markRead,
    unread: notifications.filter((item) => !item.read).length,
  }), [notifications, user?.id])
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
export const useNotifications = () => useContext(NotificationContext)
