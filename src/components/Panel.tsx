import type { PropsWithChildren, ReactNode } from 'react'

interface PanelProps extends PropsWithChildren {
  title: string
  action?: ReactNode
}

export function Panel({ title, action, children }: PanelProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-panel backdrop-blur-sm">
      <header className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}