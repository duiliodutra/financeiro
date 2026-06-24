import { formatCurrency } from '../lib/format'

export function OpenAccountsList({
  items,
}: {
  items: {
    name: string
    despesaOpen: number
    receitaOpen: number
    netOpen: number
  }[]
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-800">Contas em Aberto</h2>
      <p className="text-sm text-slate-500">Detalhamento por bloco</p>
      <div className="mt-4 space-y-3">
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nenhuma conta em aberto neste mês.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-800">{item.name}</h3>
              <span
                className={`text-sm font-bold ${item.netOpen >= 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {formatCurrency(item.netOpen)}
              </span>
            </div>
            {(item.despesaOpen > 0 || item.receitaOpen > 0) && (
              <p className="mt-1 text-xs text-slate-500">
                {item.despesaOpen > 0 && `Despesa ${formatCurrency(item.despesaOpen)}`}
                {item.despesaOpen > 0 && item.receitaOpen > 0 && ' · '}
                {item.receitaOpen > 0 && `Receita ${formatCurrency(item.receitaOpen)}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
