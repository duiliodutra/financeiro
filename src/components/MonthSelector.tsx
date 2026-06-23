import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMonth } from '../context/MonthContext'
import { monthLabel } from '../lib/format'

export function MonthSelector() {
  const { year, month, setPeriod } = useMonth()

  const shift = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setPeriod(d.getFullYear(), d.getMonth() + 1)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <button
        type="button"
        onClick={() => shift(-1)}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-[160px] text-center text-sm font-semibold capitalize text-slate-700">
        {monthLabel(month, year)}
      </span>
      <button
        type="button"
        onClick={() => shift(1)}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        aria-label="Próximo mês"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
