'use client'
import { useState } from 'react'
import { BadgeCheck, CalendarPlus, Search, Send, SquarePen, X } from 'lucide-react'
import { uid, useDF } from '@/lib/store'

export function Mentors() {
  const { db, user, go, update, toast, notify } = useDF()
  const tutors = db.users.filter((u) => u.role === 'tutor' && u.verified)
  const book = (id: string, name: string) => {
    update((d) => { d.direct_messages.push({ id: uid(), from: user!.id, to: id, text: '[Reserva] Solicitud de tutoría agendada para mañana 18:00', at: Date.now() }) })
    notify(id, `${user!.name} agendó una tutoría contigo`, 'messages')
    toast(`Tutoría agendada con ${name}`)
  }
  return (
    <section className="space-y-4">
      <h1 className="font-head text-2xl font-semibold">Mentores Verificados</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {tutors.map((t) => (
          <article key={t.id} className="df-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-df-card2 grid place-items-center font-mono text-df-primary">{t.name.slice(0, 2).toUpperCase()}</div>
              <div><h2 className="font-semibold">{t.name}</h2><p className="text-xs text-df-ok flex items-center gap-1"><BadgeCheck className="size-3" />Tutor Verificado</p></div>
              <span className="ml-auto font-mono text-sm">${t.rate}/h</span>
            </div>
            <p className="text-sm text-df-muted">{t.bio}</p>
            <div className="flex flex-wrap gap-1">{t.stack?.map((s) => <span key={s} className="df-tag">{s}</span>)}</div>
            {t.id !== user!.id && (
              <div className="flex gap-2">
                <button onClick={() => book(t.id, t.name)} className="df-btn text-xs"><CalendarPlus className="size-4" />Agendar</button>
                <button onClick={() => go('messages', t.id)} className="df-ghost text-xs">Mensaje</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export function Messages() {
  const { db, user, param, update, notify, toast } = useDF()
  const me = user!.id
  const [opened, setOpened] = useState<string[]>(param ? [param] : [])
  const [picking, setPicking] = useState(false)
  const hasThread = (id: string) => db.direct_messages.some((m) => (m.from === id && m.to === me) || (m.to === id && m.from === me))
  const contacts = db.users.filter((u) => u.id !== me && (hasThread(u.id) || opened.includes(u.id)))
  const [peer, setPeer] = useState(param ?? contacts[0]?.id ?? null)
  const [text, setText] = useState('')
  const openWith = (id: string, name: string) => {
    if (!hasThread(id)) setOpened((o) => (o.includes(id) ? o : [...o, id]))
    setPeer(id); setPicking(false); toast(`Conversación iniciada con ${name}`)
  }
  const thread = db.direct_messages.filter((m) => (m.from === me && m.to === peer) || (m.to === me && m.from === peer))
  const send = () => {
    if (!text.trim() || !peer) return
    update((d) => { d.direct_messages.push({ id: uid(), from: me, to: peer, text, at: Date.now() }) })
    notify(peer, `${user!.name}: ${text.slice(0, 40)}`, 'messages'); setText('')
  }
  return (
    <section className="grid gap-4 md:grid-cols-[240px_1fr] min-h-[60vh]">
      <aside className="df-card p-3 space-y-1">
        <h1 className="font-head font-semibold px-2 pb-2">Mensajes / Reservas</h1>
        <button onClick={() => setPicking(true)} className="df-btn w-full text-xs mb-2"><SquarePen className="size-4" />Nuevo Mensaje</button>
        {contacts.length === 0 && <p className="text-sm text-df-muted px-2">Sin conversaciones. Escribe a un mentor.</p>}
        {contacts.map((c) => <button key={c.id} onClick={() => setPeer(c.id)} className={`w-full text-left text-sm px-2 py-2 rounded ${peer === c.id ? 'bg-df-primary/15 text-df-primary' : ''}`}>{c.name}</button>)}
      </aside>
      <div className="df-card p-4 flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {thread.map((m) => (
            <p key={m.id} className={`max-w-[75%] text-sm px-3 py-2 rounded-lg ${m.from === me ? 'ml-auto bg-df-primary text-white' : 'bg-df-card2'}`}>{m.text}</p>
          ))}
        </div>
        {peer && (
          <div className="flex gap-2 mt-3">
            <input aria-label="Mensaje" className="df-input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send() }} />
            <button aria-label="Enviar" onClick={send} className="df-btn"><Send className="size-4" /></button>
          </div>
        )}
      </div>
      {picking && <NewChatModal onClose={() => setPicking(false)} onPick={openWith} />}
    </section>
  )
}

function NewChatModal({ onClose, onPick }: { onClose: () => void; onPick: (id: string, name: string) => void }) {
  const { db, user } = useDF()
  const [q, setQ] = useState('')
  const term = q.toLowerCase()
  const list = db.users.filter((u) => u.id !== user!.id && (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)))
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="nc-title" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div onClick={(e) => e.stopPropagation()} className="bg-df-card2 border border-df-border rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="nc-title" className="font-head text-lg font-semibold">Nuevo Mensaje</h2>
          <button aria-label="Cerrar" onClick={onClose} className="text-df-muted hover:text-df-fg"><X className="size-5" /></button>
        </div>
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-df-muted" />
          <input autoFocus type="text" aria-label="Buscar usuario" placeholder="Buscar por nombre o correo..." className="df-input pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ul className="max-h-72 overflow-y-auto space-y-1">
          {list.length === 0 && <li className="text-sm text-df-muted px-2 py-4 text-center">Sin resultados</li>}
          {list.map((u) => (
            <li key={u.id}>
              <button onClick={() => onPick(u.id, u.name)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-df-primary/10 text-left">
                <span className="size-9 shrink-0 rounded-full bg-df-card grid place-items-center font-mono text-xs text-df-primary">{u.name.slice(0, 2).toUpperCase()}</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium truncate">{u.name}</span><span className="block text-xs text-df-muted truncate">{u.email}</span></span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${u.role === 'tutor' ? 'border-df-ok/40 text-df-ok' : 'border-df-primary/40 text-df-primary'}`}>{u.role === 'tutor' ? 'Tutor' : 'Aprendiz'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
