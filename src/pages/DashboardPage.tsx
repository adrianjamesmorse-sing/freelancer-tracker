import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate } from '../lib/format'

export function DashboardPage() {
  const { dashboard, enrichedAllocations, notifications, importCsvFile, lastImportSummary } = useTrackerData()
  const [importMessage, setImportMessage] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const endingSoon = enrichedAllocations
    .filter((item) => item.daysRemaining <= 7 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed')
    .sort((a, b) => a.daysRemaining - b.daysRemaining)

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    const summary = await importCsvFile(file)
    setImportMessage(
      `Imported ${summary.fileName}: ${summary.addedFreelancers} freelancers, ${summary.addedProjects} projects, ${summary.addedAllocations} allocations. ${summary.skippedAllocations} duplicates skipped.`,
    )
    setIsImporting(false)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active freelancers" value={dashboard.activeFreelancers} />
        <StatCard label="Ending in 3 days" value={dashboard.endingIn3Days} />
        <StatCard label="Ending in 1 day" value={dashboard.endingIn1Day} />
        <StatCard label="Open follow-up" value={dashboard.openFollowUps} />
        <StatCard label="Recent joins" value={dashboard.recentlyJoined} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Panel title="Ending soon">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] divide-y divide-slate-800 text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Freelancer</th>
                  <th className="pb-3 pr-4 font-medium">Project</th>
                  <th className="pb-3 pr-4 font-medium">Owner</th>
                  <th className="pb-3 pr-4 font-medium">End date</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {endingSoon.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4 align-top">
                      <Link to={`/freelancers/${item.freelancer.id}`} className="font-medium text-white hover:text-brand-300">
                        {item.freelancer.freelancerName}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 align-top text-slate-300">{item.project.projectName}</td>
                    <td className="py-3 pr-4 align-top text-slate-300">{item.ownerManagerName || 'â€”'}</td>
                    <td className="py-3 pr-4 align-top text-slate-300">{formatDate(item.contractEndDate)} ({item.daysRemaining}d)</td>
                    <td className="py-3 pr-4 align-top"><StatusBadge value={item.freelancer.freelancerStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Notification queue">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="text-sm text-slate-200">{notification.message}</div>
                  <StatusBadge value={notification.status} />
                </div>
                <div className="mt-2 text-xs text-slate-500">Scheduled for {formatDate(notification.scheduledFor)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Panel title="Import Microsoft Forms CSV">
          <div className="space-y-4 text-sm text-slate-300">
            <p>
              Upload the raw Microsoft Forms export. The importer now handles the real <strong>semicolon-delimited</strong> sheet,
              decodes <strong>Windows-1252</strong>, and maps the French/system columns into freelancers, projects, and allocations.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-slate-400">
              <li>Freelancer duplicate rule: same freelancer name + personal email</li>
              <li>Project duplicate rule: same project name + entity</li>
              <li>Allocation duplicate rule: same Forms row id, or same freelancer + project + start date + end date + role</li>
            </ul>
            <label className="inline-flex cursor-pointer items-center rounded-xl border border-brand-400/30 bg-brand-500/20 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500/30">
              <input className="hidden" type="file" accept=".csv,text/csv" onChange={onFileChange} />
              {isImporting ? 'Importingâ€¦' : 'Choose CSV file'}
            </label>
            {importMessage ? <p className="text-sm text-slate-400">{importMessage}</p> : null}
          </div>
        </Panel>

        <Panel title="Last import summary">
          {lastImportSummary ? (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Metric label="File" value={lastImportSummary.fileName} />
              <Metric label="Rows" value={String(lastImportSummary.processedRows)} />
              <Metric label="Freelancers added" value={String(lastImportSummary.addedFreelancers)} />
              <Metric label="Freelancers updated" value={String(lastImportSummary.updatedFreelancers)} />
              <Metric label="Projects added" value={String(lastImportSummary.addedProjects)} />
              <Metric label="Projects updated" value={String(lastImportSummary.updatedProjects)} />
              <Metric label="Allocations added" value={String(lastImportSummary.addedAllocations)} />
              <Metric label="Duplicates skipped" value={String(lastImportSummary.skippedAllocations)} />
              <Metric label="Imported at" value={formatDate(lastImportSummary.importedAt)} />
            </dl>
          ) : (
            <p className="text-sm text-slate-400">No CSV imported yet.</p>
          )}
          {lastImportSummary?.errors.length ? (
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-100">
              {lastImportSummary.errors.join(' ')}
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-white">{value}</dd>
    </div>
  )
}