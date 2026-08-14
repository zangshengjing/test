import type { ReactNode } from 'react'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { ToastViewer } from '../common/toast'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 md:px-6 md:pb-12 md:pt-8">
        {children}
      </main>
      <BottomNav />
      <ToastViewer />
    </div>
  )
}
