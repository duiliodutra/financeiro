import { formatCurrency } from '../lib/format'

interface CardProps {
  label: string
  value: number
  color: 'red' | 'emerald'
  subtitle?: string
}

const colors = {
  red: 'text-red-600',
  emerald: 'text-emerald-600',
}

export function SummaryCards({
  closingForecast,
}: {
  closingForecast: number
}) {
  const cards: CardProps[] = [
    {
      label: 'Saldo',
      value: closingForecast,
      color: closingForecast >= 0 ? 'emerald' : 'red',
    },
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
            {card.subtitle && <p className="text-xs text-slate-400">{card.subtitle}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
