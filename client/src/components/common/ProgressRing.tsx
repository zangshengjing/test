import { useId } from 'react'

interface ProgressRingProps {
  value: number // 0-100
  size?: number
  stroke?: number
  label?: string
  showPercent?: boolean
  children?: React.ReactNode
}

export function ProgressRing({ value, size = 88, stroke = 8, label, showPercent = true, children }: ProgressRingProps) {
  const gradId = useId()
  const clamped = Math.min(100, Math.max(0, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="55%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
        {showPercent && (
          <span className="text-xl font-bold leading-none">
            {clamped}
            <span className="text-xs font-medium text-muted-foreground">%</span>
          </span>
        )}
        {label && <span className="mt-1 text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}
