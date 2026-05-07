import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate } from '../lib/format'

export function DashboardPage() {
  const {
    dashboard,
    enrichedAllocations,
    notifications,
    notificationRules,
    importCsvFile,
    lastImportSummary,
  } = useTrackerData()

  const endingSoon = enrichedAllocations
    .filter((item) => item.daysRemaining <= 7 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed')
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 8)

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await importCsvFile(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Active freelancers"
          value={dashboard.activeFreelancers}
          hint="Currently in play across all entities."
          tone="brand"
          icon={<Icon name="users" className="h-5 w-5" />}
        />
        <StatCard
          label="Ending in 3 days"
          value={dashboard.endingIn3Days}
          hint="Needs a renewal or closeout decision."
          tone="amber"
          icon={<Icon name="sparkles" className="h-5 w-5" />}
        />
        <StatCard
          label="Ending in 1 day"
          value={dashboard.endingIn1Day}
          hint="Immediate action window."
          tone="rose"
          icon={<Icon name="bell" className="h-5 w-5" />}
        />
        <StatCard
          label="Open follow-up"
          value={dashboard.openFollowUps}
          hint="Still unresolved allocations."
          tone="violet"
          icon={<Icon name="settings" className="h-5 w-5" />}
        />
        <StatCard
          label="Notification rules live"
          value={dashboard.enabledNotificationRules}
          hint="Ready for email hookup later."
          tone="emerald"
          icon={<Icon name="mail" className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Panel title="Ending soon" subtitle="Closest roll-offs and expiring allocations in the next 7 days.">
          <div className="overflow-hidden rounded-2xl border border-white/8">
            <div className="overflow-auto">
              <table className="min-w-[760px] divide-y divide-white/8 text-sm">
                <thead className="bg-slate-900/95 text-left text-slate-400 backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 font-medium">Freelancer</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">End date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {endingSoon.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-3 align-top">
                        <Link to={`/freelancers/${item.freelancer.id}`} className="font-medium text-white hover:text-brand-300">
                          {item.freelancer.freelancerName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">{item.project.projectName}</td>
                      <td className="px-4 py-3 align-top text-slate-300">{item.ownerManagerName || '—'}</td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {formatDate(item.contractEndDate)} ({item.daysRemaining}d)
                      </td>
                      <td className="px-4 py-3 align-top"><StatusBadge value={item.freelancer.freelancerStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>

        <Panel title="Notification queue" subtitle="In-app previews of what will eventually become real outbound comms.">
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    {notification.subject ? <div className="font-medium text-white">{notification.subject}</div> : null}
                    <div className="mt-1 text-sm text-slate-300">{notification.message}</div>
                    {notification.recipientsPreview?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {notification.recipientsPreview.map((recipient) => (
                          <span key={recipient} className="inline-flex rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                            {recipient}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <StatusBadge value={notification.status} />
                </div>
                <div className="mt-3 text-xs text-slate-500">Scheduled for {formatDate(notification.scheduledFor)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Panel title="Import Microsoft Forms CSV" subtitle="Upload the raw semicolon-delimited export directly from Forms; the importer maps the real layout already.">
          <div className="space-y-4 text-sm text-slate-300">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Freelancers</div>
                <div className="mt-2 text-slate-200">Matched by name + personal email.</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Projects</div>
                <div className="mt-2 text-slate-200">Matched by project name + entity.</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Allocations</div>
                <div className="mt-2 text-slate-200">Deduped by Forms row id or matching assignment shape.</div>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-brand-400/20 bg-brand-500/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500/25">
              <Icon name="plus" className="h-4 w-4" />
              <input className="hidden" type="file" accept=".csv,text/csv" onChange={onFileChange} />
              Choose CSV file
            </label>
          </div>
        </Panel>

        <Panel title="Last import and rules" subtitle="A quick control tower view of the latest data load and current notification design coverage.">
          {lastImportSummary ? (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Metric label="File" value={lastImportSummary.fileName} />
              <Metric label="Rows" value={String(lastImportSummary.processedRows)} />
              <Metric label="Freelancers added" value={String(lastImportSummary.addedFreelancers)} />
              <Metric label="Projects added" value={String(lastImportSummary.addedProjects)} />
              <Metric label="Allocations added" value={String(lastImportSummary.addedAllocations)} />
              <Metric label="Duplicates skipped" value={String(lastImportSummary.skippedAllocations)} />
            </dl>
          ) : (
            <p className="text-sm text-slate-400">No CSV imported yet.</p>
          )}
          <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Notification templates</div>
            <div className="mt-3 space-y-2">
              {notificationRules.slice(0, 4).map((rule) => (
                <div key={rule.id} className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
                  <StatusBadge value={rule.triggerType} />
                  <span>{rule.name}</span>
                </div>
              ))}
            </div>
            <Link to="/notifications" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-300 hover:text-brand-200">
              Configure notification manager
              <Icon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-3.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-white">{value}</dd>
    </div>
  )
}
