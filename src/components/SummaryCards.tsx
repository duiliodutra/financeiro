import { formatCurrency } from '../lib/format'

interface CardProps {
  label: string
  value: number
  color: 'red' | 'green'
}

const colors = {
  red: 'text-red-600',
  green: 'text-green-600',
}

export function SummaryCards({
  expenseOpen,
  incomeOpen,
  balance,
}: {
  expenseOpen: number
  incomeOpen: number
  balance: number
}) {
  const cards: CardProps[] = [
    { label: 'Despesas', value: expenseOpen, color: 'red' },
    { label: 'Receitas', value: incomeOpen, color: 'green' },
    { label: 'Saldo', value: balance, color: balance >= 0 ? 'green' : 'red' },
  ]

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800">Resumo Financeiro</h2>
      <p className="text-sm text-slate-500">Panorama do mês selecionado</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${colors[card.color]}`}>
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
