import { NavLink } from 'react-router-dom'
import { Sparkles, Compass, Library, BarChart3, Target } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useProfileStore } from '../../store/useProfileStore'
import { useTodayStore } from '../../store/useTodayStore'
import { formatCN } from '../../utils/date'

const NAV_ITEMS = [
  { to: '/', label: '今日', icon: Sparkles },
  { to: '/growth', label: '成长', icon: Compass },
  { to: '/learn', label: '学习', icon: Library },
  { to: '/stats', label: '统计', icon: BarChart3 },
  { to: '/goals', label: '目标', icon: Target },
]

export default function TopBar() {
  const name = useProfileStore((s) => s.profile?.name)
  const today = useTodayStore((s) => s.today)

  return (
    <header className="glass sticky top-0 z-40 hidden h-16 items-center gap-8 px-6 md:flex">
      <NavLink to="/" className="flex items-center gap-2.5">
        <span className="bg-gradient-brand flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-amber-500/25">
          <Sparkles className="h-5 w-5 text-white" />
        </span>
        <span className="text-lg font-semibold">
          <span className="text-gradient">成长星球</span>
        </span>
      </NavLink>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-white/90 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/70 hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{formatCN(today)}</span>
        {name && (
          <span className="glass rounded-full px-3 py-1.5 text-sm font-medium">
            👋 {name}
          </span>
        )}
      </div>
    </header>
  )
}
