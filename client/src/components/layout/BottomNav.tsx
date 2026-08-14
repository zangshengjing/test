import { NavLink } from 'react-router-dom'
import { Sparkles, Compass, Library, BarChart3, Target } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: '今日', icon: Sparkles },
  { to: '/growth', label: '成长', icon: Compass },
  { to: '/learn', label: '学习', icon: Library },
  { to: '/stats', label: '统计', icon: BarChart3 },
  { to: '/goals', label: '目标', icon: Target },
]

export default function BottomNav() {
  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around safe-bottom md:hidden">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
