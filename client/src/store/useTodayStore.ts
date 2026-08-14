import { create } from 'zustand'
import { todayStr } from '../utils/date'

interface TodayState {
  /** 当前业务日期 YYYY-MM-DD */
  today: string
  /** 手动触发一次日期检查（0 点跨天检测） */
  checkDay: () => void
}

export const useTodayStore = create<TodayState>((set) => ({
  today: todayStr(),
  checkDay: () => {
    const now = todayStr()
    set((s) => (s.today === now ? s : { today: now }))
  },
}))

/**
 * 0 点跨天监听：
 * - setInterval 每分钟比对日期
 * - visibilitychange / focus 事件补偿（休眠恢复、切回页面场景）
 * 跨天后调用 onDayChange 通知各业务 store 重新拉取当日数据
 */
export function initDayWatcher(onDayChange: (day: string) => void): () => void {
  let prev = useTodayStore.getState().today
  let fired = 0

  const fire = () => {
    const now = todayStr()
    if (now !== prev) {
      prev = now
      useTodayStore.setState({ today: now })
      fired++
      onDayChange(now)
    }
  }

  const timer = setInterval(fire, 60_000)
  const onVis = () => {
    if (document.visibilityState === 'visible') fire()
  }
  const onFocus = () => fire()

  document.addEventListener('visibilitychange', onVis)
  window.addEventListener('focus', onFocus)

  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('focus', onFocus)
  }
}
