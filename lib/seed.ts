export type Role = 'learner' | 'tutor'
export type User = {
  id: string; name: string; email: string; password: string; role: Role
  xp: number; streak: number; karma: number; theme: 'dark' | 'light'
  rate?: number; verified?: boolean; bio?: string; stack?: string[]
}
export type Lesson = { id: string; title: string; theory: string; code: string; question: string; answer: string }
export type Module = { id: string; title: string; lessons: Lesson[] }
export type Course = { id: string; title: string; desc: string; tutorId: string; modules: Module[] }
export type Doubt = { id: string; courseId: string; lessonId: string; userId: string; text: string; answer?: string; at: number }
export type Thread = { id: string; authorId: string; title: string; body: string; code?: string; tags: string[]; votes: Record<string, number>; solved: boolean; bookmarks: string[]; at: number }
export type Comment = { id: string; threadId: string; authorId: string; body: string; votes: Record<string, number>; accepted: boolean; at: number }
export type Message = { id: string; from: string; to: string; text: string; at: number }
export type Notification = { id: string; userId: string; text: string; read: boolean; view: string; at: number }
export type Progress = { lessons: string[]; katas: string[] }
export type DB = {
  users: User[]; user_progress: Record<string, Progress>; courses: Course[]; course_doubts: Doubt[]
  forum_threads: Thread[]; forum_comments: Comment[]; direct_messages: Message[]; notifications: Notification[]
}

type L = [string, string, string, string, string]
const raw: Record<string, { title: string; desc: string; mods: [string, L[]][] }> = {
  js: {
    title: 'Fundamentos de JavaScript & DOM',
    desc: 'Closures, promesas, manipulación del DOM y eventos.',
    mods: [
      ['Variables y Tipos', [
        ['let, const y var', 'const impide reasignar la referencia; let tiene alcance de bloque; var es de función y sufre hoisting.', 'const a = 1\nlet b = 2\nb = 3', '¿Qué palabra clave impide reasignar una variable?', 'const'],
        ['Tipos primitivos', 'JS tiene 7 primitivos: string, number, bigint, boolean, undefined, symbol y null.', 'typeof null // ???', '¿Qué devuelve typeof null?', 'object'],
        ['Coerción', '== aplica coerción de tipos; === compara valor y tipo sin coerción.', "'1' == 1  // true\n'1' === 1 // false", "¿Qué devuelve '1' === 1?", 'false'],
      ]],
      ['Funciones y Closures', [
        ['Funciones flecha', 'Las arrow functions no tienen su propio this y permiten retorno implícito.', 'const sum = (a, b) => a + b', '¿Qué devuelve sum(2, 3)?', '5'],
        ['Closures', 'Una closure recuerda el ámbito léxico donde fue creada.', 'const c = () => { let n = 0; return () => ++n }\nconst f = c(); f(); f()', '¿Qué devuelve la segunda llamada f()?', '2'],
        ['Callbacks', 'Un callback es una función pasada como argumento para ejecutarse después.', '[1,2,3].map(x => x * 2)', '¿Qué método crea un nuevo array transformando cada elemento?', 'map'],
      ]],
      ['Asincronía y DOM', [
        ['Promesas', 'Una Promise puede estar pending, fulfilled o rejected.', 'fetch(url).then(r => r.json())', '¿Qué estado tiene una promesa aún no resuelta?', 'pending'],
        ['async/await', 'await pausa la función async hasta que la promesa se resuelve.', 'const data = await fetch(url)', '¿Qué palabra debe preceder a una función para usar await?', 'async'],
        ['Eventos del DOM', 'addEventListener registra manejadores sin sobrescribir otros.', "btn.addEventListener('click', fn)", '¿Qué método registra un manejador de eventos?', 'addEventListener'],
      ]],
    ],
  },
  react: {
    title: 'React: interfaces que escalan',
    desc: 'Componentes, hooks y gestión de estado eficiente.',
    mods: [
      ['Componentes', [
        ['JSX', 'JSX es azúcar sintáctico sobre React.createElement.', 'const el = <h1>Hola</h1>', '¿JSX se compila a llamadas de React.____?', 'createElement'],
        ['Props', 'Las props son inmutables y fluyen de padre a hijo.', 'function Card({ title }) { return <h2>{title}</h2> }', '¿Las props fluyen de padre a ____?', 'hijo'],
        ['Listas y keys', 'Cada elemento de una lista necesita una prop key estable.', 'items.map(i => <li key={i.id}>{i.name}</li>)', '¿Qué prop requiere cada elemento de una lista?', 'key'],
      ]],
      ['Hooks', [
        ['useState', 'useState devuelve [valor, setter].', 'const [n, setN] = useState(0)', '¿Qué hook maneja estado local?', 'useState'],
        ['useEffect', 'Sin array de dependencias, el efecto corre en cada render.', 'useEffect(() => { load() }, [])', '¿Qué se pasa para que el efecto corra solo al montar? (símbolo)', '[]'],
        ['useMemo', 'useMemo memoriza un valor calculado entre renders.', 'const total = useMemo(() => sum(xs), [xs])', '¿Qué hook memoriza valores calculados?', 'useMemo'],
      ]],
      ['Estado global', [
        ['Context', 'Context evita el prop drilling compartiendo valores en el árbol.', 'const Ctx = createContext(null)', '¿Qué función crea un contexto?', 'createContext'],
        ['Zustand', 'Zustand es un store mínimo basado en hooks.', 'const useStore = create(set => ({ n: 0 }))', '¿Qué función de Zustand crea el store?', 'create'],
        ['Server Components', 'Los RSC se renderizan en el servidor y no envían JS al cliente.', "'use client' // marca componentes cliente", '¿Qué directiva marca un componente cliente? (sin comillas)', 'use client'],
      ]],
    ],
  },
  ts: {
    title: 'TypeScript para equipos reales',
    desc: 'Tipado estricto, genéricos y patrones avanzados.',
    mods: [
      ['Tipos básicos', [
        ['Anotaciones', 'Anotamos tipos con dos puntos tras el identificador.', 'let age: number = 30', '¿Qué tipo tiene age?', 'number'],
        ['Interfaces', 'Las interfaces describen la forma de un objeto y se pueden extender.', 'interface User { id: string }', '¿Qué palabra clave declara una interfaz?', 'interface'],
        ['Unions', 'Un union type acepta uno de varios tipos.', "type Status = 'ok' | 'error'", '¿Qué símbolo crea un union type?', '|'],
      ]],
      ['Genéricos', [
        ['Funciones genéricas', 'Los genéricos parametrizan tipos.', 'function id<T>(x: T): T { return x }', '¿Qué letra se usa por convención para un genérico?', 'T'],
        ['Constraints', 'extends restringe un genérico.', 'function len<T extends { length: number }>(x: T) {}', '¿Qué palabra restringe un genérico?', 'extends'],
        ['Utility types', 'Partial, Pick, Omit y Record transforman tipos.', 'type P = Partial<User>', '¿Qué utility hace opcionales todas las props?', 'Partial'],
      ]],
      ['Patrones', [
        ['Discriminated unions', 'Un campo literal común permite estrechar el tipo.', "type R = { ok: true; data: T } | { ok: false; error: string }", '¿Cómo se llama el campo común? (en inglés: ___ field)', 'discriminant'],
        ['Type guards', 'Funciones con "x is T" estrechan tipos.', 'function isStr(x: unknown): x is string', '¿Qué palabra se usa en el retorno de un type guard?', 'is'],
        ['satisfies', 'satisfies valida un tipo sin ampliarlo.', 'const cfg = { a: 1 } satisfies Config', '¿Qué operador valida sin ampliar el tipo?', 'satisfies'],
      ]],
    ],
  },
}

export const buildCourses = (): Course[] =>
  Object.entries(raw).map(([k, c]) => ({
    id: k, title: c.title, desc: c.desc, tutorId: 'u-javier',
    modules: c.mods.map(([mt, ls], mi) => ({
      id: `${k}-m${mi}`, title: mt,
      lessons: ls.map(([title, theory, code, question, answer], li) => ({ id: `${k}-m${mi}-l${li}`, title, theory, code, question, answer })),
    })),
  }))

const H = 3600_000
export const seedDB = (): DB => ({
  users: [
    { id: 'u-alex', name: 'Alex Mercer', email: 'alex@devforge.dev', password: 'demo123', role: 'learner', xp: 2450, streak: 12, karma: 34, theme: 'dark' },
    { id: 'u-javier', name: 'Javier_StaffEng', email: 'javier@devforge.dev', password: 'demo123', role: 'tutor', xp: 9800, streak: 40, karma: 512, theme: 'dark', rate: 85, verified: true, bio: 'Staff Engineer. Arquitectura frontend y rendimiento.', stack: ['React', 'TypeScript', 'Node'] },
    { id: 'u-carlos', name: 'Carlos_Dev', email: 'carlos@devforge.dev', password: 'demo123', role: 'tutor', xp: 4200, streak: 8, karma: 140, theme: 'dark', rate: 25, verified: true, bio: 'Mentor de JavaScript para principiantes.', stack: ['JavaScript', 'DOM'] },
    { id: 'u-mariana', name: 'Mariana_Codex', email: 'mariana@devforge.dev', password: 'demo123', role: 'learner', xp: 900, streak: 3, karma: 20, theme: 'dark' },
  ],
  user_progress: {
    'u-alex': { lessons: ['js-m0-l0', 'js-m0-l1', 'js-m0-l2', 'js-m1-l0', 'js-m1-l1', 'react-m0-l0', 'react-m0-l1'], katas: ['k1'] },
    'u-mariana': { lessons: ['js-m0-l0'], katas: [] },
  },
  courses: buildCourses(),
  course_doubts: [
    { id: 'd1', courseId: 'js', lessonId: 'js-m1-l1', userId: 'u-alex', text: '¿Las closures causan fugas de memoria?', at: Date.now() - 5 * H },
  ],
  forum_threads: [
    { id: 't1', authorId: 'u-carlos', title: '¿Por qué mi llamada con fetch dentro de un useEffect provoca un bucle infinito?', body: 'Estaba cargando datos en el montaje pero omití el array de dependencias. ¡La terminal empezó a disparar 15 peticiones por segundo!', code: 'useEffect(() => { fetchData() }, []) // Array vacío clave', tags: ['JavaScript', 'React'], votes: { 'u-alex': 1, 'u-mariana': 1 }, solved: true, bookmarks: [], at: Date.now() - 2 * H },
    { id: 't2', authorId: 'u-mariana', title: '¿Cuál es la forma más limpia de tipar una respuesta de API genérica en TypeScript 5?', body: '¿Interfaz genérica o discriminated union para { data: T, status, error }?', tags: ['TypeScript', 'Generics'], votes: { 'u-alex': 1 }, solved: false, bookmarks: [], at: Date.now() - 5 * H },
    { id: 't3', authorId: 'u-javier', title: 'Guía: Por qué no deberías abusar de Redux Toolkit en proyectos pequeños', body: 'La sobreingeniería es el mayor obstáculo de los juniors. Zustand y Context cubren el 90% de los casos.', tags: ['Arquitectura', 'State'], votes: { 'u-alex': 1, 'u-mariana': 1, 'u-carlos': 1 }, solved: false, bookmarks: [], at: Date.now() - 24 * H },
  ],
  forum_comments: [
    { id: 'c1', threadId: 't1', authorId: 'u-javier', body: 'Pasa [] como dependencias o usa SWR para evitar efectos de fetch.', votes: { 'u-carlos': 1 }, accepted: true, at: Date.now() - H },
    { id: 'c2', threadId: 't2', authorId: 'u-alex', body: 'Yo usaría un discriminated union con ok: true | false.', votes: {}, accepted: false, at: Date.now() - 3 * H },
  ],
  direct_messages: [
    { id: 'm1', from: 'u-javier', to: 'u-alex', text: '¡Hola Alex! Vi tu duda sobre closures, la respondo pronto.', at: Date.now() - 4 * H },
  ],
  notifications: [
    { id: 'n1', userId: 'u-alex', text: 'Javier_StaffEng te envió un mensaje', read: false, view: 'messages', at: Date.now() - 4 * H },
  ],
})

export type Kata = {
  id: string; title: string; lang: 'JavaScript' | 'TypeScript' | 'Python' | 'SQL'; kyu: number; desc: string; starter: string
  fn?: string; tests: { label: string; args?: unknown[]; expected?: unknown; pattern?: string }[]; solution: string
}
export const KATAS: Kata[] = [
  { id: 'k1', title: 'Suma de un array', lang: 'JavaScript', kyu: 8, desc: 'Devuelve la suma de todos los números del array.', fn: 'sum', starter: 'function sum(arr) {\n  // tu código\n}', tests: [{ label: 'sum([1,2,3]) → 6', args: [[1, 2, 3]], expected: 6 }, { label: 'sum([]) → 0', args: [[]], expected: 0 }, { label: 'sum([-1,1]) → 0', args: [[-1, 1]], expected: 0 }, { label: 'sum([10]) → 10', args: [[10]], expected: 10 }], solution: 'const sum = a => a.reduce((x, y) => x + y, 0)' },
  { id: 'k2', title: 'Palíndromo', lang: 'JavaScript', kyu: 7, desc: 'Devuelve true si el string es palíndromo (ignora mayúsculas).', fn: 'isPal', starter: 'function isPal(s) {\n  \n}', tests: [{ label: "isPal('Ana') → true", args: ['Ana'], expected: true }, { label: "isPal('dev') → false", args: ['dev'], expected: false }, { label: "isPal('') → true", args: [''], expected: true }, { label: "isPal('Oso') → true", args: ['Oso'], expected: true }], solution: "const isPal = s => s.toLowerCase() === [...s.toLowerCase()].reverse().join('')" },
  { id: 'k3', title: 'Agrupar por clave', lang: 'TypeScript', kyu: 5, desc: 'groupBy(items, key) devuelve un objeto con arrays agrupados por la clave.', fn: 'groupBy', starter: 'function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {\n  \n}', tests: [{ label: 'agrupa por tipo', args: [[{ t: 'a' }, { t: 'b' }, { t: 'a' }], 't'], expected: { a: [{ t: 'a' }, { t: 'a' }], b: [{ t: 'b' }] } }, { label: 'array vacío → {}', args: [[], 't'], expected: {} }, { label: 'un elemento', args: [[{ t: 'x' }], 't'], expected: { x: [{ t: 'x' }] } }, { label: 'claves numéricas', args: [[{ t: 1 }, { t: 1 }], 't'], expected: { 1: [{ t: 1 }, { t: 1 }] } }], solution: 'const groupBy = (xs, k) => xs.reduce((acc, x) => ((acc[x[k]] ??= []).push(x), acc), {})' },
  { id: 'k4', title: 'FizzBuzz', lang: 'Python', kyu: 8, desc: 'Define fizzbuzz(n) que devuelva "Fizz", "Buzz", "FizzBuzz" o el número como string.', starter: 'def fizzbuzz(n):\n    pass', tests: [{ label: 'define la función fizzbuzz', pattern: 'def\\s+fizzbuzz\\s*\\(\\s*n\\s*\\)' }, { label: 'usa módulo % 3', pattern: '%\\s*3' }, { label: 'usa módulo % 5', pattern: '%\\s*5' }, { label: 'retorna un valor', pattern: 'return' }], solution: 'def fizzbuzz(n):\n    if n % 15 == 0: return "FizzBuzz"\n    if n % 3 == 0: return "Fizz"\n    if n % 5 == 0: return "Buzz"\n    return str(n)' },
  { id: 'k5', title: 'Top clientes', lang: 'SQL', kyu: 6, desc: 'Selecciona name y total de customers ordenado por total descendente, límite 5.', starter: 'SELECT ', tests: [{ label: 'SELECT name, total', pattern: 'select\\s+name\\s*,\\s*total' }, { label: 'FROM customers', pattern: 'from\\s+customers' }, { label: 'ORDER BY total DESC', pattern: 'order\\s+by\\s+total\\s+desc' }, { label: 'LIMIT 5', pattern: 'limit\\s+5' }], solution: 'SELECT name, total FROM customers ORDER BY total DESC LIMIT 5;' },
  { id: 'k6', title: 'Debounce', lang: 'JavaScript', kyu: 4, desc: 'Implementa debounce(fn, ms) que devuelva una función. (Los tests validan que retorne una función y conserve this/args.)', fn: 'check', starter: 'function debounce(fn, ms) {\n  \n}\nfunction check(){ const d = debounce(() => 1, 10); return typeof d }', tests: [{ label: 'retorna una función', args: [], expected: 'function' }], solution: 'function debounce(fn, ms){ let t; return function(...a){ clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms) } }' },
]

export type ExamQ = { q: string; options: string[]; correct: number }
export const EXAM: Record<1 | 2 | 3, { label: string; pass: number; qs: ExamQ[]; code: { prompt: string; fn: string; tests: [unknown[], unknown][] } }> = {
  1: { label: 'Básico', pass: 0.7, qs: [
    { q: '¿Qué devuelve typeof []?', options: ['array', 'object', 'list'], correct: 1 },
    { q: '¿Qué método añade al final de un array?', options: ['push', 'shift', 'concat'], correct: 0 },
    { q: '¿Qué hook maneja estado en React?', options: ['useRef', 'useState', 'useId'], correct: 1 },
  ], code: { prompt: 'Escribe function double(n) que devuelva n * 2.', fn: 'double', tests: [[[2], 4], [[0], 0], [[-3], -6]] } },
  2: { label: 'Senior', pass: 0.8, qs: [
    { q: '¿Qué corre primero?', options: ['setTimeout 0', 'Promise.then', 'Igual'], correct: 1 },
    { q: 'Patrón para desacoplar emisores y receptores:', options: ['Singleton', 'Observer', 'Decorator'], correct: 1 },
    { q: '¿Qué evita re-renders de hijos con props iguales?', options: ['React.memo', 'useEffect', 'Fragment'], correct: 0 },
    { q: 'Complejidad de buscar en un Map:', options: ['O(n)', 'O(log n)', 'O(1)'], correct: 2 },
  ], code: { prompt: 'Escribe function unique(arr) que elimine duplicados preservando el orden.', fn: 'unique', tests: [[[[1, 1, 2]], [1, 2]], [[[]], []], [[['a', 'b', 'a']], ['a', 'b']]] } },
  3: { label: 'Experto Staff', pass: 1, qs: [
    { q: '¿Qué estructura permite que objetos sean recolectados si no hay otras referencias?', options: ['Map', 'WeakMap', 'Set'], correct: 1 },
    { q: '¿Qué primitiva coordina memoria compartida entre Workers?', options: ['Atomics', 'Proxy', 'Reflect'], correct: 0 },
    { q: 'Mitigación principal contra XSS:', options: ['CORS', 'Escapar salida + CSP', 'HTTPS'], correct: 1 },
    { q: 'Tipo que nunca debe ocurrir en TS:', options: ['unknown', 'void', 'never'], correct: 2 },
    { q: '¿Qué patrón limita la concurrencia de N promesas?', options: ['Pool/semaphore', 'Promise.race', 'Promise.any'], correct: 0 },
  ], code: { prompt: 'Escribe function fib(n) eficiente (n hasta 70) que devuelva el n-ésimo Fibonacci (fib(0)=0).', fn: 'fib', tests: [[[0], 0], [[10], 55], [[70], 190392490709135]] } },
}
export const levelFor = (rate: number): 1 | 2 | 3 => (rate <= 30 ? 1 : rate <= 60 ? 2 : 3)
