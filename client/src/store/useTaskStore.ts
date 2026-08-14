import { create } from 'zustand'
import type { Task, TaskInput } from '../../../shared/types'
import { api } from '../api/client'

interface TaskState {
  tasks: Task[]
  loading: boolean
  fetchTasks: (date: string) => Promise<void>
  addTask: (input: TaskInput & { date: string }) => Promise<void>
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>
  removeTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  fetchTasks: async (date) => {
    set({ loading: true })
    try {
      const res = await api.get<{ tasks: Task[] }>(`/tasks?date=${date}`)
      set({ tasks: res.tasks, loading: false })
    } catch (e) {
      console.error('[tasks] 加载失败', e)
      set({ loading: false })
    }
  },
  addTask: async (input) => {
    const res = await api.post<{ task: Task }>('/tasks', input)
    set((s) => ({ tasks: [...s.tasks, res.task].sort((a, b) => a.sortOrder - b.sortOrder) }))
  },
  updateTask: async (id, patch) => {
    const res = await api.patch<{ task: Task }>(`/tasks/${id}`, patch)
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? res.task : t)) }))
  },
  removeTask: async (id) => {
    await api.del<{ ok: boolean }>(`/tasks/${id}`)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },
}))
