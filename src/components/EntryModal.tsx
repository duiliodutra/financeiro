import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Entry, EntrySchedule, EntryScheduleMode, EntryType } from '../lib/types'

interface EntryFormData {
  type: EntryType
  description: string
  date: string
  amount: number
  paidAmount: number
  schedule?: EntrySchedule
}

interface Props {
  entry?: Entry
  defaultType: EntryType
  onSave: (data: EntryFormData) => Promise<void>
  onClose: () => void
}

const scheduleOptions: { mode: EntryScheduleMode; label: string }[] = [
  { mode: 'single', label: 'À vista' },
  { mode: 'installments', label: 'Parcelado' },
  { mode: 'recurring', label: 'Recorrente' },
]

export function EntryModal({ entry, defaultType, onSave, onClose }: Props) {
  const [type, setType] = useState<EntryType>(entry?.type ?? defaultType)
  const [description, setDescription] = useState(entry?.description ?? '')
  const [date, setDate] = useState(entry?.date ?? new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState(entry?.amount != null ? String(entry.amount) : '')
  const [paidAmount, setPaidAmount] = useState(
    entry?.paidAmount != null ? String(entry.paidAmount) : '0',
  )
  const [scheduleMode, setScheduleMode] = useState<EntryScheduleMode>('single')
  const [scheduleCount, setScheduleCount] = useState('2')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(entry)

  useEffect(() => {
    setType(entry?.type ?? defaultType)
    setDescription(entry?.description ?? '')
    setDate(entry?.date ?? new Date().toISOString().slice(0, 10))
    setAmount(entry?.amount != null ? String(entry.amount) : '')
    setPaidAmount(entry?.paidAmount != null ? String(entry.paidAmount) : '0')
    setScheduleMode('single')
    setScheduleCount('2')
    setError('')
  }, [entry, defaultType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount.replace(',', '.')) || 0
    const paid = parseFloat(paidAmount.replace(',', '.')) || 0
    const count = Math.max(2, Math.min(120, parseInt(scheduleCount, 10) || 2))
    if (!description.trim() || amt <= 0) return

    setSaving(true)
    setError('')
    try {
      await onSave({
        type,
        description: description.trim(),
        date,
        amount: amt,
        paidAmount: Math.min(paid, amt),
        schedule: isEditing ? undefined : { mode: scheduleMode, count },
      })
      onClose()
    } catch {
      setError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
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

        {!isEditing && (
          <div className="mt-4 rounded-xl border border-slate-200 p-3">
            <label className="block text-sm font-medium text-slate-700">Forma de lançamento</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {scheduleOptions.map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => setScheduleMode(option.mode)}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                    scheduleMode === option.mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {scheduleMode !== 'single' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700">
                  {scheduleMode === 'installments' ? 'Número de parcelas' : 'Quantidade de meses'}
                </label>
                <input
                  type="number"
                  min={2}
                  max={120}
                  value={scheduleCount}
                  onChange={(e) => setScheduleCount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

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
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
