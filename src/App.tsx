import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { Layout } from './components/Layout'
import { MonthProvider } from './context/MonthContext'
import { ContasPage } from './pages/ContasPage'
import { DashboardPage } from './pages/DashboardPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthGate>
        <MonthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/contas" element={<ContasPage />} />
            </Routes>
          </Layout>
        </MonthProvider>
      </AuthGate>
    </BrowserRouter>
  )
}
