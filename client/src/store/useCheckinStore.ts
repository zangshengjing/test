import { create } from 'zustand'
import type { CheckIn } from '../../../shared/types'
import { api } from '../api/client'

interface CheckinState {
  /** taskId → CheckIn */
  checkins: Record<string, CheckIn>
  fetchCheckins: (date: string) => Promise<void>
  /** 乐观更新打卡，失败回滚 */
  toggle: (date: string, taskId: string, completed: boolean) => Promise<void>
}

export const useCheckinStore = create<CheckinState>((set) => ({
  checkins: {},
  fetchCheckins: async (date) => {
    try {
      const res = await api.get<{ checkins: CheckIn[] }>(`/checkins?date=${date}`)
      const map: Record<string, CheckIn> = {}
      for (const c of res.checkins) map[c.taskId] = c
      set({ checkins: map })
    } catch (e) {
      console.error('[checkins] 加载失败', e)
    }
  },
  toggle: async (date, taskId, completed) => {
    const prev = useCheckinStore.getState().checkins[taskId]
    const optimistic: CheckIn = {
      date,
      taskId,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      durationMin: prev?.durationMin ?? null,
    }
    set((s) => ({ checkins: { ...s.checkins, [taskId]: optimistic } }))
    try {
      const res = await api.put<{ checkin: CheckIn }>(`/checkins/${date}/${taskId}`, { completed })
      set((s) => ({ checkins: { ...s.checkins, [taskId]: res.checkin } }))
    } catch (e) {
      console.error('[checkins] 打卡失败', e)
      set((s) => {
        const next = { ...s.checkins }
        if (prev) next[taskId] = prev
        else delete next[taskId]
        return { checkins: next }
      })
    }
  },
}))
