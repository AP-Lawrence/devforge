'use client'
import { useState } from 'react'
import { ArrowDown, ArrowUp, Bookmark, CheckCircle2, MessageSquare, Plus, Share2, Trash2 } from 'lucide-react'
import { uid, useDF } from '@/lib/store'
import type { DB } from '@/lib/seed'

const score = (v: Record<string, number>) => Object.values(v).reduce((a, b) => a + b, 0)
const ago = (t: number) => { const h = Math.floor((Date.now() - t) / 3600_000); return h < 1 ? 'hace minutos' : h < 24 ? `hace ${h} h` : `hace ${Math.floor(h / 24)} d` }
const FILTERS = ['Tendencias', 'Más recientes', 'Sin resolver', 'Resueltos', 'Guardados'] as const

function Votes({ votes, onVote, me }: { votes: Record<string, number>; onVote: (v: number) => void; me: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-df-border px-2 py-2 h-fit font-mono text-sm">
      <button aria-label="Votar a favor" onClick={() => onVote(1)} className={votes[me] === 1 ? 'text-df-ok' : 'text-df-muted hover:text-df-ok'}><ArrowUp className="size-4" /></button>
      <span>{score(votes)}</span>
      <button aria-label="Votar en contra" onClick={() => onVote(-1)} className={votes[me] === -1 ? 'text-df-err' : 'text-df-muted hover:text-df-err'}><ArrowDown className="size-4" /></button>
    </div>
  )
}

export function Community() {
  const { db, user, param, go, update, toast } = useDF()
  const me = user!.id
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Tendencias')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', code: '', tags: '' })
  const [reply, setReply] = useState('')
  const name = (id: string) => db.users.find((u) => u.id === id)?.name ?? 'Usuario'
  const vote = (pick: (d: DB) => { votes: Record<string, number> }) => (v: number) =>
    update((d) => { const o = pick(d); o.votes[me] === v ? delete o.votes[me] : (o.votes[me] = v) })

  let list = [...db.forum_threads]
  if (filter === 'Tendencias') list.sort((a, b) => score(b.votes) - score(a.votes))
  if (filter === 'Más recientes') list.sort((a, b) => b.at - a.at)
  if (filter === 'Sin resolver') list = list.filter((t) => !t.solved)
  if (filter === 'Resueltos') list = list.filter((t) => t.solved)
  if (filter === 'Guardados') list = list.filter((t) => t.bookmarks.includes(me))

  const thread = db.forum_threads.find((t) => t.id === param)
  const delThread = (id: string) => { update((d) => { d.forum_threads = d.forum_threads.filter((t) => t.id !== id); d.forum_comments = d.forum_comments.filter((c) => c.threadId !== id) }); go('community'); toast('Publicación eliminada') }
  const actions = (t: (typeof list)[number]) => (
    <div className="flex items-center gap-4 text-xs text-df-muted">
      <button onClick={() => go('community', t.id)} className="flex items-center gap-1 hover:text-df-primary"><MessageSquare className="size-4" />{db.forum_comments.filter((c) => c.threadId === t.id).length} respuestas</button>
      <button onClick={() => { navigator.clipboard?.writeText(`${location.origin}/#thread-${t.id}`); toast('Enlace copiado') }} className="flex items-center gap-1 hover:text-df-primary"><Share2 className="size-4" />Compartir</button>
      <button onClick={() => update((d) => { const x = d.forum_threads.find((y) => y.id === t.id)!; x.bookmarks = x.bookmarks.includes(me) ? x.bookmarks.filter((b) => b !== me) : [...x.bookmarks, me] })} className={`flex items-center gap-1 ${t.bookmarks.includes(me) ? 'text-df-primary' : 'hover:text-df-primary'}`}><Bookmark className="size-4" />Guardar</button>
      {t.authorId === me && <button onClick={() => delThread(t.id)} className="flex items-center gap-1 text-df-err"><Trash2 className="size-4" />Eliminar</button>}
    </div>
  )
  const Card = ({ t, full }: { t: (typeof list)[number]; full?: boolean }) => (
    <article className="df-card p-5 flex gap-4">
      <Votes votes={t.votes} me={me} onVote={vote((d) => d.forum_threads.find((x) => x.id === t.id)!)} />
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-xs text-df-muted flex flex-wrap items-center gap-2">
          <span className={`font-mono px-2 py-0.5 rounded border ${t.solved ? 'text-df-ok border-df-ok/40' : 'text-df-err border-df-err/40'}`}>{t.solved ? 'Resuelto' : 'Sin Resolver'}</span>
          Publicado por <b className="text-df-fg">{name(t.authorId)}</b> · {ago(t.at)}
        </p>
        <button onClick={() => go('community', t.id)} className="text-left font-head text-lg font-semibold hover:text-df-primary">{t.title}</button>
        <p className={`text-sm text-df-muted ${full ? '' : 'line-clamp-2'}`}>{t.body}</p>
        {t.code && <pre className="p-3 rounded-lg bg-df-code text-emerald-300 font-mono text-sm overflow-x-auto">{t.code}</pre>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">{t.tags.map((g) => <span key={g} className="df-tag">{g}</span>)}</div>
          {actions(t)}
        </div>
      </div>
    </article>
  )

  if (thread) {
    const comments = db.forum_comments.filter((c) => c.threadId === thread.id).sort((a, b) => +b.accepted - +a.accepted || score(b.votes) - score(a.votes))
    return (
      <section className="space-y-4">
        <button onClick={() => go('community')} className="text-sm text-df-primary">← Comunidad</button>
        <Card t={thread} full />
        <h2 className="font-head font-semibold">{comments.length} respuestas</h2>
        {comments.map((c) => (
          <div key={c.id} className={`df-card p-4 flex gap-4 ${c.accepted ? '!border-df-ok' : ''}`}>
            <Votes votes={c.votes} me={me} onVote={vote((d) => d.forum_comments.find((x) => x.id === c.id)!)} />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-df-muted"><b className="text-df-fg">{name(c.authorId)}</b> · {ago(c.at)} {c.accepted && <span className="ml-2 text-df-ok font-mono inline-flex items-center gap-1"><CheckCircle2 className="size-3" />Solución Aceptada</span>}</p>
              <p className="text-sm">{c.body}</p>
              <div className="flex gap-3 text-xs">
                {thread.authorId === me && !c.accepted && <button className="text-df-ok" onClick={() => { update((d) => { d.forum_comments.find((x) => x.id === c.id)!.accepted = true; d.forum_threads.find((x) => x.id === thread.id)!.solved = true; d.users.find((u) => u.id === c.authorId)!.karma += 15 }); toast('Solución aceptada (+15 Karma al autor)') }}>Aceptar solución</button>}
                {c.authorId === me && <button className="text-df-err flex items-center gap-1" onClick={() => { update((d) => { d.forum_comments = d.forum_comments.filter((x) => x.id !== c.id) }); toast('Comentario eliminado') }}><Trash2 className="size-3" />Eliminar comentario</button>}
              </div>
            </div>
          </div>
        ))}
        <div className="df-card p-4">
          <textarea aria-label="Tu respuesta" className="df-input" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Escribe una respuesta..." />
          <button className="df-btn mt-2" onClick={() => { if (!reply.trim()) return; update((d) => { d.forum_comments.push({ id: uid(), threadId: thread.id, authorId: me, body: reply, votes: {}, accepted: false, at: Date.now() }) }); if (thread.authorId !== me) update((d) => { d.notifications.unshift({ id: uid(), userId: thread.authorId, text: `${user!.name} respondió tu hilo`, view: 'community', read: false, at: Date.now() }) }); setReply(''); toast('Respuesta publicada') }}>Publicar respuesta</button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="df-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-head text-2xl font-semibold">Comunidad de Desarrolladores</h1><p className="text-sm text-df-muted">Comparte dudas, debate soluciones y colabora.</p></div>
        <button className="df-btn" onClick={() => setCreating(!creating)}><Plus className="size-4" />Crear Publicación</button>
      </div>
      {creating && (
        <form className="df-card p-5 space-y-2" onSubmit={(e) => { e.preventDefault(); if (!form.title.trim() || !form.body.trim()) return toast('Título y contenido requeridos', 'err'); update((d) => { d.forum_threads.unshift({ id: uid(), authorId: me, title: form.title, body: form.body, code: form.code || undefined, tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean), votes: {}, solved: false, bookmarks: [], at: Date.now() }) }); setForm({ title: '', body: '', code: '', tags: '' }); setCreating(false); setFilter('Más recientes'); toast('Publicación creada') }}>
          <input aria-label="Título" placeholder="Título" className="df-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea aria-label="Contenido" placeholder="Describe tu duda" className="df-input" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <textarea aria-label="Snippet" placeholder="Snippet de código (opcional)" className="df-input font-mono" rows={2} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input aria-label="Etiquetas" placeholder="Etiquetas separadas por coma" className="df-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <button className="df-btn">Publicar</button>
        </form>
      )}
      <div className="flex flex-wrap gap-2 border-b border-df-border pb-3" role="tablist">
        {FILTERS.map((f) => <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`text-sm px-3 py-1.5 rounded-md ${filter === f ? 'bg-df-primary/15 text-df-primary border border-df-primary/40' : 'text-df-muted'}`}>{f}</button>)}
      </div>
      {list.length === 0 && <p className="text-df-muted">No hay hilos aquí.</p>}
      {list.map((t) => <Card key={t.id} t={t} />)}
    </section>
  )
}
