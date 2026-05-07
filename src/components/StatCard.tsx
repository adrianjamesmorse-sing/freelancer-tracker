import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet'
}

const toneMap = {
  brand: 'from-brand-500/18 to-sky-500/8 text-brand-100 ring-brand-400/15',
  emerald: 'from-emerald-500/18 to-emerald-500/5 text-emerald-100 ring-emerald-400/15',
  amber: 'from-amber-500/18 to-amber-500/5 text-amber-100 ring-amber-400/15',
  rose: 'from-rose-500/18 to-rose-500/5 text-rose-100 ring-rose-400/15',
  violet: 'from-violet-500/18 to-fuchsia-500/5 text-violet-100 ring-violet-400/15',
} as const

export function StatCard({ label, value, hint, icon, tone = 'brand' }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[26px] border border-white/8 bg-gradient-to-br ${toneMap[tone]} p-4 shadow-panel ring-1 sm:p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-300">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{value}</div>
        </div>
        {icon ? (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90">
            {icon}
          </div>
        ) : null}
      </div>
      {hint ? <div className="mt-3 text-sm text-slate-400">{hint}</div> : null}
    </div>
  )
}
