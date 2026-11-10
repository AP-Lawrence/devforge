'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useDF } from '@/lib/store'
import { KATAS } from '@/lib/seed'

export function Toasts() {
  const { toasts } = useDF()
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`animate-in slide-in-from-right fade-in px-4 py-3 rounded-lg shadow-lg text-sm text-white ${t.tone === 'ok' ? 'bg-df-ok' : 'bg-df-err'}`}>{t.text}</div>
      ))}
    </div>
  )
}

export function Palette() {
  const { db, paletteOpen, setPaletteOpen, go } = useDF()
  const [q, setQ] = useState('')
  if (!paletteOpen) return null
  const s = q.toLowerCase()
  const items = [
    ...db.courses.map((c) => ({ k: 'Curso', label: c.title, act: () => go('player', c.id) })),
    ...KATAS.map((k) => ({ k: 'Kata', label: k.title, act: () => go('katas', k.id) })),
    ...db.forum_threads.map((t) => ({ k: 'Hilo', label: t.title, act: () => go('community', t.id) })),
    ...db.users.filter((u) => u.role === 'tutor' && u.verified).map((u) => ({ k: 'Mentor', label: u.name, act: () => go('mentors') })),
  ].filter((i) => i.label.toLowerCase().includes(s)).slice(0, 10)
  const close = () => { setPaletteOpen(false); setQ('') }
  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-start justify-center pt-24 px-4" onClick={close}>
      <div role="dialog" aria-label="Buscador global" className="df-card !bg-df-card2 w-full max-w-lg p-2" onClick={(e) => e.stopPropagation()}>
        <input autoFocus className="df-input" placeholder="Buscar cursos, katas, hilos, mentores..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') close(); if (e.key === 'Enter' && items[0] && !e.nativeEvent.isComposing && e.keyCode !== 229) { items[0].act(); close() } }} />
        <ul className="mt-2 max-h-80 overflow-y-auto">
          {items.map((i, n) => (
            <li key={n}><button onClick={() => { i.act(); close() }} className="w-full text-left flex gap-3 items-center px-3 py-2 rounded hover:bg-df-bg text-sm"><span className="df-tag w-16 text-center">{i.k}</span>{i.label}</button></li>
          ))}
          {items.length === 0 && <li className="p-3 text-sm text-df-muted">Sin resultados</li>}
        </ul>
      </div>
    </div>
  )
}

const DOCS: Record<string, React.ReactNode> = {
  'Documentación': <ul className="list-disc pl-5 space-y-1"><li>Ctrl/⌘ + K abre el buscador global.</li><li>Los retos JS/TS se ejecutan en tu navegador con new Function y 4+ tests.</li><li>Python y SQL usan un simulador de análisis sintáctico.</li><li>Todo tu progreso se guarda en DevForgeDB (localStorage).</li></ul>,
  'Karma y Rangos': <table className="w-full text-left font-mono text-xs"><thead><tr><th>Rango</th><th>XP</th></tr></thead><tbody>{[8, 7, 6, 5, 4, 3, 2, 1].map((k, i) => <tr key={k} className="border-t border-df-border"><td className="py-1">{k} kyu</td><td>{i * 500}+</td></tr>)}</tbody><caption className="caption-bottom pt-2 text-left">Lección +25 XP · Kata (9−kyu)×20 XP · Solución aceptada +15 Karma</caption></table>,
  'Código de Conducta': <ul className="list-disc pl-5 space-y-1"><li>Respeto ante todo, sin ataques personales.</li><li>Incluye snippets mínimos reproducibles.</li><li>Marca la solución aceptada para ayudar a otros.</li></ul>,
  'Programa de Mentores': <ul className="list-disc pl-5 space-y-1"><li>$10–30/h: 3 preguntas + reto, 70%.</li><li>$31–60/h: 4 preguntas + reto, 80%.</li><li>$61+/h: 5 preguntas + reto, 100%.</li><li>Comisión de plataforma: 15%.</li></ul>,
  'Status': <ul className="font-mono text-xs space-y-1"><li className="text-df-ok">● Todos los sistemas operativos · 99.98% Uptime</li><li>API: {20 + Math.round(Math.random() * 20)}ms</li><li>Code Runner: {5 + Math.round(Math.random() * 10)}ms</li></ul>,
}

export function Footer() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <footer className="border-t border-df-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4 text-sm">
        <p className="text-df-muted"><b className="font-head text-df-fg">DevForge</b> © 2026 · Entornos de precisión para ingenieros.</p>
        <nav className="flex flex-wrap gap-4 font-mono text-xs" aria-label="Footer">
          {Object.keys(DOCS).map((k) => <button key={k} onClick={() => setOpen(k)} className="text-df-muted hover:text-df-primary">{k}</button>)}
        </nav>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={() => setOpen(null)}>
          <div role="dialog" aria-label={open} className="df-card !bg-df-card2 w-full max-w-md p-6 text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h2 className="font-head text-lg font-semibold">{open}</h2><button aria-label="Cerrar" onClick={() => setOpen(null)}><X className="size-5" /></button></div>
            {DOCS[open]}
          </div>
        </div>
      )}
    </footer>
  )
}
