import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const jb = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jb' })

export const metadata: Metadata = {
  title: 'DevForge - Entorno de Precisión para Ingenieros',
  description: 'Plataforma LMS interactiva: cursos, katas multilenguaje, comunidad y mentores.',
}
export const viewport: Viewport = { themeColor: '#0f172a' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geist.variable} ${space.variable} ${jb.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
