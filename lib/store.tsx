'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { seedDB, type DB, type User } from './seed'

const KEY = 'DevForgeDB'
const SESSION = 'DevForgeSession'
export const uid = () => Math.random().toString(36).slice(2, 10)

type Toast = { id: string; text: string; tone: 'ok' | 'err' }
type Ctx = {
  db: DB; user: User | null; view: string; setView: (v: string) => void
  param: string | null; go: (v: string, p?: string | null) => void
  update: (fn: (d: DB) => void) => void
  login: (email: string, pw: string) => boolean; logout: () => void; register: (u: User) => void
  toast: (t: string, tone?: 'ok' | 'err') => void; toasts: Toast[]
  notify: (userId: string, text: string, view: string) => void
  paletteOpen: boolean; setPaletteOpen: (b: boolean) => void
}
const C = createContext<Ctx | null>(null)
export const useDF = () => useContext(C)!

export function DFProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [view, setView] = useState('dashboard')
  const [param, setParam] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem(KEY)
    setDb(s ? JSON.parse(s) : seedDB())
    setUserId(localStorage.getItem(SESSION))
  }, [])
  useEffect(() => { if (db) localStorage.setItem(KEY, JSON.stringify(db)) }, [db])

  const user = db?.users.find((u) => u.id === userId) ?? null
  useEffect(() => {
    document.documentElement.classList.toggle('light', user?.theme === 'light')
  }, [user?.theme])

  const update = useCallback((fn: (d: DB) => void) => {
    setDb((prev) => { const next = structuredClone(prev!); fn(next); return next })
  }, [])
  const toast = useCallback((text: string, tone: 'ok' | 'err' = 'ok') => {
    const id = uid()
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])
  const notify = useCallback((userId: string, text: string, view: string) =>
    update((d) => { d.notifications.unshift({ id: uid(), userId, text, view, read: false, at: Date.now() }) }), [update])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  if (!db) return <div className="min-h-screen bg-df-bg" />

  const go = (v: string, p: string | null = null) => { setView(v); setParam(p); window.scrollTo(0, 0) }
  const login = (email: string, pw: string) => {
    const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === pw)
    if (!u) return false
    localStorage.setItem(SESSION, u.id); setUserId(u.id); go('dashboard'); toast(`Bienvenido, ${u.name}`)
    return true
  }
  const logout = () => { localStorage.removeItem(SESSION); setUserId(null); toast('Sesión cerrada') }
  const register = (u: User) => {
    update((d) => { d.users.push(u); d.user_progress[u.id] = { lessons: [], katas: [] } })
    localStorage.setItem(SESSION, u.id); setUserId(u.id); go('dashboard'); toast('Cuenta creada')
  }

  return (
    <C.Provider value={{ db, user, view, setView, param, go, update, login, logout, register, toast, toasts, notify, paletteOpen, setPaletteOpen }}>
      {children}
    </C.Provider>
  )
}
