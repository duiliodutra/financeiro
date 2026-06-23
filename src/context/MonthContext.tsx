import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MonthRef } from '../lib/types'

interface MonthContextValue extends MonthRef {
  setMonth: (month: number) => void
  setYear: (year: number) => void
  setPeriod: (year: number, month: number) => void
}

const now = new Date()
const MonthContext = createContext<MonthContextValue | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const setPeriod = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
  }

  return (
    <MonthContext.Provider value={{ year, month, setMonth, setYear, setPeriod }}>
      {children}
    </MonthContext.Provider>
  )
}

export function useMonth() {
  const ctx = useContext(MonthContext)
  if (!ctx) throw new Error('useMonth must be used within MonthProvider')
  return ctx
}
