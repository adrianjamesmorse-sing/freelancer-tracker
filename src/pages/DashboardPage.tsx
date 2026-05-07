import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { WorldMapPanel } from '../components/WorldMapPanel'
import { useTrackerData } from '../hooks/useTrackerData'
import { buildCountryCounts } from '../lib/geo'
import { formatDate } from '../lib/format'

export function DashboardPage() {
  const { dashboard, enrichedAllocations, freelancers } = useTrackerData()

  const endingSoon = enrichedAllocations
    .filter((item) => item.daysRemaining <= 7 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed')
    .sort((a, b) => a.daysRemaining - b.daysRemaining)

  const countryCounts = buildCountryCounts(freelancers)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      </div>

      <Panel
        title="Ending soon"
        subtitle="Primary operational view: all allocations expiring in the next 7 days, sorted by urgency."
      >
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <div className="max-h-[560px] overflow-auto">
            <table className="min-w-[900px] divide-y divide-white/8 text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900/95 text-left text-slate-400 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Freelancer</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">End date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {endingSoon.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 align-top font-medium text-white">{item.freelancer.freelancerName}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{item.project.projectName}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{item.project.entity}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{item.ownerManagerName || '—'}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{item.roleWithinProject || '—'}</td>
                    <td className="px-4 py-3 align-top text-slate-300">
                      {formatDate(item.contractEndDate)} ({item.daysRemaining}d)
                    </td>
                    <td className="px-4 py-3 align-top"><StatusBadge value={item.freelancer.freelancerStatus} /></td>
                  </tr>
                ))}
                {!endingSoon.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                      Nothing is ending in the next 7 days.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      <Panel
        title="World map"
        subtitle="Interactive country coverage for active freelancers with a saved country and address."
      >
        <WorldMapPanel countries={countryCounts} />
      </Panel>
    </div>
  )
}
