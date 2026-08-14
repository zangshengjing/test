import { create } from 'zustand'
import type { LearningContent, LearningContentInput } from '../../../shared/types'
import { api } from '../api/client'

interface ContentState {
  todayContent: LearningContent | null
  library: LearningContent[]
  loading: boolean
  fetchToday: (date: string) => Promise<void>
  fetchLibrary: () => Promise<void>
  addContent: (input: LearningContentInput) => Promise<void>
}

export const useContentStore = create<ContentState>((set) => ({
  todayContent: null,
  library: [],
  loading: false,
  fetchToday: async (date) => {
    try {
      const res = await api.get<{ content: LearningContent | null }>(`/content/today?date=${date}`)
      set({ todayContent: res.content })
    } catch (e) {
      console.error('[content] 今日内容加载失败', e)
    }
  },
  fetchLibrary: async () => {
    set({ loading: true })
    try {
      const res = await api.get<{ contents: LearningContent[] }>('/content/library')
      set({ library: res.contents, loading: false })
    } catch (e) {
      console.error('[content] 学习库加载失败', e)
      set({ loading: false })
    }
  },
  addContent: async (input) => {
    const res = await api.post<{ content: LearningContent }>('/content', input)
    set((s) => ({ library: [res.content, ...s.library] }))
  },
}))
