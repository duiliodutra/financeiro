import { Pencil, Trash2 } from 'lucide-react'
import type { Entry } from '../lib/types'
import { entryRemaining } from '../lib/calculations'
import { formatCurrency, formatDate } from '../lib/format'

const statusStyles = {
  pago: 'bg-green-100 text-green-700',
  parcial: 'bg-amber-100 text-amber-700',
  aberto: 'bg-slate-100 text-slate-600',
}

interface Props {
  entries: Entry[]
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
  onPay: (entry: Entry) => void
  onPartialPay: (entry: Entry) => void
  onReopen: (entry: Entry) => void
}

export function EntryTable({
  entries,
  onEdit,
  onDelete,
  onPay,
  onPartialPay,
  onReopen,
}: Props) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Nenhum lançamento neste bloco. Adicione uma despesa ou receita.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-3">Tipo</th>
            <th className="px-3 py-3">Descrição</th>
            <th className="px-3 py-3">Data</th>
            <th className="px-3 py-3">Valor</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const remaining = entryRemaining(entry)
            return (
              <tr
                key={entry.id}
                className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                onClick={() => onEdit(entry)}
              >
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      entry.type === 'despesa' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {entry.type === 'despesa' ? 'Despesa' : 'Receita'}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-slate-800">{entry.description}</td>
                <td className="px-3 py-3 text-slate-600">{formatDate(entry.date)}</td>
                <td className="px-3 py-3">
                  <div className="font-medium">{formatCurrency(entry.amount)}</div>
                  {entry.status === 'parcial' && (
                    <div className="text-xs text-slate-500">
                      Pago {formatCurrency(entry.paidAmount)} · Falta {formatCurrency(remaining)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[entry.status]}`}>
                    {entry.status === 'pago' && 'Pago'}
                    {entry.status === 'parcial' && `Parcial · falta ${formatCurrency(remaining)}`}
                    {entry.status === 'aberto' && 'Em aberto'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div
                    className="flex flex-wrap items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {entry.status !== 'pago' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onPay(entry)}
                          className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                        >
                          {entry.type === 'despesa' ? 'Pagar' : 'Receber'}
                        </button>
                        {entry.status === 'aberto' && (
                          <button
                            type="button"
                            onClick={() => onPartialPay(entry)}
                            className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                          >
                            Parcial
                          </button>
                        )}
                      </>
                    )}
                    {entry.status === 'pago' && (
                      <button
                        type="button"
                        onClick={() => onReopen(entry)}
                        className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                      >
                        Reabrir
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      title="Editar"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
