import { useState } from 'react'
import { X } from 'lucide-react'
import type { Entry, EntryType } from '../lib/types'

interface Props {
  entry?: Entry
  defaultType: EntryType
  onSave: (data: {
    type: EntryType
    description: string
    date: string
    amount: number
    paidAmount: number
  }) => void
  onClose: () => void
}

export function EntryModal({ entry, defaultType, onSave, onClose }: Props) {
  const [type, setType] = useState<EntryType>(entry?.type ?? defaultType)
  const [description, setDescription] = useState(entry?.description ?? '')
  const [date, setDate] = useState(entry?.date ?? new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState(String(entry?.amount ?? ''))
  const [paidAmount, setPaidAmount] = useState(String(entry?.paidAmount ?? '0'))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount.replace(',', '.')) || 0
    const paid = parseFloat(paidAmount.replace(',', '.')) || 0
    if (!description.trim() || amt <= 0) return
    onSave({
      type,
      description: description.trim(),
      date,
      amount: amt,
      paidAmount: Math.min(paid, amt),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{entry ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {(['despesa', 'receita'] as EntryType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                type === t
                  ? t === 'despesa'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t === 'despesa' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">Descrição</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
          autoFocus
        />

        <label className="mt-4 block text-sm font-medium text-slate-700">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          required
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Valor total</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Já pago/recebido</label>
            <input
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}
