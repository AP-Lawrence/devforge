'use client'
import { useState } from 'react'
import { CheckCircle2, Circle, MessageCircleQuestion, Play } from 'lucide-react'
import { uid, useDF } from '@/lib/store'
import type { Course } from '@/lib/seed'

export const courseProgress = (c: Course, done: string[]) => {
  const all = c.modules.flatMap((m) => m.lessons)
  const n = all.filter((l) => done.includes(l.id)).length
  return { n, total: all.length, pct: all.length ? Math.round((n / all.length) * 100) : 0 }
}

export function LearnerDashboard() {
  const { db, user, go } = useDF()
  const done = db.user_progress[user!.id]?.lessons ?? []
  return (
    <section className="space-y-6">
      <div className="df-card p-6">
        <h1 className="font-head text-3xl font-semibold">¡Hola, {user!.name.split(' ')[0]}!</h1>
        <p className="text-df-muted mt-1">{user!.xp} XP · racha de {user!.streak} días · {db.user_progress[user!.id]?.katas.length ?? 0} retos resueltos</p>
      </div>
      <h2 className="font-head text-xl font-semibold">Mis Cursos</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {db.courses.map((c) => {
          const p = courseProgress(c, done)
          return (
            <article key={c.id} className="df-card p-5 flex flex-col">
              <h3 className="font-head text-lg font-semibold">{c.title}</h3>
              <p className="text-sm text-df-muted flex-1 mt-1">{c.desc}</p>
              <div className="mt-4 text-xs font-mono flex justify-between"><span>{p.n}/{p.total} lecciones</span><span className="text-df-ok">{p.pct}%</span></div>
              <div className="h-2 rounded-full bg-df-card2 mt-1 overflow-hidden"><div className="h-full bg-df-ok transition-all" style={{ width: `${p.pct}%` }} /></div>
              <button onClick={() => go('player', c.id)} className="df-btn mt-4 justify-center"><Play className="size-4" />{p.n ? 'Continuar' : 'Empezar'}</button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function CoursePlayer() {
  const { db, user, param, update, toast, notify, go } = useDF()
  const course = db.courses.find((c) => c.id === param)
  const lessons = course?.modules.flatMap((m) => m.lessons) ?? []
  const done = db.user_progress[user!.id]?.lessons ?? []
  const [lid, setLid] = useState(lessons.find((l) => !done.includes(l.id))?.id ?? lessons[0]?.id)
  const [ans, setAns] = useState('')
  const [doubt, setDoubt] = useState('')
  if (!course) return <p>Curso no encontrado. <button className="text-df-primary" onClick={() => go('dashboard')}>Volver</button></p>
  const lesson = lessons.find((l) => l.id === lid) ?? lessons[0]
  const isDone = done.includes(lesson?.id)

  const validate = () => {
    if (ans.trim().toLowerCase() !== lesson.answer.toLowerCase()) return toast('Respuesta incorrecta, inténtalo de nuevo', 'err')
    update((d) => {
      const p = (d.user_progress[user!.id] ??= { lessons: [], katas: [] })
      if (!p.lessons.includes(lesson.id)) { p.lessons.push(lesson.id); d.users.find((u) => u.id === user!.id)!.xp += 25 }
    })
    toast('Lección completada +25 XP')
    const i = lessons.indexOf(lesson)
    if (lessons[i + 1]) { setLid(lessons[i + 1].id); setAns('') }
  }
  const sendDoubt = () => {
    if (!doubt.trim()) return
    update((d) => { d.course_doubts.unshift({ id: uid(), courseId: course.id, lessonId: lesson.id, userId: user!.id, text: doubt, at: Date.now() }) })
    notify(course.tutorId, `${user!.name} envió una duda en "${lesson.title}"`, 'doubts')
    setDoubt(''); toast('Duda enviada al tutor')
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="df-card p-4 h-fit">
        <button onClick={() => go('dashboard')} className="text-xs text-df-primary mb-2">← Dashboard</button>
        <h2 className="font-head font-semibold mb-3">{course.title}</h2>
        {course.modules.map((m, mi) => (
          <div key={m.id} className="mb-3">
            <p className="text-xs font-mono text-df-muted mb-1">MÓDULO {mi + 1} · {m.title}</p>
            {m.lessons.map((l) => (
              <button key={l.id} onClick={() => { setLid(l.id); setAns('') }} className={`w-full flex items-center gap-2 text-left text-sm px-2 py-1.5 rounded ${l.id === lesson.id ? 'bg-df-primary/15 text-df-primary' : ''}`}>
                {done.includes(l.id) ? <CheckCircle2 className="size-4 text-df-ok shrink-0" /> : <Circle className="size-4 text-df-muted shrink-0" />}{l.title}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <article className="space-y-4">
        <div className="df-card p-6">
          <h1 className="font-head text-2xl font-semibold">{lesson.title}</h1>
          <p className="mt-3 leading-relaxed">{lesson.theory}</p>
          <pre className="mt-4 p-4 rounded-lg bg-df-code text-emerald-300 font-mono text-sm overflow-x-auto">{lesson.code}</pre>
        </div>
        <div className="df-card p-6">
          <h2 className="font-head font-semibold">Reto práctico</h2>
          <p className="text-sm mt-1">{lesson.question}</p>
          <div className="flex gap-2 mt-3">
            <input aria-label="Tu respuesta" className="df-input font-mono" value={ans} onChange={(e) => setAns(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) validate() }} />
            <button onClick={validate} className="df-btn whitespace-nowrap">{isDone ? 'Repasar' : 'Validar y Completar Lección'}</button>
          </div>
          {isDone && <p className="text-df-ok text-sm mt-2 flex items-center gap-1"><CheckCircle2 className="size-4" />Lección completada</p>}
        </div>
        <div className="df-card p-6">
          <h2 className="font-head font-semibold flex items-center gap-2"><MessageCircleQuestion className="size-5 text-df-primary" />Enviar duda al Tutor</h2>
          <textarea aria-label="Tu duda" className="df-input mt-3" rows={2} value={doubt} onChange={(e) => setDoubt(e.target.value)} />
          <button onClick={sendDoubt} className="df-ghost mt-2">Enviar duda</button>
          {db.course_doubts.filter((d) => d.lessonId === lesson.id && d.userId === user!.id).map((d) => (
            <div key={d.id} className="mt-3 text-sm border-l-2 border-df-primary pl-3">
              <p>{d.text}</p>
              <p className={d.answer ? 'text-df-ok' : 'text-df-muted'}>{d.answer ? `Tutor: ${d.answer}` : 'Pendiente de respuesta'}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
