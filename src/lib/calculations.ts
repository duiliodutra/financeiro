import type { Block, Entry, Forecast } from '../lib/types'

export function entryRemaining(entry: Entry): number {
  return Math.max(0, entry.amount - entry.paidAmount)
}

export function deriveStatus(amount: number, paidAmount: number): Entry['status'] {
  if (paidAmount <= 0) return 'aberto'
  if (paidAmount >= amount) return 'pago'
  return 'parcial'
}

export function blockTotals(entries: Entry[]) {
  const despesas = entries.filter((e) => e.type === 'despesa')
  const receitas = entries.filter((e) => e.type === 'receita')
  const paid = entries.reduce((s, e) => s + e.paidAmount, 0)
  const open =
    despesas.reduce((s, e) => s + entryRemaining(e), 0) -
    receitas.reduce((s, e) => s + entryRemaining(e), 0)
  const total = entries.reduce((s, e) => s + e.amount, 0)
  return { paid, open, total }
}

function sumByEntryType(entries: Entry[], type: Entry['type'], field: 'open' | 'paid') {
  return entries
    .filter((e) => e.type === type)
    .reduce((s, e) => s + (field === 'open' ? entryRemaining(e) : e.paidAmount), 0)
}

export function summaryFromEntries(entries: Entry[]) {
  const despesaOpen = sumByEntryType(entries, 'despesa', 'open')
  const receitaOpen = sumByEntryType(entries, 'receita', 'open')
  const despesaPaid = sumByEntryType(entries, 'despesa', 'paid')
  const receitaPaid = sumByEntryType(entries, 'receita', 'paid')

  const totalOpen = despesaOpen - receitaOpen
  const totalPaid = despesaPaid + receitaPaid
  const personalBalance = receitaPaid - despesaPaid

  return {
    expensePaid: despesaPaid,
    expenseOpen: despesaOpen,
    incomePaid: receitaPaid,
    incomeOpen: receitaOpen,
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
      const despesaOpen = sumByEntryType(blockEntries, 'despesa', 'open')
      const receitaOpen = sumByEntryType(blockEntries, 'receita', 'open')
      const netOpen = despesaOpen - receitaOpen
      return { block, despesaOpen, receitaOpen, netOpen, entries: blockEntries }
    })
    .filter((item) => item.despesaOpen > 0 || item.receitaOpen > 0)
    .sort((a, b) => Math.abs(b.netOpen) - Math.abs(a.netOpen))
}
