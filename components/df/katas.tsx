'use client'
import { useState } from 'react'
import { CheckCircle2, Play, Send, XCircle } from 'lucide-react'
import { useDF } from '@/lib/store'
import { KATAS } from '@/lib/seed'
import { runJS, runPattern, type TestResult } from '@/lib/runner'

const LANGS = ['Todos', 'JavaScript', 'TypeScript', 'Python', 'SQL'] as const

export function Katas() {
  const { db, user, param, update, toast } = useDF()
  const [lang, setLang] = useState<(typeof LANGS)[number]>('Todos')
  const [kid, setKid] = useState(param ?? KATAS[0].id)
  const kata = KATAS.find((k) => k.id === kid)!
  const [codes, setCodes] = useState<Record<string, string>>({})
  const code = codes[kid] ?? kata.starter
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [tab, setTab] = useState<'tests' | 'solutions'>('tests')
  const solved = db.user_progress[user!.id]?.katas ?? []

  const run = () => {
    const t0 = performance.now()
    if (kata.lang === 'Python' || kata.lang === 'SQL') {
      const r = runPattern(code, kata.tests); setResults(r)
      setLogs([`[${kata.lang} simulator] análisis sintáctico completado`, `${r.filter((x) => x.pass).length}/${r.length} criterios cumplidos`, `Tiempo: ${(performance.now() - t0).toFixed(2)}ms`])
      return r
    }
    const { results: r, logs: l } = runJS(code, kata.fn!, kata.tests, kata.lang === 'TypeScript')
    setResults(r); setLogs([...l, `Tiempo total: ${(performance.now() - t0).toFixed(2)}ms`])
    return r
  }
  const submit = () => {
    const r = run()
    if (!r.every((x) => x.pass)) return toast('Algunos tests fallan', 'err')
    const gain = (9 - kata.kyu) * 20
    if (!solved.includes(kid)) {
      update((d) => { (d.user_progress[user!.id] ??= { lessons: [], katas: [] }).katas.push(kid); d.users.find((u) => u.id === user!.id)!.xp += gain })
      toast(`¡Kata resuelta! +${gain} XP`)
    } else toast('Tests aprobados')
    setTab('solutions')
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="df-card p-4 h-fit">
        <div className="flex flex-wrap gap-1 mb-3">
          {LANGS.map((l) => <button key={l} onClick={() => setLang(l)} className={`text-xs px-2 py-1 rounded ${lang === l ? 'bg-df-primary text-white' : 'text-df-muted border border-df-border'}`}>{l}</button>)}
        </div>
        {KATAS.filter((k) => lang === 'Todos' || k.lang === lang).map((k) => (
          <button key={k.id} onClick={() => { setKid(k.id); setResults(null); setLogs([]); setTab('tests') }} className={`w-full text-left px-2 py-2 rounded text-sm ${k.id === kid ? 'bg-df-primary/15 text-df-primary' : ''}`}>
            <span className="flex items-center justify-between">{k.title}{solved.includes(k.id) && <CheckCircle2 className="size-4 text-df-ok" />}</span>
            <span className="font-mono text-[11px] text-df-muted">{k.kyu} kyu · {k.lang}</span>
          </button>
        ))}
      </aside>
      <div className="space-y-4">
        <div className="df-card p-5">
          <div className="flex items-center gap-2"><span className="df-tag">{kata.kyu} kyu</span><span className="df-tag">{kata.lang}</span></div>
          <h1 className="font-head text-2xl font-semibold mt-2">{kata.title}</h1>
          <p className="text-sm mt-1">{kata.desc}</p>
        </div>
        <textarea aria-label="Editor de código" spellCheck={false} value={code} onChange={(e) => setCodes({ ...codes, [kid]: e.target.value })} rows={10} className="w-full rounded-xl p-4 font-mono text-sm bg-df-code text-emerald-300 border border-df-border" />
        <div className="flex gap-2">
          <button onClick={run} className="df-ghost"><Play className="size-4" />Ejecutar tests</button>
          <button onClick={submit} className="df-btn !bg-df-ok"><Send className="size-4" />Enviar Solución</button>
        </div>
        <div className="df-card p-5">
          <div className="flex gap-3 border-b border-df-border mb-3 text-sm">
            <button onClick={() => setTab('tests')} className={`pb-2 ${tab === 'tests' ? 'text-df-primary border-b-2 border-df-primary' : 'text-df-muted'}`}>Test Cases</button>
            <button disabled={!solved.includes(kid)} onClick={() => setTab('solutions')} className={`pb-2 disabled:opacity-40 ${tab === 'solutions' ? 'text-df-primary border-b-2 border-df-primary' : 'text-df-muted'}`}>Soluciones de la Comunidad {!solved.includes(kid) && '(bloqueado)'}</button>
          </div>
          {tab === 'tests' ? (
            <>
              <ul className="space-y-1 text-sm font-mono">
                {kata.tests.map((t, i) => {
                  const r = results?.[i]
                  return (
                    <li key={i} className="flex items-center gap-2">
                      {!r ? <span className="text-df-muted">○ Pendiente</span> : r.pass ? <span className="text-df-ok flex items-center gap-1"><CheckCircle2 className="size-4" />Pasó</span> : <span className="text-df-err flex items-center gap-1"><XCircle className="size-4" />Falló</span>}
                      <span>{t.label}</span>{r && !r.pass && r.got && <span className="text-df-err text-xs">→ {r.got}</span>}
                      {r && <span className="ml-auto text-xs text-df-muted">{r.ms.toFixed(2)}ms</span>}
                    </li>
                  )
                })}
              </ul>
              {logs.length > 0 && <pre className="mt-3 p-3 rounded bg-df-code text-slate-300 text-xs font-mono">{logs.join('\n')}</pre>}
            </>
          ) : <pre className="p-3 rounded bg-df-code text-emerald-300 text-sm font-mono overflow-x-auto">{`// Javier_StaffEng\n${kata.solution}`}</pre>}
        </div>
      </div>
    </section>
  )
}
