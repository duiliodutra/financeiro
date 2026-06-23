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
import type { Block } from '../lib/types'
import { CashForecast } from '../components/CashForecast'
import { OpenAccountsList } from '../components/OpenAccountsList'
import { SummaryCards } from '../components/SummaryCards'

export function DashboardPage() {
  const { year, month } = useMonth()
  const { blocks } = useBlocks()
  const { entries } = useEntries(year, month)
  const { forecast, saveForecast } = useForecast(year, month)

  const summary = useMemo(() => summaryFromEntries(entries, blocks), [entries, blocks])
  const forecastValue = useMemo(
    () => closingForecast(forecast, summary),
    [forecast, summary],
  )

  const openGroups = useMemo(() => {
    const kinds: Block['kind'][] = ['despesa', 'receita', 'devo', 'me_devem']
    return kinds
      .map((kind) => {
        const kindBlocks = blocks.filter((b) => b.kind === kind)
        const items = openByBlock(entries, kindBlocks).map(({ block, open }) => ({
          name: block.name,
          open,
        }))
        const subtotal = items.reduce((s, i) => s + i.open, 0)
        return { kind, items, subtotal }
      })
      .filter((g) => g.subtotal > 0)
  }, [blocks, entries])

  return (
    <div>
      <SummaryCards
        personalBalance={summary.personalBalance}
        totalPaid={summary.totalPaid}
        totalOpen={summary.totalOpen}
        devoOpen={summary.devoOpen}
        meDevemOpen={summary.meDevemOpen}
        closingForecast={forecastValue}
      />
      <CashForecast forecast={forecast} onSave={saveForecast} />
      <OpenAccountsList groups={openGroups} />
    </div>
  )
}
