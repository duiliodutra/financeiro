import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { forecastId } from '../lib/format'
import { db } from '../lib/firebase'
import type { Forecast } from '../lib/types'
import { useAuth } from './useAuth'

const emptyForecast = (year: number, month: number): Forecast => ({
  id: forecastId(year, month),
  year,
  month,
  moneyInAccount: 0,
  receiptForecast: 0,
  alreadyReceived: 0,
})

export function useForecast(year: number, month: number) {
  const { user } = useAuth()
  const [forecast, setForecast] = useState<Forecast>(emptyForecast(year, month))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !user) {
      setForecast(emptyForecast(year, month))
      setLoading(false)
      return
    }

    const id = forecastId(year, month)
    const ref = doc(db, 'forecasts', `${user.uid}_${id}`)

    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setForecast(snap.data() as Forecast)
      } else {
        setForecast(emptyForecast(year, month))
      }
      setLoading(false)
    })
  }, [user, year, month])

  const saveForecast = async (data: Partial<Forecast>) => {
    if (!db || !user) return
    const id = forecastId(year, month)
    const ref = doc(db, 'forecasts', `${user.uid}_${id}`)
    await setDoc(ref, { ...emptyForecast(year, month), ...forecast, ...data, userId: user.uid }, { merge: true })
  }

  return { forecast, loading, saveForecast }
}
