import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Block, Entry, EntryType } from '../lib/types'
import { blockTotals } from '../lib/calculations'
import { formatCurrency } from '../lib/format'
import { EntryTable } from './EntryTable'
import { EntryModal } from './EntryModal'

interface Props {
  block: Block
  entries: Entry[]
  onEditBlock: (block: Block) => void
  onDeleteBlock: (id: string) => void
  onAddEntry: (data: Omit<Entry, 'id' | 'createdAt' | 'status' | 'blockId' | 'month' | 'year'>) => Promise<void>
  onUpdateEntry: (id: string, data: Partial<Entry>) => Promise<void>
  onDeleteEntry: (id: string) => Promise<void>
  onPayEntry: (entry: Entry, amount?: number) => void
  onReopenEntry: (entry: Entry) => void
}

export function BlockPanel({
  block,
  entries,
  onEditBlock,
  onDeleteBlock,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onPayEntry,
  onReopenEntry,
}: Props) {
  const [entryModal, setEntryModal] = useState<{ entry?: Entry; type: EntryType } | null>(null)
  const [partialEntry, setPartialEntry] = useState<Entry | null>(null)
  const [partialAmount, setPartialAmount] = useState('')

  const blockEntries = entries.filter((e) => e.blockId === block.id)
  const { paid, open, despesaOpen, receitaOpen } = blockTotals(blockEntries)

  const defaultType: EntryType = 'despesa'

  const handlePartialSave = () => {
    if (!partialEntry) return
    const add = parseFloat(partialAmount.replace(',', '.')) || 0
    const newPaid = Math.min(partialEntry.amount, partialEntry.paidAmount + add)
    onPayEntry(partialEntry, newPaid)
    setPartialEntry(null)
    setPartialAmount('')
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{block.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pago {formatCurrency(paid)} · em aberto {formatCurrency(Math.abs(open))}
            {open < 0 && ' (a receber)'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Receitas</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(receitaOpen)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Despesas</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(despesaOpen)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Saldo</p>
            <p className={`text-2xl font-bold ${open <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {open <= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(open))}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setEntryModal({ type: 'despesa' })}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              + Despesa
            </button>
            <button
              type="button"
              onClick={() => setEntryModal({ type: 'receita' })}
              className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              + Receita
            </button>
            <button
              type="button"
              onClick={() => onEditBlock(block)}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
              title="Editar bloco"
            >
              <Pencil size={16} />
              Editar
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Excluir o bloco "${block.name}" e todos os lançamentos?`)) {
                  onDeleteBlock(block.id)
                }
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              title="Excluir bloco"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          </div>
        </div>
      </div>

      <EntryTable
        entries={blockEntries}
        onEdit={(entry) => setEntryModal({ entry, type: entry.type })}
        onDelete={(entry) => {
          if (confirm(`Excluir "${entry.description}"?`)) {
            onDeleteEntry(entry.id)
          }
        }}
        onPay={(entry) => onPayEntry(entry)}
        onPartialPay={(entry) => {
          setPartialEntry(entry)
          setPartialAmount('')
        }}
        onReopen={onReopenEntry}
      />

      {entryModal && (
        <EntryModal
          key={entryModal.entry?.id ?? `new-${entryModal.type}`}
          entry={entryModal.entry}
          defaultType={entryModal.type ?? defaultType}
          onClose={() => setEntryModal(null)}
          onSave={async (data) => {
            if (entryModal.entry) {
              await onUpdateEntry(entryModal.entry.id, data)
            } else {
              await onAddEntry(data)
            }
          }}
        />
      )}

      {partialEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-bold">Pagamento parcial</h3>
            <p className="mt-1 text-sm text-slate-500">{partialEntry.description}</p>
            <p className="text-sm text-slate-600">
              Falta: {formatCurrency(partialEntry.amount - partialEntry.paidAmount)}
            </p>
            <input
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder="Valor a pagar agora"
              inputMode="decimal"
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPartialEntry(null)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePartialSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
