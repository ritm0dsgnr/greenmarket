'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CartAddFlash, type CartAddOrigin } from '@/components/CartAddFlash'

export { cartAddOriginFromEvent } from '@/components/CartAddFlash'
import {
  addLayoutCartLines,
  layoutCartCount,
  layoutCartTotal,
  setLayoutCartQuantity,
  type LayoutCartLine,
} from '@/components/layoutCart'

export type { CartAddOrigin }

type LayoutCartValue = {
  count: number
  total: number
  items: LayoutCartLine[]
  addItems: (lines: LayoutCartLine[], origin?: CartAddOrigin) => void
  setQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
}

const LayoutCartContext = createContext<LayoutCartValue | null>(null)

export function useLayoutCart() {
  const value = useContext(LayoutCartContext)

  if (!value) {
    throw new Error('useLayoutCart requires LayoutCartProvider')
  }

  return value
}

function fallbackOrigin(): CartAddOrigin {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 }
  }

  return { x: window.innerWidth / 2, y: window.innerHeight * 0.62 }
}

export function LayoutCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LayoutCartLine[]>([])
  const [flash, setFlash] = useState<{ id: number; origin: CartAddOrigin } | null>(null)
  const count = layoutCartCount(items)
  const total = layoutCartTotal(items)

  const addItems = useCallback((lines: LayoutCartLine[], origin?: CartAddOrigin) => {
    if (lines.every((line) => line.quantity <= 0)) {
      return
    }

    setItems((current) => addLayoutCartLines(current, lines))
    setFlash((current) => ({
      id: (current?.id ?? 0) + 1,
      origin: origin ?? fallbackOrigin(),
    }))
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => setLayoutCartQuantity(current, id, quantity))
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((current) => setLayoutCartQuantity(current, id, 0))
  }, [])

  const clearFlash = useCallback(() => {
    setFlash(null)
  }, [])

  const value = useMemo(
    () => ({
      count,
      total,
      items,
      addItems,
      setQuantity,
      removeItem,
    }),
    [count, total, items, addItems, setQuantity, removeItem],
  )

  return (
    <LayoutCartContext.Provider value={value}>
      {children}
      {flash ? <CartAddFlash key={flash.id} origin={flash.origin} onDone={clearFlash} /> : null}
    </LayoutCartContext.Provider>
  )
}
