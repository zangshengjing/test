import { create } from 'zustand'
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ToastItem {
  id: number
  title: string
  description?: string
  type?: 'info' | 'success' | 'warn'
}

interface ToastState {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  remove: (id: number) => void
}

let seq = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 3400)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

/** 全局提示 */
export function toast(t: Omit<ToastItem, 'id'>) {
  useToastStore.getState().push(t)
}

/** Toast 渲染组件 */
export function ToastViewer() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => remove(t.id)}
          className={cn(
            'pointer-events-auto glass-strong flex items-start gap-3 rounded-xl px-4 py-3 text-left animate-in slide-in-from-right-4 fade-in-0 duration-300'
          )}
        >
          {t.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
          ) : t.type === 'warn' ? (
            <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warn" />
          ) : (
            <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-info" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
          </div>
        </button>
      ))}
    </div>
  )
}
