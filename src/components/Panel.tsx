import type { PropsWithChildren, ReactNode } from 'react'

interface PanelProps extends PropsWithChildren {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,#f6f0e6)] shadow-panel backdrop-blur-sm">
      <header className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between lg:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">{title}</h2>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm text-stone-600">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="p-4 sm:p-5 lg:p-6">{children}</div>
    </section>
  )
}
