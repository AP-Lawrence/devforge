export type TestResult = { label: string; pass: boolean; got?: string; ms: number }

export const stripTS = (s: string) =>
  s
    .replace(/function\s+(\w+)\s*<[^>]*>/g, 'function $1')
    .replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (_, n, p: string) => `function ${n}(${p.replace(/(\w+)\??\s*:\s*[^,]+/g, '$1')})`)
    .replace(/\)\s*:\s*[^{=]+\{/g, ') {')
    .replace(/\b(const|let)\s+(\w+)\s*:\s*[^=]+=/g, '$1 $2 =')
    .replace(/\s+as\s+[\w<>[\]]+/g, '')

export function runJS(code: string, fn: string, tests: { label: string; args?: unknown[]; expected?: unknown }[], ts = false): { results: TestResult[]; logs: string[] } {
  const logs: string[] = []
  const fakeConsole = { log: (...a: unknown[]) => logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) }
  let f: (...a: unknown[]) => unknown
  try {
    f = new Function('console', `${ts ? stripTS(code) : code}\nreturn typeof ${fn} !== 'undefined' ? ${fn} : undefined`)(fakeConsole)
    if (typeof f !== 'function') throw new Error(`No se encontró la función ${fn}`)
  } catch (e) {
    return { results: tests.map((t) => ({ label: t.label, pass: false, got: String((e as Error).message), ms: 0 })), logs }
  }
  const results = tests.map((t) => {
    const t0 = performance.now()
    try {
      const got = f(...structuredClone(t.args ?? []))
      return { label: t.label, pass: JSON.stringify(got) === JSON.stringify(t.expected), got: JSON.stringify(got), ms: performance.now() - t0 }
    } catch (e) {
      return { label: t.label, pass: false, got: (e as Error).message, ms: performance.now() - t0 }
    }
  })
  return { results, logs }
}

export function runPattern(code: string, tests: { label: string; pattern?: string }[]): TestResult[] {
  return tests.map((t) => {
    const t0 = performance.now()
    return { label: t.label, pass: new RegExp(t.pattern!, 'i').test(code), ms: performance.now() - t0 }
  })
}
