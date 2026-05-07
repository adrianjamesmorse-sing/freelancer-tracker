import type { PropsWithChildren, ReactNode } from 'react'

interface PanelProps extends PropsWithChildren {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] shadow-panel backdrop-blur-sm">
      <header className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-start sm:justify-between lg:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="p-4 sm:p-5 lg:p-6">{children}</div>
    </section>
  )
}
