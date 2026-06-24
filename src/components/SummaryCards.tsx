import { formatCurrency } from '../lib/format'

interface CardProps {
  label: string
  value: number
  color: 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'emerald'
  subtitle?: string
}

const colors = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  orange: 'text-orange-500',
  red: 'text-red-600',
  green: 'text-green-600',
  emerald: 'text-emerald-600',
}

export function SummaryCards({
  personalBalance,
  totalPaid,
  totalOpen,
  devoOpen,
  meDevemOpen,
  closingForecast,
}: {
  personalBalance: number
  totalPaid: number
  totalOpen: number
  devoOpen: number
  meDevemOpen: number
  closingForecast: number
}) {
  const cards: CardProps[] = [
    { label: 'Saldo Pessoal', value: personalBalance, color: 'purple', subtitle: 'recebido − pago no mês' },
    { label: 'Eu Devo', value: devoOpen, color: 'red', subtitle: 'em aberto' },
    { label: 'Me Devem', value: meDevemOpen, color: 'green', subtitle: 'a receber' },
    { label: 'Quitado / Recebido', value: totalPaid, color: 'green', subtitle: 'já pago ou recebido' },
    { label: 'Saldo em Aberto', value: totalOpen, color: totalOpen >= 0 ? 'red' : 'green', subtitle: 'a pagar − a receber' },
    {
      label: 'Prev. de Fechamento',
      value: closingForecast,
      color: closingForecast >= 0 ? 'emerald' : 'red',
      subtitle: 'caixa + recebimentos − aberto',
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
