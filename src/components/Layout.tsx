import { MonthSelector } from './MonthSelector'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Financeiro Deyse</h1>
            <p className="text-sm text-slate-500">Contas pessoais, previsão e saldo</p>
          </div>
          <MonthSelector />
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
