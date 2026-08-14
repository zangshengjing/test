import { create } from 'zustand'
import type { TimeBlock, TimeBlockPatch } from '../../../shared/types'
import { api } from '../api/client'

interface ScheduleState {
  blocks: TimeBlock[]
  loading: boolean
  fetchSchedule: (date: string) => Promise<void>
  patchBlock: (date: string, id: string, patch: TimeBlockPatch) => Promise<void>
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  blocks: [],
  loading: false,
  fetchSchedule: async (date) => {
    set({ loading: true })
    try {
      const res = await api.get<{ blocks: TimeBlock[] }>(`/schedule?date=${date}`)
      set({ blocks: res.blocks, loading: false })
    } catch (e) {
      console.error('[schedule] 加载失败', e)
      set({ loading: false })
    }
  },
  patchBlock: async (date, id, patch) => {
    const res = await api.patch<{ block: TimeBlock }>(`/schedule/${date}/blocks/${id}`, patch)
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? res.block : b)),
    }))
  },
}))
