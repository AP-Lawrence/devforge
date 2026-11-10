'use client'
import { useState } from 'react'
import { Terminal, ShieldCheck } from 'lucide-react'
import { uid, useDF } from '@/lib/store'
import { EXAM, levelFor, type Role } from '@/lib/seed'
import { runJS } from '@/lib/runner'

export function AuthGate() {
  const { db, login, register, toast } = useDF()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('learner')
  const [rate, setRate] = useState(25)
  const [stack, setStack] = useState('JavaScript, React')
  const [exam, setExam] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') { if (!login(email, pw)) toast('Credenciales inválidas', 'err'); return }
    if (!name.trim() || !email.includes('@') || pw.length < 6) return toast('Completa nombre, email válido y contraseña (6+)', 'err')
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return toast('Ese email ya existe', 'err')
    if (role === 'tutor') return setExam(true)
    finish(false)
  }
  const finish = (verified: boolean) =>
    register({ id: uid(), name, email, password: pw, role, xp: 0, streak: 0, karma: 0, theme: 'dark', ...(role === 'tutor' && { rate, verified, bio: `Mentor de ${stack}`, stack: stack.split(',').map((s) => s.trim()) }) })

  const lvl = levelFor(rate)
  if (exam) return <TutorExam level={lvl} rate={rate} onPass={() => finish(true)} onCancel={() => setExam(false)} />

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="df-card w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="size-6 text-df-primary" aria-hidden />
          <h1 className="font-head text-2xl font-bold">DevForge</h1>
        </div>
        <p className="text-sm text-df-muted mb-6">Inicia sesión para acceder a la plataforma.</p>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-df-card2 mb-6" role="tablist">
          {(['login', 'register'] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`py-1.5 rounded-md text-sm font-medium ${mode === m ? 'bg-df-primary text-white' : 'text-df-muted'}`}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && <label className="block text-sm">Nombre<input className="df-input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>}
          <label className="block text-sm">Email<input type="email" className="df-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block text-sm">Contraseña<input type="password" className="df-input mt-1" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
          {mode === 'register' && (
            <>
              <fieldset className="flex gap-2 text-sm">
                <legend className="mb-1">Rol</legend>
                {(['learner', 'tutor'] as const).map((r) => (
                  <button type="button" key={r} onClick={() => setRole(r)} className={`flex-1 df-ghost justify-center ${role === r ? '!border-df-primary !text-df-primary' : ''}`}>{r === 'learner' ? 'Aprendiz' : 'Tutor (Mentor)'}</button>
                ))}
              </fieldset>
              {role === 'tutor' && (
                <div className="space-y-2 rounded-lg bg-df-card2 p-3">
                  <label className="block text-sm">Tarifa: ${rate}/h
                    <input type="range" min={10} max={120} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full accent-df-primary" />
                  </label>
                  <p className="font-mono text-xs text-df-ok">Tarifa seleccionada: ${rate}/h → Nivel de Evaluación Requerido: {EXAM[lvl].label} ({EXAM[lvl].qs.length} preguntas + 1 reto, {EXAM[lvl].pass * 100}%)</p>
                  <label className="block text-sm">Stack (coma)<input className="df-input mt-1" value={stack} onChange={(e) => setStack(e.target.value)} /></label>
                </div>
              )}
            </>
          )}
          <button className="df-btn w-full justify-center">{mode === 'login' ? 'Entrar' : role === 'tutor' ? 'Continuar a la evaluación' : 'Crear cuenta'}</button>
        </form>
        <div className="mt-6 border-t border-df-border pt-4">
          <p className="text-xs text-df-muted mb-2">Cuentas demo (contraseña demo123):</p>
          <div className="flex flex-wrap gap-2">
            {[['Alex (Aprendiz)', 'alex@devforge.dev'], ['Javier (Tutor)', 'javier@devforge.dev']].map(([l, e]) => (
              <button key={e} onClick={() => login(e, 'demo123')} className="df-ghost text-xs">{l}</button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function TutorExam({ level, rate, onPass, onCancel }: { level: 1 | 2 | 3; rate: number; onPass: () => void; onCancel: () => void }) {
  const { toast } = useDF()
  const ex = EXAM[level]
  const [ans, setAns] = useState<number[]>([])
  const [code, setCode] = useState(`function ${ex.code.fn}() {\n  \n}`)
  const [score, setScore] = useState<number | null>(null)

  const grade = () => {
    const qOk = ex.qs.filter((q, i) => ans[i] === q.correct).length
    const { results } = runJS(code, ex.code.fn, ex.code.tests.map(([args, expected], i) => ({ label: `t${i}`, args, expected })))
    const total = (qOk + (results.every((r) => r.pass) ? 1 : 0)) / (ex.qs.length + 1)
    setScore(total)
    if (total >= ex.pass) { toast('¡Aprobado! Insignia Tutor Verificado'); setTimeout(onPass, 800) } else toast(`No aprobado: ${Math.round(total * 100)}%`, 'err')
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-6 space-y-4">
      <div className="df-card p-5">
        <h1 className="font-head text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-df-ok" aria-hidden /> Evaluación de Tutor — {ex.label}</h1>
        <p className="text-sm text-df-muted">Tarifa ${rate}/h · Requiere {ex.pass * 100}% para aprobar.</p>
      </div>
      {ex.qs.map((q, i) => (
        <fieldset key={i} className="df-card p-4">
          <legend className="sr-only">Pregunta {i + 1}</legend>
          <p className="font-medium mb-2">{i + 1}. {q.q}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o, j) => (
              <button key={j} onClick={() => setAns((a) => { const n = [...a]; n[i] = j; return n })} className={`df-ghost text-sm ${ans[i] === j ? '!border-df-primary !text-df-primary' : ''}`}>{o}</button>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="df-card p-4">
        <p className="font-medium mb-2">Reto de código: {ex.code.prompt}</p>
        <textarea aria-label="Código del reto" value={code} onChange={(e) => setCode(e.target.value)} rows={7} className="df-input font-mono text-sm !bg-df-code !text-emerald-300" />
      </div>
      {score !== null && <p className={`font-mono ${score >= ex.pass ? 'text-df-ok' : 'text-df-err'}`}>Puntaje: {Math.round(score * 100)}%</p>}
      <div className="flex gap-2">
        <button onClick={grade} className="df-btn">Enviar evaluación</button>
        <button onClick={onCancel} className="df-ghost">Volver</button>
      </div>
    </main>
  )
}
