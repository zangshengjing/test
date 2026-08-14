import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Onboarding from './pages/Onboarding'
import { useProfileStore } from './store/useProfileStore'
import { initDayWatcher, useTodayStore } from './store/useTodayStore'
import { toast } from './components/common/toast'
import { formatCN } from './utils/date'

const TodayPage = lazy(() => import('./pages/TodayPage'))
const GrowthPage = lazy(() => import('./pages/GrowthPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))
const GoalDetailPage = lazy(() => import('./pages/GoalDetailPage'))

function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="skeleton h-6 w-44 rounded-xl" />
    </div>
  )
}

export default function App() {
  const profile = useProfileStore((s) => s.profile)
  const loading = useProfileStore((s) => s.loading)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // 0 点跨天监听：新的一天自动切换并提示
  useEffect(() => {
    const stop = initDayWatcher((day) => {
      toast({
        title: '新的一天已开始',
        description: `今天是 ${formatCN(day)}，继续加油！`,
        type: 'success',
      })
    })
    return stop
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="skeleton h-8 w-44 rounded-xl" />
      </div>
    )
  }

  if (!profile || !profile.onboarded) {
    return <Onboarding />
  }

  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/growth" element={<GrowthPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/goals/:id" element={<GoalDetailPage />} />
            <Route path="*" element={<TodayPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  )
}
