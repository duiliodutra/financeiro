import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Block } from '../lib/types'
import { useAuth } from './useAuth'

export function useBlocks() {
  const { user } = useAuth()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !user) {
      setBlocks([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'blocks'),
      where('userId', '==', user.uid),
      orderBy('order', 'asc'),
    )

    return onSnapshot(q, (snap) => {
      setBlocks(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Block))
      setLoading(false)
    })
  }, [user])

  const addBlock = async (data: Omit<Block, 'id' | 'createdAt'>) => {
    if (!db || !user) return
    await addDoc(collection(db, 'blocks'), {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    })
  }

  const updateBlock = async (id: string, data: Partial<Block>) => {
    if (!db) return
    await updateDoc(doc(db, 'blocks', id), data)
  }

  const removeBlock = async (id: string) => {
    if (!db) return
    await deleteDoc(doc(db, 'blocks', id))
  }

  return { blocks, loading, addBlock, updateBlock, removeBlock }
}
