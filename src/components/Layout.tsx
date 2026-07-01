import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet } from 'lucide-react'
import { MonthSelector } from './MonthSelector'

export function Layout({ children }: { children: React.ReactNode }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Financeiro Deyse</h1>
            <p className="text-sm text-slate-500">Contas pessoais e saldo</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <NavLink to="/" end className={linkClass}>
                <LayoutDashboard size={16} />
                Resumo
              </NavLink>
              <NavLink to="/contas" className={linkClass}>
                <Wallet size={16} />
                Contas
              </NavLink>
            </nav>
            <MonthSelector />
          </div>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
