import { useMemo } from 'react'
import { useMonth } from '../context/MonthContext'
import { useBlocks } from '../hooks/useBlocks'
import { useEntries } from '../hooks/useEntries'
import {
  openByBlock,
  summaryFromEntries,
} from '../lib/calculations'
import { OpenAccountsList } from '../components/OpenAccountsList'
import { SummaryCards } from '../components/SummaryCards'

export function DashboardPage() {
  const { year, month } = useMonth()
  const { blocks } = useBlocks()
  const { entries } = useEntries(year, month)

  const summary = useMemo(() => summaryFromEntries(entries), [entries])
  const balance = summary.incomeOpen - summary.expenseOpen

  const openItems = useMemo(
    () =>
      openByBlock(entries, blocks).map(({ block, despesaOpen, receitaOpen, netOpen }) => ({
        name: block.name,
        despesaOpen,
        receitaOpen,
        netOpen,
      })),
    [blocks, entries],
  )

  return (
    <div>
      <SummaryCards
        expenseOpen={summary.expenseOpen}
        incomeOpen={summary.incomeOpen}
        balance={balance}
      />
      <OpenAccountsList items={openItems} />
    </div>
  )
}
