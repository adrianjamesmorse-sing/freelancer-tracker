interface StatusBadgeProps {
  value: string
}

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  'Ending soon': 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  'Open follow-up': 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  Inactive: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  Closed: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  'Extended pending close': 'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30',
  sent: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  queued: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  JV: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  Unspecified: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  'Squadigital FR': 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  'Squadigital UK': 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
  'Squadigital GE': 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center justify-center rounded-full px-3 py-1 text-center text-xs font-medium leading-4 ring-1 whitespace-normal break-words ${
        statusStyles[value] ?? 'bg-brand-500/15 text-brand-200 ring-brand-500/30'
      }`}
    >
      {value}
    </span>
  )
}
