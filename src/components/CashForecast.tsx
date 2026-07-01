import { useState } from 'react'
import { Banknote, TrendingUp, Wallet } from 'lucide-react'
import type { Forecast } from '../lib/types'

interface Props {
  forecast: Forecast
  onSave: (data: Partial<Forecast>) => Promise<void>
}

function Field({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const [local, setLocal] = useState(String(value))

  const commit = () => {
    const n = parseFloat(local.replace(',', '.')) || 0
    onChange(n)
    setLocal(String(n))
  }

  return (
    <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium uppercase">{label}</span>
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="mt-2 w-full border-0 bg-transparent text-xl font-semibold text-slate-800 focus:outline-none focus:ring-0"
      />
    </div>
  )
}

export function CashForecast({ forecast, onSave }: Props) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-800">Previsão de Caixa</h2>
      <p className="text-sm text-slate-500">Valores usados no cálculo de fechamento</p>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <Field
          icon={<Wallet size={16} />}
          label="Dinheiro em Conta"
          value={forecast.moneyInAccount}
          onChange={(v) => onSave({ moneyInAccount: v })}
        />
        <Field
          icon={<TrendingUp size={16} />}
          label="Previsão de Recebimento"
          value={forecast.receiptForecast}
          onChange={(v) => onSave({ receiptForecast: v })}
        />
        <Field
          icon={<Banknote size={16} />}
          label="Já Recebido"
          value={forecast.alreadyReceived}
          onChange={(v) => onSave({ alreadyReceived: v })}
        />
      </div>
    </section>
  )
}
