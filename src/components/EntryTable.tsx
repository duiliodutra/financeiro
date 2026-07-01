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

function statusText(entry: Entry, remaining: number): string {
  if (entry.status === 'pago') return 'Pago'
  if (entry.status === 'parcial') return `Parcial · falta ${formatCurrency(remaining)}`
  return 'Em aberto'
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
    <>
      <div className="divide-y divide-slate-100 sm:hidden">
        {entries.map((entry) => {
          const remaining = entryRemaining(entry)
          return (
            <article
              key={entry.id}
              className="p-4"
              onClick={() => onEdit(entry)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      entry.type === 'despesa' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {entry.type === 'despesa' ? 'Despesa' : 'Receita'}
                  </span>
                  <h3 className="mt-2 break-words text-base font-semibold text-slate-800">
                    {entry.description}
                  </h3>
                  {entry.seriesMode === 'recurring' && entry.installmentNumber && entry.installmentTotal && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      Recorrente {entry.installmentNumber}/{entry.installmentTotal}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[entry.status]}`}>
                  {statusText(entry, remaining)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Data</p>
                  <p className="mt-0.5 text-slate-700">{formatDate(entry.date)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Valor</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{formatCurrency(entry.amount)}</p>
                  {entry.status === 'parcial' && (
                    <p className="text-xs text-slate-500">
                      Pago {formatCurrency(entry.paidAmount)} · Falta {formatCurrency(remaining)}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="mt-3 flex flex-wrap gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {entry.status !== 'pago' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onPay(entry)}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                    >
                      {entry.type === 'despesa' ? 'Pagar' : 'Receber'}
                    </button>
                    {entry.status === 'aberto' && (
                      <button
                        type="button"
                        onClick={() => onPartialPay(entry)}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
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
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    Reabrir
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit(entry)}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                >
                  <Pencil size={14} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry)}
                  className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto sm:block">
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
                  <td className="px-3 py-3 font-medium text-slate-800">
                    <div>{entry.description}</div>
                    {entry.seriesMode === 'recurring' && entry.installmentNumber && entry.installmentTotal && (
                      <div className="mt-0.5 text-xs font-normal text-slate-500">
                        Recorrente {entry.installmentNumber}/{entry.installmentTotal}
                      </div>
                    )}
                  </td>
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
                      {statusText(entry, remaining)}
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
    </>
  )
}
