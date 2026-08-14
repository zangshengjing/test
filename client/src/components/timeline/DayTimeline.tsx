import { useMemo, useState } from 'react'
import { Pencil, Lock } from 'lucide-react'
import type { TimeBlock, TimeBlockKind, TimeBlockPatch } from '../../../../shared/types'
import { cn } from '../../lib/utils'
import { minToHHMM, timeToMin } from '../../utils/date'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const KIND_STYLE: Record<TimeBlockKind, { bg: string; border: string; text: string }> = {
  sleep: { bg: 'bg-indigo-500/15', border: 'border-indigo-400/30', text: 'text-indigo-700' },
  commute: { bg: 'bg-sky-500/15', border: 'border-sky-400/30', text: 'text-sky-700' },
  work: { bg: 'bg-slate-500/15', border: 'border-slate-400/30', text: 'text-slate-600' },
  meal: { bg: 'bg-amber-500/20', border: 'border-amber-400/40', text: 'text-amber-700' },
  study: { bg: 'bg-blue-500/15', border: 'border-blue-400/30', text: 'text-blue-700' },
  fitness: { bg: 'bg-emerald-500/15', border: 'border-emerald-400/30', text: 'text-emerald-700' },
  family: { bg: 'bg-rose-500/15', border: 'border-rose-400/30', text: 'text-rose-700' },
  free: { bg: 'bg-black/[0.04]', border: 'border-black/10', text: 'text-muted-foreground' },
}

const HOUR_H = 24 // 每小时间距 px
const TOTAL_H = HOUR_H * 24

interface DayTimelineProps {
  blocks: TimeBlock[]
  onPatch: (date: string, id: string, patch: TimeBlockPatch) => Promise<void>
}

export function DayTimeline({ blocks, onPatch }: DayTimelineProps) {
  const [editing, setEditing] = useState<TimeBlock | null>(null)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const nowMin = useMemo(() => {
    const n = new Date()
    return n.getHours() * 60 + n.getMinutes()
  }, [])
  const nowTick = Math.floor((nowMin / 1440) * TOTAL_H)

  const sorted = useMemo(
    () => [...blocks].sort((a, b) => timeToMin(a.start) - timeToMin(b.start)),
    [blocks]
  )

  const openEdit = (b: TimeBlock) => {
    setEditing(b)
    setTitle(b.title)
    setStart(b.start)
    setEnd(b.end)
  }

  const save = async () => {
    if (!editing) return
    if (!title.trim() || !start || !end) return
    await onPatch(editing.date, editing.id, { title: title.trim(), start, end })
    setEditing(null)
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="relative flex" style={{ height: TOTAL_H }}>
        {/* 时间刻度 */}
        <div className="relative w-11 shrink-0">
          {Array.from({ length: 25 }, (_, i) => (
            <span
              key={i}
              className="absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground/60"
              style={{ top: i * HOUR_H }}
            >
              {i < 10 ? `0${i}:00` : `${i}:00`}
            </span>
          ))}
        </div>

        {/* 轨道 */}
        <div className="relative flex-1 overflow-hidden rounded-xl">
          {Array.from({ length: 25 }, (_, i) => (
            <div
              key={i}
              className={cn('absolute left-0 right-0 border-t', i === 0 ? 'border-black/15' : 'border-black/8')}
              style={{ top: i * HOUR_H }}
            />
          ))}

          {/* 时间块 */}
          {sorted.map((b) => {
            const top = (timeToMin(b.start) / 1440) * TOTAL_H
            const height = Math.max(10, ((timeToMin(b.end) - timeToMin(b.start)) / 1440) * TOTAL_H)
            const st = KIND_STYLE[b.kind] ?? KIND_STYLE.free
            const isTask = !!b.taskId
            return (
              <button
                key={b.id}
                onClick={() => openEdit(b)}
                className={cn(
                  'absolute left-0 right-1 overflow-hidden rounded-lg border px-2 py-1 text-left transition-all duration-200 hover:z-10 hover:border-primary/40 hover:shadow-glow',
                  st.bg,
                  st.border
                )}
                style={{ top: top + 1, height: height - 2 }}
              >
                <span className={cn('flex items-center gap-1 text-[10px] font-medium leading-tight', st.text)}>
                  {b.start} – {b.end}
                  {isTask && <Pencil className="h-2.5 w-2.5 opacity-60" />}
                  {b.locked && <Lock className="h-2.5 w-2.5 opacity-60" />}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-semibold text-foreground/90">{b.title}</span>
              </button>
            )
          })}

          {/* 当前时刻指示线 */}
          <div className="absolute left-0 right-0 z-20" style={{ top: nowTick }}>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(248,113,113,0.9)]" />
              <span className="h-px flex-1 bg-destructive/80" />
            </div>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑时间块</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">名称</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">开始</label>
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">结束</label>
                <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              调整后将锁定该块，重新生成时间表时不会被覆盖。当前时间 {minToHHMM(nowMin)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              取消
            </Button>
            <Button onClick={save} disabled={!title.trim() || !start || !end}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
