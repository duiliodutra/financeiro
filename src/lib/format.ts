export function periodFromDate(iso: string): { year: number; month: number } {
  const [year, month] = iso.split('-').map(Number)
  return { year, month }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function monthLabel(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function forecastId(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}
