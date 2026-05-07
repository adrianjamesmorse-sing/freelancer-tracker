import { useEffect, useState, type PropsWithChildren } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from './Icon'

const links = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' as const, short: 'D' },
  { to: '/freelancers', label: 'Freelancers', icon: 'users' as const, short: 'F' },
  { to: '/projects', label: 'Projects', icon: 'folder' as const, short: 'P' },
  { to: '/notifications', label: 'Notifications', icon: 'bell' as const, short: 'N' },
]

const SIDEBAR_KEY = 'freelancer-tracker-sidebar-collapsed'

export function Layout({ children }: PropsWithChildren) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_KEY) === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(52,150,255,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_24%),#020617] text-slate-100">
      <div className="lg:flex lg:min-h-screen">
        {mobileOpen ? (
          <button
            className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={[
            'fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-white/10 bg-slate-950/92 shadow-2xl backdrop-blur-xl transition-all duration-200',
            collapsed ? 'w-24' : 'w-80',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:sticky lg:top-0 lg:translate-x-0',
          ].join(' ')}
        >
          <div className="border-b border-white/8 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className={collapsed ? 'hidden' : 'block'}>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-brand-200">
                  <Icon name="sparkles" className="h-3.5 w-3.5" />
                  Product Ops MVP
                </div>
                <div className="mt-4 text-xl font-semibold tracking-tight text-white">Freelancer Tracker</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Resource clarity, roll-off planning, and notification orchestration in one workspace.
                </p>
              </div>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:text-white"
                onClick={() => setCollapsed((current) => !current)}
                type="button"
                aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
              >
                <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 px-3 py-5">
            <div className={collapsed ? 'mb-3 hidden' : 'mb-3 px-3 text-xs uppercase tracking-[0.2em] text-slate-500'}>Workspace</div>
            <nav className="space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-gradient-to-r from-brand-500/20 to-violet-500/10 text-white ring-1 ring-brand-400/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white',
                      collapsed ? 'justify-center' : '',
                    ].join(' ')
                  }
                  title={collapsed ? link.label : undefined}
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-slate-200 transition group-hover:border-white/15 group-hover:bg-white/10">
                    <Icon name={link.icon} className="h-5 w-5" />
                  </span>
                  {!collapsed ? <span>{link.label}</span> : null}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/8 px-4 py-4">
            {collapsed ? (
              <button className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/10 text-brand-100 hover:bg-brand-500/20">
                <Icon name="mail" className="h-5 w-5" />
              </button>
            ) : (
              <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-100">
                    <Icon name="mail" className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Email delivery next</div>
                    <div className="text-xs text-slate-400">Templates can already be edited in Notifications.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/8 bg-slate-950/74 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:text-white lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  type="button"
                  aria-label="Open navigation"
                >
                  <Icon name="menu" className="h-5 w-5" />
                </button>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-brand-200">Internal operations cockpit</div>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Freelancer resource management
                  </h1>
                </div>
              </div>
              <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2 xl:text-right">
                <p className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Use case</span>
                  Track allocations, roll-off risk, and operational follow-up.
                </p>
                <p className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Current phase</span>
                  CSV ingestion, CRUD workflows, and notification template design.
                </p>
              </div>
            </div>
          </header>

          <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
