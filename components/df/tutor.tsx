'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { uid, useDF } from '@/lib/store'
import { courseProgress } from './learner'

export function TutorPanel() {
  const { db, user, go } = useDF()
  const mine = db.courses.filter((c) => c.tutorId === user!.id)
  const pending = db.course_doubts.filter((d) => mine.some((c) => c.id === d.courseId) && !d.answer).length
  return (
    <section className="space-y-6">
      <div className="df-card p-6">
        <h1 className="font-head text-3xl font-semibold">Panel de Instructor</h1>
        <p className="text-df-muted">{user!.verified ? 'Tutor Verificado' : 'Tutor'} · ${user!.rate}/h · {mine.length} cursos · {pending} dudas pendientes</p>
      </div>
      {mine.length === 0 && <button className="df-btn" onClick={() => go('courses')}><Plus className="size-4" />Crea tu primer curso</button>}
      {mine.map((c) => {
        const learners = db.users.filter((u) => u.role === 'learner')
        return (
          <div key={c.id} className="df-card p-5">
            <h2 className="font-head font-semibold">{c.title}</h2>
            <table className="w-full text-sm mt-3">
              <thead className="text-df-muted text-left text-xs font-mono"><tr><th className="py-1">Aprendiz</th><th>Avance</th><th>Última lección</th></tr></thead>
              <tbody>
                {learners.map((l) => {
                  const done = db.user_progress[l.id]?.lessons ?? []
                  const p = courseProgress(c, done)
                  const last = c.modules.flatMap((m) => m.lessons).filter((x) => done.includes(x.id)).at(-1)
                  return (
                    <tr key={l.id} className="border-t border-df-border">
                      <td className="py-2">{l.name}</td>
                      <td className="w-48"><div className="h-2 rounded-full bg-df-card2"><div className="h-full rounded-full bg-df-ok" style={{ width: `${p.pct}%` }} /></div><span className="text-xs font-mono">{p.pct}%</span></td>
                      <td className="text-df-muted">{last?.title ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </section>
  )
}

export function CourseEditor() {
  const { db, user, update, toast } = useDF()
  const mine = db.courses.filter((c) => c.tutorId === user!.id)
  const [cid, setCid] = useState(mine[0]?.id ?? null)
  const course = mine.find((c) => c.id === cid)
  const edit = (fn: (c: (typeof db.courses)[number]) => void) => update((d) => fn(d.courses.find((c) => c.id === cid)!))

  const addCourse = () => {
    const id = uid()
    update((d) => { d.courses.push({ id, title: 'Nuevo curso', desc: 'Descripción', tutorId: user!.id, modules: [] }) })
    setCid(id); toast('Curso creado')
  }
  return (
    <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="df-card p-4 h-fit space-y-1">
        <button onClick={addCourse} className="df-btn w-full justify-center mb-2"><Plus className="size-4" />Nuevo curso</button>
        {mine.map((c) => <button key={c.id} onClick={() => setCid(c.id)} className={`w-full text-left text-sm px-2 py-1.5 rounded ${c.id === cid ? 'bg-df-primary/15 text-df-primary' : ''}`}>{c.title}</button>)}
      </aside>
      {course ? (
        <div className="space-y-4">
          <div className="df-card p-5 space-y-2">
            <input aria-label="Título del curso" className="df-input font-head text-lg" value={course.title} onChange={(e) => edit((c) => { c.title = e.target.value })} />
            <input aria-label="Descripción" className="df-input" value={course.desc} onChange={(e) => edit((c) => { c.desc = e.target.value })} />
            <button onClick={() => edit((c) => { c.modules.push({ id: uid(), title: `Módulo ${c.modules.length + 1}`, lessons: [] }) })} className="df-ghost"><Plus className="size-4" />Módulo</button>
          </div>
          {course.modules.map((m, mi) => (
            <div key={m.id} className="df-card p-5 space-y-3">
              <div className="flex gap-2">
                <input aria-label="Título del módulo" className="df-input font-semibold" value={m.title} onChange={(e) => edit((c) => { c.modules[mi].title = e.target.value })} />
                <button aria-label="Eliminar módulo" onClick={() => edit((c) => { c.modules.splice(mi, 1) })} className="text-df-err p-2"><Trash2 className="size-4" /></button>
              </div>
              {m.lessons.map((l, li) => {
                const set = (k: 'title' | 'theory' | 'code' | 'question' | 'answer', v: string) => edit((c) => { c.modules[mi].lessons[li][k] = v })
                return (
                  <details key={l.id} className="rounded-lg bg-df-card2 p-3">
                    <summary className="cursor-pointer text-sm font-medium">{l.title}</summary>
                    <div className="space-y-2 mt-2">
                      <input aria-label="Subtema" className="df-input" value={l.title} onChange={(e) => set('title', e.target.value)} />
                      <textarea aria-label="Teoría (Markdown)" className="df-input" rows={3} value={l.theory} onChange={(e) => set('theory', e.target.value)} />
                      <textarea aria-label="Snippet" className="df-input font-mono" rows={3} value={l.code} onChange={(e) => set('code', e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <input aria-label="Pregunta del reto" className="df-input" value={l.question} onChange={(e) => set('question', e.target.value)} />
                        <input aria-label="Respuesta" className="df-input font-mono" value={l.answer} onChange={(e) => set('answer', e.target.value)} />
                      </div>
                      <button onClick={() => edit((c) => { c.modules[mi].lessons.splice(li, 1) })} className="text-df-err text-xs flex items-center gap-1"><Trash2 className="size-3" />Eliminar subtema</button>
                    </div>
                  </details>
                )
              })}
              <button onClick={() => edit((c) => { c.modules[mi].lessons.push({ id: uid(), title: 'Nuevo subtema', theory: 'Teoría...', code: '// código', question: 'Pregunta', answer: 'respuesta' }) })} className="df-ghost text-xs"><Plus className="size-3" />Subtema</button>
            </div>
          ))}
          <p className="text-xs text-df-muted">Los cambios se guardan automáticamente.</p>
        </div>
      ) : <p className="text-df-muted">Crea un curso para empezar.</p>}
    </section>
  )
}

export function DoubtsInbox() {
  const { db, user, update, toast, notify } = useDF()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const ids = db.courses.filter((c) => c.tutorId === user!.id).map((c) => c.id)
  const list = db.course_doubts.filter((d) => ids.includes(d.courseId))
  return (
    <section className="space-y-4">
      <h1 className="font-head text-2xl font-semibold">Dudas de Aprendices</h1>
      {list.length === 0 && <p className="text-df-muted">No hay dudas todavía.</p>}
      {list.map((d) => {
        const lesson = db.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons)).find((l) => l.id === d.lessonId)
        return (
          <div key={d.id} className="df-card p-5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-df-muted">{db.users.find((u) => u.id === d.userId)?.name} · {lesson?.title}</span>
              <span className={d.answer ? 'text-df-ok' : 'text-df-err'}>{d.answer ? 'Respondida' : 'Pendiente'}</span>
            </div>
            <p className="mt-2">{d.text}</p>
            {d.answer ? <p className="mt-2 text-sm text-df-ok">↳ {d.answer}</p> : (
              <div className="flex gap-2 mt-3">
                <input aria-label="Respuesta" className="df-input" value={drafts[d.id] ?? ''} onChange={(e) => setDrafts({ ...drafts, [d.id]: e.target.value })} />
                <button className="df-btn" onClick={() => {
                  if (!drafts[d.id]?.trim()) return
                  update((db2) => { db2.course_doubts.find((x) => x.id === d.id)!.answer = drafts[d.id] })
                  notify(d.userId, `${user!.name} respondió tu duda`, 'dashboard'); toast('Respuesta publicada')
                }}>Responder</button>
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
