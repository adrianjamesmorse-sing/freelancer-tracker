import { useEffect, useState, type PropsWithChildren } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', short: 'D' },
  { to: '/freelancers', label: 'Freelancers', short: 'F' },
  { to: '/projects', label: 'Projects', short: 'P' },
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
    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="lg:flex lg:min-h-screen">
        {mobileOpen ? (
          <button
            className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={[
            'fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-slate-800/90 bg-slate-900/95 shadow-2xl backdrop-blur-md transition-all duration-200',
            collapsed ? 'w-24' : 'w-72',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:sticky lg:top-0 lg:translate-x-0',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4">
            <div className={collapsed ? 'hidden' : 'block'}>
              <div className="text-[11px] uppercase tracking-[0.2em] text-brand-300">Squadigital</div>
              <div className="mt-1 text-xl font-semibold text-white">Freelancer Tracker</div>
            </div>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 text-slate-300 transition hover:border-slate-600 hover:text-white"
              onClick={() => setCollapsed((current) => !current)}
              type="button"
              aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <span aria-hidden="true">{collapsed ? '→' : '←'}</span>
            </button>
          </div>

          <div className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-brand-500/20 text-white ring-1 ring-brand-400/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
                      collapsed ? 'justify-center' : '',
                    ].join(' ')
                  }
                  title={collapsed ? link.label : undefined}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-semibold text-slate-200">
                    {link.short}
                  </span>
                  {!collapsed ? <span>{link.label}</span> : null}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-800 px-4 py-4">
            {collapsed ? (
              <button className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand-400/30 bg-brand-500/20 text-white hover:bg-brand-500/30">
                S
              </button>
            ) : (
              <button className="w-full rounded-xl border border-brand-400/30 bg-brand-500/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500/30">
                Sign in with Microsoft
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 px-4 py-4 backdrop-blur lg:px-6 xl:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-600 hover:text-white lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  type="button"
                  aria-label="Open navigation"
                >
                  <span aria-hidden="true">☰</span>
                </button>
                <div>
                  <div className="text-sm text-slate-400">MVP preview</div>
                  <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    Internal resource management for freelancers
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm text-slate-400">
                Built for ops and finance: projects, allocations, roll-off dates, imports, and cleanup in one place.
              </p>
            </div>
          </header>

          <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
