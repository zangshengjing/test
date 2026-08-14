import { create } from 'zustand'
import type { Goal, GoalInput } from '../../../shared/types'
import { api } from '../api/client'

export interface GoalWithProgress extends Goal {
  progress?: { total: number; done: number; rate: number }
}

interface GoalState {
  goals: GoalWithProgress[]
  loading: boolean
  fetchGoals: () => Promise<void>
  addGoal: (input: GoalInput) => Promise<void>
  updateGoal: (id: string, patch: Partial<GoalInput> & { status?: string }) => Promise<void>
  removeGoal: (id: string) => Promise<void>
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  loading: false,
  fetchGoals: async () => {
    set({ loading: true })
    try {
      const res = await api.get<{ goals: GoalWithProgress[] }>('/goals')
      set({ goals: res.goals, loading: false })
    } catch (e) {
      console.error('[goals] 加载失败', e)
      set({ loading: false })
    }
  },
  addGoal: async (input) => {
    const res = await api.post<{ goal: GoalWithProgress }>('/goals', input)
    set((s) => ({ goals: [res.goal, ...s.goals] }))
  },
  updateGoal: async (id, patch) => {
    const res = await api.patch<{ goal: GoalWithProgress }>(`/goals/${id}`, patch)
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? res.goal : g)) }))
  },
  removeGoal: async (id) => {
    await api.del<{ ok: boolean }>(`/goals/${id}`)
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
  },
}))
