import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Block, BlockKind } from '../lib/types'

const kindOptions: { value: BlockKind; label: string }[] = [
  { value: 'despesa', label: 'Despesas (contas a pagar)' },
  { value: 'receita', label: 'Receitas (entradas)' },
  { value: 'devo', label: 'Eu devo (pessoas)' },
  { value: 'me_devem', label: 'Me devem (pessoas)' },
]

interface Props {
  block?: Block
  onSave: (data: { name: string; kind: BlockKind }) => void
  onClose: () => void
}

export function BlockModal({ block, onSave, onClose }: Props) {
  const [name, setName] = useState(block?.name ?? '')
  const [kind, setKind] = useState<BlockKind>(block?.kind ?? 'despesa')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), kind })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{block ? 'Editar Bloco' : 'Novo Bloco'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Diversas, João, Cartão Nubank..."
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
          autoFocus
        />

        <label className="mt-4 block text-sm font-medium text-slate-700">Tipo</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as BlockKind)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {kindOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

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
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}
