interface StatusBadgeProps {
  value: string
}

const statusStyles: Record<string, string> = {
  Active: 'bg-[#dfe9da] text-[#466043] ring-[#c7d7c1]',
  'Ending soon': 'bg-[#f4e6cb] text-[#7f5a23] ring-[#e6d2aa]',
  'Open follow-up': 'bg-[#f1dfd6] text-[#855243] ring-[#e3c6ba]',
  Inactive: 'bg-[#ece5db] text-[#6f655a] ring-[#ddd3c7]',
  Closed: 'bg-[#ece5db] text-[#6f655a] ring-[#ddd3c7]',
  'Extended pending close': 'bg-[#e8e0e7] text-[#6f5768] ring-[#d8cad5]',
  sent: 'bg-[#dfe9da] text-[#466043] ring-[#c7d7c1]',
  queued: 'bg-[#f4e6cb] text-[#7f5a23] ring-[#e6d2aa]',
  JV: 'bg-[#e4e5db] text-[#5f6650] ring-[#d4d7c8]',
  Unspecified: 'bg-[#ece5db] text-[#6f655a] ring-[#ddd3c7]',
  'Squadigital FR': 'bg-[#e6e1d7] text-[#5f5a4c] ring-[#d8d0c2]',
  'Squadigital UK': 'bg-[#dddccf] text-[#4d5444] ring-[#cfcfbf]',
  'Squadigital GE': 'bg-[#e3e8df] text-[#4f5c49] ring-[#d1d9cb]',
  Immediate: 'bg-[#efe6d6] text-[#665537] ring-[#e3d4ba]',
  'Daily digest': 'bg-[#ebe5de] text-[#655f53] ring-[#ddd3c8]',
  'Weekly digest': 'bg-[#e8e0e7] text-[#6f5768] ring-[#d8cad5]',
  'Manual review': 'bg-[#ece5db] text-[#6f655a] ring-[#ddd3c7]',
  Enabled: 'bg-[#dfe9da] text-[#466043] ring-[#c7d7c1]',
  Disabled: 'bg-[#ece5db] text-[#6f655a] ring-[#ddd3c7]',
  join: 'bg-[#efe6d6] text-[#665537] ring-[#e3d4ba]',
  end_3_days: 'bg-[#f4e6cb] text-[#7f5a23] ring-[#e6d2aa]',
  end_1_day: 'bg-[#f1dfd6] text-[#855243] ring-[#e3c6ba]',
  still_open_weekly: 'bg-[#e8e0e7] text-[#6f5768] ring-[#d8cad5]',
  custom: 'bg-[#ece5db] text-[#6f655a] ring-[#ddd3c7]',
  'Squadigital DE': 'bg-[#e6e4db] text-[#5a574e] ring-[#d7d2c6]',
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center justify-center rounded-full px-3 py-1 text-center text-xs font-medium leading-4 ring-1 whitespace-normal break-words ${
        statusStyles[value] ?? 'bg-[#efe6d6] text-[#665537] ring-[#e3d4ba]'
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
