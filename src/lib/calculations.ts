import type { Block, Entry, Forecast } from './types'

export function entryRemaining(entry: Entry): number {
  return Math.max(0, entry.amount - entry.paidAmount)
}

export function deriveStatus(amount: number, paidAmount: number): Entry['status'] {
  if (paidAmount <= 0) return 'aberto'
  if (paidAmount >= amount) return 'pago'
  return 'parcial'
}

export function blockTotals(entries: Entry[]) {
  const paid = entries.reduce((s, e) => s + e.paidAmount, 0)
  const open = entries.reduce((s, e) => s + entryRemaining(e), 0)
  const total = entries.reduce((s, e) => s + e.amount, 0)
  return { paid, open, total }
}

function sumByBlockKind(
  entries: Entry[],
  blocks: Block[],
  kinds: Block['kind'][],
  field: 'open' | 'paid',
) {
  const blockIds = new Set(blocks.filter((b) => kinds.includes(b.kind)).map((b) => b.id))
  return entries
    .filter((e) => blockIds.has(e.blockId))
    .reduce((s, e) => s + (field === 'open' ? entryRemaining(e) : e.paidAmount), 0)
}

export function summaryFromEntries(entries: Entry[], blocks: Block[]) {
  const despesaOpen = sumByBlockKind(entries, blocks, ['despesa'], 'open')
  const receitaOpen = sumByBlockKind(entries, blocks, ['receita'], 'open')
  const devoOpen = sumByBlockKind(entries, blocks, ['devo'], 'open')
  const meDevemOpen = sumByBlockKind(entries, blocks, ['me_devem'], 'open')

  const despesaPaid = sumByBlockKind(entries, blocks, ['despesa'], 'paid')
  const receitaPaid = sumByBlockKind(entries, blocks, ['receita'], 'paid')
  const devoPaid = sumByBlockKind(entries, blocks, ['devo'], 'paid')
  const meDevemPaid = sumByBlockKind(entries, blocks, ['me_devem'], 'paid')

  // Cada lançamento entra uma vez, pelo tipo do bloco
  const totalOpen = despesaOpen + devoOpen - receitaOpen - meDevemOpen
  const totalPaid = despesaPaid + devoPaid + receitaPaid + meDevemPaid
  const personalBalance = receitaPaid + meDevemPaid - despesaPaid - devoPaid

  return {
    expensePaid: despesaPaid,
    expenseOpen: despesaOpen,
    incomePaid: receitaPaid,
    incomeOpen: receitaOpen,
    devoOpen,
    meDevemOpen,
    totalOpen,
    totalPaid,
    personalBalance,
  }
}

export function closingForecast(forecast: Forecast | null, summary: ReturnType<typeof summaryFromEntries>) {
  if (!forecast) return 0
  const pendingReceipts = Math.max(0, forecast.receiptForecast - forecast.alreadyReceived)
  return forecast.moneyInAccount + pendingReceipts - summary.totalOpen
}

export function openByBlock(entries: Entry[], blocks: Block[]) {
  return blocks
    .map((block) => {
      const blockEntries = entries.filter((e) => e.blockId === block.id)
      const open = blockEntries.reduce((s, e) => s + entryRemaining(e), 0)
      return { block, open, entries: blockEntries }
    })
    .filter((item) => item.open > 0)
    .sort((a, b) => b.open - a.open)
}
