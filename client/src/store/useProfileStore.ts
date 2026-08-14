import { create } from 'zustand'
import type { Profile, ProfileInput } from '../../../shared/types'
import { api } from '../api/client'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  fetchProfile: () => Promise<void>
  saveProfile: (input: ProfileInput, onboarded?: boolean) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  fetchProfile: async () => {
    set({ loading: true })
    try {
      const res = await api.get<{ profile: Profile | null }>('/profile')
      set({ profile: res.profile, loading: false })
    } catch (e) {
      console.error('[profile] 加载失败', e)
      set({ loading: false })
    }
  },
  saveProfile: async (input, onboarded = true) => {
    const res = await api.put<{ profile: Profile }>('/profile', { ...input, onboarded })
    set({ profile: res.profile })
  },
}))
