import type { Block } from '../lib/types'
import { formatCurrency } from '../lib/format'

const kindLabels: Record<Block['kind'], string> = {
  despesa: 'Despesas',
  receita: 'Receitas',
  devo: 'Eu Devo',
  me_devem: 'Me Devem',
}

const kindColors: Record<Block['kind'], string> = {
  despesa: 'text-red-600',
  receita: 'text-green-600',
  devo: 'text-orange-600',
  me_devem: 'text-blue-600',
}

export function OpenAccountsList({
  groups,
}: {
  groups: { kind: Block['kind']; items: { name: string; open: number }[]; subtotal: number }[]
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-800">Contas em Aberto</h2>
      <p className="text-sm text-slate-500">Detalhamento por bloco</p>
      <div className="mt-4 space-y-4">
        {groups.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nenhuma conta em aberto neste mês.
          </p>
        )}
        {groups.map((group) => (
          <div key={group.kind} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${kindColors[group.kind]}`}>
              {kindLabels[group.kind]}
            </h3>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item.name} className="flex justify-between text-sm">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-medium text-slate-800">{formatCurrency(item.open)}</span>
                </li>
              ))}
            </ul>
            <div className={`mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-bold ${kindColors[group.kind]}`}>
              <span>Subtotal</span>
              <span>{formatCurrency(group.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
