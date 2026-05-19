import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'olive' | 'sand'
}

const toneMap = {
  brand: 'from-[#efe6d6] to-[#f8f2e8] text-stone-900 ring-stone-200',
  emerald: 'from-[#e6efe5] to-[#f6faf4] text-stone-900 ring-[#d2e0cf]',
  amber: 'from-[#f3ead6] to-[#fbf6ea] text-stone-900 ring-[#eadbb8]',
  rose: 'from-[#f2e3dc] to-[#faf1ec] text-stone-900 ring-[#e7cdc0]',
  violet: 'from-[#ece7ea] to-[#f8f4f7] text-stone-900 ring-[#ddd3db]',
  olive: 'from-[#e4ebdf] to-[#f5f8f2] text-stone-900 ring-[#d3dccd]',
  sand: 'from-[#efe6db] to-[#f9f4ee] text-stone-900 ring-[#e5d6c7]',
} as const

export function StatCard({ label, value, hint, icon, tone = 'brand' }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[26px] border border-stone-200 bg-gradient-to-br ${toneMap[tone]} p-4 shadow-panel ring-1 sm:p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-stone-600">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{value}</div>
        </div>
        {icon ? (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white/75 text-stone-700">
            {icon}
          </div>
        ) : null}
      </div>
      {hint ? <div className="mt-3 text-sm text-stone-600">{hint}</div> : null}
    </div>
  )
}
