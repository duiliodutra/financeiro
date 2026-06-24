import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useMonth } from '../context/MonthContext'
import { useBlocks } from '../hooks/useBlocks'
import { useEntries } from '../hooks/useEntries'
import { blockTotals } from '../lib/calculations'
import { formatCurrency } from '../lib/format'
import type { Block } from '../lib/types'
import { BlockModal } from '../components/BlockModal'
import { BlockPanel } from '../components/BlockPanel'

export function ContasPage() {
  const { year, month } = useMonth()
  const { blocks, addBlock, updateBlock, removeBlock } = useBlocks()
  const { entries, addEntry, updateEntry, removeEntry, payEntry, reopenEntry, deleteEntriesByBlock } = useEntries(
    year,
    month,
  )
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [blockModal, setBlockModal] = useState<Block | null | 'new'>(null)

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  )

  const activeBlock = sortedBlocks.find((b) => b.id === activeBlockId) ?? sortedBlocks[0]

  const tabTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const block of sortedBlocks) {
      const blockEntries = entries.filter((e) => e.blockId === block.id)
      map.set(block.id, blockTotals(blockEntries).total)
    }
    return map
  }, [sortedBlocks, entries])

  const handleDeleteBlock = async (blockId: string) => {
    await deleteEntriesByBlock(blockId)
    await removeBlock(blockId)
  }

  const handleAddBlock = async (data: { name: string }) => {
    if (blockModal && blockModal !== 'new') {
      await updateBlock(blockModal.id, { name: data.name })
    } else {
      const order = blocks.length > 0 ? Math.max(...blocks.map((b) => b.order)) + 1 : 0
      await addBlock({ name: data.name, kind: 'geral', order })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Contas Pessoais</h2>
          <p className="text-sm text-slate-500">Despesas, recebimentos e compromissos pessoais</p>
        </div>
        <button
          type="button"
          onClick={() => setBlockModal('new')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Novo Bloco
        </button>
      </div>

      {sortedBlocks.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">Nenhum bloco criado ainda.</p>
          <p className="mt-1 text-sm text-slate-500">
            Crie blocos como &quot;Diversas&quot;, &quot;Cartões&quot;, &quot;João (me deve)&quot; ou
            &quot;Maria (eu devo)&quot;.
          </p>
          <button
            type="button"
            onClick={() => setBlockModal('new')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Criar primeiro bloco
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {sortedBlocks.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => setActiveBlockId(block.id)}
                className={`shrink-0 rounded-xl border px-4 py-3 text-left transition-colors ${
                  activeBlock?.id === block.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-800">{block.name}</div>
                <div className="text-sm font-bold text-blue-600">
                  {formatCurrency(tabTotals.get(block.id) ?? 0)}
                </div>
              </button>
            ))}
          </div>

          {activeBlock && (
            <div className="mt-4">
              <BlockPanel
                block={activeBlock}
                entries={entries}
                onEditBlock={(b) => setBlockModal(b)}
                onDeleteBlock={handleDeleteBlock}
                onAddEntry={(data) => addEntry({ ...data, blockId: activeBlock.id })}
                onUpdateEntry={updateEntry}
                onDeleteEntry={removeEntry}
                onPayEntry={payEntry}
                onReopenEntry={reopenEntry}
              />
            </div>
          )}
        </>
      )}

      {blockModal && (
        <BlockModal
          key={blockModal === 'new' ? 'new' : blockModal.id}
          block={blockModal === 'new' ? undefined : blockModal}
          onClose={() => setBlockModal(null)}
          onSave={handleAddBlock}
        />
      )}
    </div>
  )
}
