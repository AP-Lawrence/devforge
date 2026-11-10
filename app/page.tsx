'use client'
import { DFProvider, useDF } from '@/lib/store'
import { AuthGate } from '@/components/df/auth-gate'
import { Header } from '@/components/df/header'
import { CoursePlayer, LearnerDashboard } from '@/components/df/learner'
import { CourseEditor, DoubtsInbox, TutorPanel } from '@/components/df/tutor'
import { Katas } from '@/components/df/katas'
import { Community } from '@/components/df/community'
import { Mentors, Messages } from '@/components/df/social'
import { Footer, Palette, Toasts } from '@/components/df/shell'

function App() {
  const { user, view, param } = useDF()
  if (!user) return <><AuthGate /><Toasts /></>
  const tutor = user.role === 'tutor'
  const views: Record<string, React.ReactNode> = {
    dashboard: tutor ? <TutorPanel /> : <LearnerDashboard />,
    player: <CoursePlayer key={param} />,
    courses: <CourseEditor />,
    doubts: <DoubtsInbox />,
    katas: <Katas key={param} />,
    community: <Community />,
    mentors: <Mentors />,
    messages: <Messages key={param} />,
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">{views[view] ?? views.dashboard}</main>
      <Footer />
      <Palette />
      <Toasts />
    </div>
  )
}

export default function Page() {
  return <DFProvider><App /></DFProvider>
}
