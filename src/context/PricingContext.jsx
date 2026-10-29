import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { TIERS } from '../constants/tiers'

const PricingContext = createContext(null)

export function PricingProvider({ children }) {
  const { user } = useAuth()
  const value = useMemo(() => ({
    tier: user?.tier || null,
    tierLabel: TIERS.find((tier) => tier.id === user?.tier)?.label || '',
    // لا يُعرض للعميل سوى السعر المرتبط بالشريحة المعتمدة لحسابه.
    getPrice: (product) => product.prices[user?.tier] ?? product.prices.list,
  }), [user?.tier])
  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
}

export const usePricing = () => useContext(PricingContext)
