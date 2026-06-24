import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { deriveStatus } from '../lib/calculations'
import { periodFromDate } from '../lib/format'
import { db } from '../lib/firebase'
import type { Entry } from '../lib/types'
import { useAuth } from './useAuth'

export function useEntries(year: number, month: number) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !user) {
      setEntries([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid),
      where('year', '==', year),
      where('month', '==', month),
      orderBy('date', 'desc'),
    )

    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry))
      setLoading(false)
    })
  }, [user, year, month])

  const addEntry = async (data: Omit<Entry, 'id' | 'createdAt' | 'status' | 'month' | 'year'>) => {
    if (!db || !user) throw new Error('Não autenticado')
    const { year, month } = periodFromDate(data.date)
    const status = deriveStatus(data.amount, data.paidAmount)
    await addDoc(collection(db, 'entries'), {
      ...data,
      year,
      month,
      status,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    })
  }

  const updateEntry = async (id: string, data: Partial<Entry>) => {
    if (!db) throw new Error('Firestore indisponível')
    const patch = { ...data }
    if (patch.date) {
      const { year, month } = periodFromDate(patch.date)
      patch.year = year
      patch.month = month
    }
    if (patch.amount !== undefined || patch.paidAmount !== undefined) {
      const current = entries.find((e) => e.id === id)
      if (current) {
        const amount = patch.amount ?? current.amount
        const paidAmount = patch.paidAmount ?? current.paidAmount
        patch.status = deriveStatus(amount, paidAmount)
      }
    }
    await updateDoc(doc(db, 'entries', id), patch)
  }

  const removeEntry = async (id: string) => {
    if (!db) throw new Error('Firestore indisponível')
    await deleteDoc(doc(db, 'entries', id))
  }

  const payEntry = async (entry: Entry, amount?: number) => {
    const paidAmount = amount ?? entry.amount
    await updateEntry(entry.id, { paidAmount })
  }

  const reopenEntry = async (entry: Entry) => {
    await updateEntry(entry.id, { paidAmount: 0 })
  }

  const deleteEntriesByBlock = async (blockId: string) => {
    if (!db || !user) return
    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid),
      where('blockId', '==', blockId),
    )
    const snap = await getDocs(q)
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }

  return { entries, loading, addEntry, updateEntry, removeEntry, payEntry, reopenEntry, deleteEntriesByBlock }
}
