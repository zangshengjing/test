import { create } from 'zustand'
import type { StatsData } from '../../../shared/types'
import { api } from '../api/client'

interface ProgressState {
  stats: StatsData | null
  /** 数据版本号：每次成功拉取 +1，供页面 useMemo 依赖缓存 */
  version: number
  fetchStats: () => Promise<void>
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  stats: null,
  version: 0,
  fetchStats: async () => {
    try {
      const res = await api.get<StatsData>('/stats')
      set({ stats: res, version: get().version + 1 })
    } catch (e) {
      console.error('[stats] 统计加载失败', e)
    }
  },
}))
