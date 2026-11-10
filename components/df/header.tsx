'use client'
import { useState } from 'react'
import { Bell, Flame, LogOut, Moon, Search, Sun, Terminal, Zap } from 'lucide-react'
import { useDF } from '@/lib/store'

export function Header() {
  const { db, user, view, go, update, logout, setPaletteOpen } = useDF()
  const [open, setOpen] = useState<'notif' | 'user' | null>(null)
  const [onlyUnread, setOnlyUnread] = useState(true)
  const u = user!
  const nav = u.role === 'tutor'
    ? [['dashboard', 'Panel de Instructor'], ['courses', 'Mis Cursos'], ['doubts', 'Dudas'], ['katas', 'Retos'], ['community', 'Comunidad'], ['messages', 'Mensajes']]
    : [['dashboard', 'Dashboard'], ['katas', 'Katas'], ['community', 'Comunidad'], ['mentors', 'Mentores'], ['messages', 'Mensajes']]
  const notifs = db.notifications.filter((n) => n.userId === u.id)
  const unread = notifs.filter((n) => !n.read).length
  const shown = onlyUnread ? notifs.filter((n) => !n.read) : notifs

  return (
    <header className="sticky top-0 z-40 border-b border-df-border bg-df-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <button onClick={() => go('dashboard')} className="flex items-center gap-2 font-head text-xl font-bold text-df-primary">
          <Terminal className="size-5" aria-hidden /> DevForge
        </button>
        <button onClick={() => setPaletteOpen(true)} className="hidden sm:flex items-center gap-2 df-input !w-56 text-df-muted text-left">
          <Search className="size-4" aria-hidden /> <span className="flex-1">Buscar...</span><kbd className="df-tag">Ctrl K</kbd>
        </button>
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto" aria-label="Principal">
          {nav.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} aria-current={view === id ? 'page' : undefined} className={`px-3 py-2 text-sm whitespace-nowrap rounded-md ${view === id ? 'text-df-primary font-semibold bg-df-primary/10' : 'text-df-muted hover:text-df-fg'}`}>{label}</button>
          ))}
        </nav>
        <div className="hidden xl:flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full border border-df-border"><Flame className="size-4 text-df-err" aria-hidden />{u.streak} días</span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full border border-df-border text-df-ok"><Zap className="size-4 text-df-primary" aria-hidden />{u.xp.toLocaleString()} XP</span>
        </div>
        <button aria-label="Cambiar tema" onClick={() => update((d) => { const x = d.users.find((y) => y.id === u.id)!; x.theme = x.theme === 'dark' ? 'light' : 'dark' })} className="p-2 rounded-md text-df-muted hover:text-df-primary">
          {u.theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </button>
        <div className="relative">
          <button aria-label={`Notificaciones (${unread} sin leer)`} onClick={() => setOpen(open === 'notif' ? null : 'notif')} className="relative p-2 rounded-md text-df-muted hover:text-df-primary">
            <Bell className="size-5" />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-df-err text-white text-[10px] grid place-items-center font-mono">{unread}</span>}
          </button>
          {open === 'notif' && (
            <div className="absolute right-0 mt-2 w-80 df-card !bg-df-card2 shadow-2xl p-2">
              <div className="flex items-center justify-between px-2 pb-2 text-xs">
                <div className="flex gap-1">
                  {[true, false].map((v) => <button key={String(v)} onClick={() => setOnlyUnread(v)} className={`px-2 py-1 rounded ${onlyUnread === v ? 'bg-df-primary text-white' : 'text-df-muted'}`}>{v ? 'No leídas' : 'Todas'}</button>)}
                </div>
                <button className="text-df-primary" onClick={() => update((d) => d.notifications.forEach((n) => { if (n.userId === u.id) n.read = true }))}>Marcar todas</button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {shown.length === 0 && <li className="p-3 text-sm text-df-muted">Sin notificaciones</li>}
                {shown.map((n) => (
                  <li key={n.id}>
                    <button onClick={() => { update((d) => { d.notifications.find((x) => x.id === n.id)!.read = true }); go(n.view); setOpen(null) }} className="w-full text-left p-2 rounded hover:bg-df-bg text-sm flex gap-2">
                      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-df-primary" />}
                      <span>{n.text}<span className="block text-xs text-df-muted">{new Date(n.at).toLocaleString()}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="relative">
          <button aria-label="Menú de usuario" onClick={() => setOpen(open === 'user' ? null : 'user')} className="size-8 rounded-full bg-df-card2 border border-df-border font-mono text-xs text-df-primary">
            {u.name.slice(0, 2).toUpperCase()}
          </button>
          {open === 'user' && (
            <div className="absolute right-0 mt-2 w-56 df-card !bg-df-card2 shadow-2xl p-2 text-sm">
              <p className="px-2 font-semibold">{u.name}</p>
              <p className="px-2 pb-2 text-xs text-df-ok font-mono">{u.role === 'tutor' ? (u.verified ? 'Tutor Verificado' : 'Tutor') : 'Aprendiz'} · {u.karma} karma</p>
              <button onClick={logout} className="w-full flex items-center gap-2 p-2 rounded text-df-err hover:bg-df-bg"><LogOut className="size-4" />Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
