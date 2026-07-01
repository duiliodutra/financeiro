export type BlockKind = 'geral' | 'despesa' | 'receita' | 'devo' | 'me_devem'
export type EntryType = 'despesa' | 'receita'
export type EntryStatus = 'pago' | 'parcial' | 'aberto'
export type EntryScheduleMode = 'single' | 'installments' | 'recurring'

export interface Block {
  id: string
  name: string
  kind: BlockKind
  order: number
  createdAt: string
}

export interface Entry {
  id: string
  blockId: string
  type: EntryType
  description: string
  date: string
  amount: number
  paidAmount: number
  status: EntryStatus
  month: number
  year: number
  createdAt: string
  seriesId?: string
  seriesMode?: EntryScheduleMode
  installmentNumber?: number
  installmentTotal?: number
}

export interface EntrySchedule {
  mode: EntryScheduleMode
  count: number
}

export interface Forecast {
  id: string
  year: number
  month: number
  moneyInAccount: number
  receiptForecast: number
  alreadyReceived: number
}

export interface MonthRef {
  year: number
  month: number
}
