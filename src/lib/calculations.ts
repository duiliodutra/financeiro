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

export function summaryFromEntries(entries: Entry[], blocks: Block[]) {
  const expenses = entries.filter((e) => e.type === 'despesa')
  const incomes = entries.filter((e) => e.type === 'receita')

  const expensePaid = expenses.reduce((s, e) => s + e.paidAmount, 0)
  const expenseOpen = expenses.reduce((s, e) => s + entryRemaining(e), 0)
  const incomePaid = incomes.reduce((s, e) => s + e.paidAmount, 0)
  const incomeOpen = incomes.reduce((s, e) => s + entryRemaining(e), 0)

  const devoBlocks = blocks.filter((b) => b.kind === 'devo')
  const meDevemBlocks = blocks.filter((b) => b.kind === 'me_devem')

  const devoOpen = entries
    .filter((e) => devoBlocks.some((b) => b.id === e.blockId))
    .reduce((s, e) => s + entryRemaining(e), 0)

  const meDevemOpen = entries
    .filter((e) => meDevemBlocks.some((b) => b.id === e.blockId))
    .reduce((s, e) => s + entryRemaining(e), 0)

  const totalOpen = expenseOpen + devoOpen - incomeOpen - meDevemOpen
  const totalPaid = expensePaid + incomePaid
  const grandTotal = entries.reduce((s, e) => s + e.amount, 0)

  return {
    expensePaid,
    expenseOpen,
    incomePaid,
    incomeOpen,
    devoOpen,
    meDevemOpen,
    totalOpen,
    totalPaid,
    grandTotal,
    personalBalance: incomePaid - expensePaid,
    netOpen: incomeOpen - expenseOpen,
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
