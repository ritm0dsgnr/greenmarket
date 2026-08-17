'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type AnimationEvent,
  type ReactNode,
} from 'react'
import { Icon } from '@/components/Icon'
import {
  addLayoutCartLines,
  layoutCartCount,
  layoutCartTotal,
  setLayoutCartQuantity,
  type LayoutCartLine,
} from '@/components/layoutCart'

type LayoutCartValue = {
  count: number
  total: number
  items: LayoutCartLine[]
  addItems: (lines: LayoutCartLine[]) => void
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

export function LayoutCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LayoutCartLine[]>([])
  const [flashId, setFlashId] = useState(0)
  const [flashing, setFlashing] = useState(false)
  const count = layoutCartCount(items)
  const total = layoutCartTotal(items)

  const addItems = useCallback((lines: LayoutCartLine[]) => {
    if (lines.every((line) => line.quantity <= 0)) {
      return
    }

    setItems((current) => addLayoutCartLines(current, lines))
    setFlashId((current) => current + 1)
    setFlashing(true)
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => setLayoutCartQuantity(current, id, quantity))
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((current) => setLayoutCartQuantity(current, id, 0))
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

  function onFlashEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return
    }

    setFlashing(false)
  }

  return (
    <LayoutCartContext.Provider value={value}>
      {children}
      {flashing ? (
        <div
          className="cart-flash"
          key={flashId}
          role="status"
          aria-live="polite"
          onAnimationEnd={onFlashEnd}
        >
          <p className="visually-hidden">Добавлено</p>
          <span className="cart-flash__wave cart-flash__wave--lg" aria-hidden="true" />
          <span className="cart-flash__wave cart-flash__wave--sm" aria-hidden="true" />
          <Icon name="check" />
        </div>
      ) : null}
    </LayoutCartContext.Provider>
  )
}
