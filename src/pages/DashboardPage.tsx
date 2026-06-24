import { useMemo } from 'react'
import { useMonth } from '../context/MonthContext'
import { useBlocks } from '../hooks/useBlocks'
import { useEntries } from '../hooks/useEntries'
import { useForecast } from '../hooks/useForecast'
import {
  closingForecast,
  openByBlock,
  summaryFromEntries,
} from '../lib/calculations'
import { CashForecast } from '../components/CashForecast'
import { OpenAccountsList } from '../components/OpenAccountsList'
import { SummaryCards } from '../components/SummaryCards'

export function DashboardPage() {
  const { year, month } = useMonth()
  const { blocks } = useBlocks()
  const { entries } = useEntries(year, month)
  const { forecast, saveForecast } = useForecast(year, month)

  const summary = useMemo(() => summaryFromEntries(entries), [entries])
  const forecastValue = useMemo(
    () => closingForecast(forecast, summary),
    [forecast, summary],
  )

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
        personalBalance={summary.personalBalance}
        totalPaid={summary.totalPaid}
        totalOpen={summary.totalOpen}
        expenseOpen={summary.expenseOpen}
        incomeOpen={summary.incomeOpen}
        closingForecast={forecastValue}
      />
      <CashForecast forecast={forecast} onSave={saveForecast} />
      <OpenAccountsList items={openItems} />
    </div>
  )
}
