interface StatusBadgeProps {
  value: string
}

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-500/16 text-emerald-200 ring-emerald-400/20',
  'Ending soon': 'bg-amber-500/16 text-amber-100 ring-amber-400/20',
  'Open follow-up': 'bg-rose-500/16 text-rose-100 ring-rose-400/20',
  Inactive: 'bg-slate-500/16 text-slate-200 ring-slate-400/20',
  Closed: 'bg-slate-500/16 text-slate-200 ring-slate-400/20',
  'Extended pending close': 'bg-fuchsia-500/16 text-fuchsia-100 ring-fuchsia-400/20',
  sent: 'bg-emerald-500/16 text-emerald-200 ring-emerald-400/20',
  queued: 'bg-amber-500/16 text-amber-100 ring-amber-400/20',
  JV: 'bg-sky-500/16 text-sky-100 ring-sky-400/20',
  Unspecified: 'bg-slate-500/16 text-slate-200 ring-slate-400/20',
  'Squadigital FR': 'bg-blue-500/16 text-blue-100 ring-blue-400/20',
  'Squadigital UK': 'bg-indigo-500/16 text-indigo-100 ring-indigo-400/20',
  'Squadigital GE': 'bg-cyan-500/16 text-cyan-100 ring-cyan-400/20',
  Immediate: 'bg-brand-500/16 text-brand-100 ring-brand-400/20',
  'Daily digest': 'bg-violet-500/16 text-violet-100 ring-violet-400/20',
  'Weekly digest': 'bg-fuchsia-500/16 text-fuchsia-100 ring-fuchsia-400/20',
  'Manual review': 'bg-slate-500/16 text-slate-100 ring-slate-400/20',
  Enabled: 'bg-emerald-500/16 text-emerald-100 ring-emerald-400/20',
  Disabled: 'bg-slate-500/16 text-slate-100 ring-slate-400/20',
  join: 'bg-brand-500/16 text-brand-100 ring-brand-400/20',
  end_3_days: 'bg-amber-500/16 text-amber-100 ring-amber-400/20',
  end_1_day: 'bg-rose-500/16 text-rose-100 ring-rose-400/20',
  still_open_weekly: 'bg-fuchsia-500/16 text-fuchsia-100 ring-fuchsia-400/20',
  custom: 'bg-slate-500/16 text-slate-100 ring-slate-400/20',
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center justify-center rounded-full px-3 py-1 text-center text-xs font-medium leading-4 ring-1 whitespace-normal break-words ${
        statusStyles[value] ?? 'bg-brand-500/15 text-brand-200 ring-brand-500/30'
      }`}
    >
      {humanize(value)}
    </span>
  )
}

function humanize(value: string) {
  if (value === 'end_3_days') return 'End in 3 days'
  if (value === 'end_1_day') return 'End in 1 day'
  if (value === 'still_open_weekly') return 'Still open weekly'
  if (value === 'join') return 'Join'
  return value
}
