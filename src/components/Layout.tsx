import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate } from '../lib/format'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { StatusBadge } from './StatusBadge'

type AppKey = 'freelancers' | 'feedback' | 'projects' | 'admin'

const freelancerLinks = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' as const },
  { to: '/request', label: 'Request Freelancer', icon: 'sparkles' as const },
  { to: '/freelancers', label: 'Freelancers', icon: 'users' as const },
  { to: '/onboarding', label: 'Freelancer Onboarding', icon: 'users' as const },
  { to: '/financials', label: 'Financials', icon: 'coins' as const },
  { to: '/imports', label: 'Imports', icon: 'upload' as const },
  { to: '/notifications', label: 'Notifications', icon: 'bell' as const },
]

const feedbackLinks = [{ to: '/feedback', label: 'Project browser', icon: 'message-square' as const }]
const projectLinks = [{ to: '/projects', label: 'Projects', icon: 'folder' as const }]
const adminLinks = [
  { to: '/admin/sso', label: 'SSO', icon: 'shield' as const },
  { to: '/admin/graph', label: 'Graph permissions', icon: 'globe' as const },
  { to: '/admin/credentials', label: 'Credentials', icon: 'settings' as const },
]

const appLinks: Array<{
  key: AppKey
  to: string
  label: string
  icon: 'users' | 'message-square' | 'folder' | 'shield'
  match: string[]
}> = [
  {
    key: 'freelancers',
    to: '/',
    label: 'Freelancers',
    icon: 'users',
    match: ['/', '/freelancers', '/request', '/onboarding', '/financials', '/imports', '/notifications'],
  },
  { key: 'feedback', to: '/feedback', label: 'Feedback', icon: 'message-square', match: ['/feedback'] },
  { key: 'projects', to: '/projects', label: 'Projects', icon: 'folder', match: ['/projects'] },
  { key: 'admin', to: '/admin/sso', label: 'Admin', icon: 'shield', match: ['/admin'] },
]

const SIDEBAR_KEY = 'vertex-sidebar-collapsed'

export function Layout({ children }: PropsWithChildren) {
  const location = useLocation()
  const { notifications } = useTrackerData()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_KEY) === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationModalOpen, setNotificationModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const notificationPreview = useMemo(
    () =>
      [...notifications]
        .sort((a, b) => Date.parse(b.scheduledFor) - Date.parse(a.scheduledFor))
        .slice(0, 8),
    [notifications],
  )

  const queuedCount = notifications.filter((item) => item.status === 'queued').length

  const currentApp =
    appLinks.find((app) =>
      app.match.some(
        (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
      ),
    ) ?? appLinks[0]

  const links =
    currentApp.key === 'feedback'
      ? feedbackLinks
      : currentApp.key === 'projects'
        ? projectLinks
        : currentApp.key === 'admin'
          ? adminLinks
          : freelancerLinks

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(159,135,104,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(127,142,108,0.10),transparent_22%),linear-gradient(180deg,#fbf8f2_0%,#f4efe6_100%)] text-stone-900">
        <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f2e8]/92 backdrop-blur-xl">
          <div className="mx-auto flex h-[50px] max-w-[1920px] items-center gap-2 px-2 sm:gap-3 sm:px-4 xl:px-5">
            <Link
              to="/"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white/90 text-brand-700 shadow-sm sm:h-9 sm:w-9"
              title="Vertex"
            >
              <Icon name="vertex" className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <nav
              className="header-app-nav flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto sm:gap-1"
              aria-label="Application sections"
            >
              {appLinks.map((app) => {
                const active = currentApp.key === app.key
                return (
                  <NavLink
                    key={app.to}
                    to={app.to}
                    end={app.to === '/'}
                    title={app.label}
                    className={[
                      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-medium transition sm:gap-2 sm:px-3 sm:text-sm',
                      active
                        ? 'border-b-2 border-olive-700 text-stone-900'
                        : 'text-stone-600 hover:bg-[#efe7da] hover:text-stone-900',
                    ].join(' ')}
                  >
                    <Icon name={app.icon} className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">{app.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-stone-200 bg-white/90 text-stone-700 transition hover:border-stone-300 hover:bg-white sm:h-9 sm:w-9 lg:hidden"
                onClick={() => setMobileOpen(true)}
                type="button"
                aria-label="Open navigation"
              >
                <Icon name="menu" className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setNotificationModalOpen(true)}
                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white/90 text-stone-800 transition hover:border-stone-300 hover:bg-white"
                aria-label="Open notification queue"
              >
                <Icon name="bell" className="h-4.5 w-4.5 text-olive-700" />
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-olive-700 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {queuedCount}
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="lg:flex lg:min-h-[calc(100vh-50px)]">
          {mobileOpen ? (
            <button
              className="fixed inset-0 z-30 bg-stone-900/20 backdrop-blur-sm lg:hidden"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}

          <aside
            className={[
              'fixed inset-y-0 left-0 top-[50px] z-40 flex h-[calc(100vh-50px)] flex-col border-r border-stone-200 bg-[#faf6ef]/96 shadow-xl backdrop-blur-xl transition-all duration-200',
              collapsed ? 'w-20' : 'w-56',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
              'lg:sticky lg:top-[50px] lg:translate-x-0',
            ].join(' ')}
          >
            <div className="flex items-center justify-end border-b border-stone-200 px-3 py-3">
              <button
                className="hidden h-9 w-9 items-center justify-center rounded-2xl border border-stone-200 bg-white/85 text-stone-600 transition hover:border-stone-300 hover:text-stone-900 lg:inline-flex"
                onClick={() => setCollapsed((current) => !current)}
                type="button"
                aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
              >
                <Icon
                  name={collapsed ? 'chevron-right' : 'chevron-left'}
                  className="h-4 w-4"
                />
              </button>
            </div>

            <div className="flex-1 px-3 py-4">
              <nav className="space-y-2">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={
                      link.to === '/' ||
                      link.to === '/feedback' ||
                      link.to === '/projects' ||
                      link.to === '/request' ||
                      link.to === '/onboarding'
                    }
                    className={({ isActive }) =>
                      [
                        'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-[#e6dccb] text-brand-800 shadow-sm'
                          : 'text-stone-600 hover:bg-[#efe7da] hover:text-stone-900',
                        collapsed ? 'justify-center px-0' : '',
                      ].join(' ')
                    }
                    title={collapsed ? link.label : undefined}
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white/90 text-stone-700 transition group-hover:border-stone-300 group-hover:bg-white">
                      <Icon name={link.icon} className="h-5 w-5" />
                    </span>
                    {!collapsed ? <span className="truncate">{link.label}</span> : null}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <main className="min-w-0 px-3 py-4 sm:px-4 xl:px-5">{children}</main>
          </div>
        </div>
      </div>

      <Modal
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        title="Notification queue"
        description="In-app previews of the notification content and cadence you’re designing before email delivery is wired up."
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-stone-500">
              {queuedCount} queued · {notifications.length} total notifications
            </div>
            <Link
              to="/notifications"
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
              onClick={() => setNotificationModalOpen(false)}
            >
              Open notification manager
              <Icon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>
        }
      >
        <div className="space-y-3">
          {notificationPreview.map((notification) => (
            <div
              key={notification.id}
              className="rounded-[22px] border border-stone-200 bg-white/80 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {notification.subject ? (
                    <div className="font-medium text-stone-900">{notification.subject}</div>
                  ) : null}
                  <div className="mt-1 text-sm text-stone-600">{notification.message}</div>
                  {notification.recipientsPreview?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {notification.recipientsPreview.map((recipient) => (
                        <span
                          key={recipient}
                          className="inline-flex rounded-full border border-stone-200 bg-[#f8f4ec] px-3 py-1 text-xs text-stone-600"
                        >
                          {recipient}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <StatusBadge value={notification.status} />
              </div>
              <div className="mt-3 text-xs text-stone-500">
                Scheduled for {formatDate(notification.scheduledFor)}
              </div>
            </div>
          ))}

          {!notificationPreview.length ? (
            <div className="rounded-[22px] border border-stone-200 bg-white/80 px-4 py-6 text-sm text-stone-500">
              No notifications have been generated yet.
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  )
}
