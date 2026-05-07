import { Link, useParams } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate, formatMoney } from '../lib/format'

export function FreelancerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getFreelancerById, getAllocationsForFreelancer, getProjectById, notifications } = useTrackerData()

  const freelancer = id ? getFreelancerById(id) : undefined

  if (!freelancer) {
    return (
      <Panel title="Freelancer not found">
        <Link to="/freelancers" className="text-brand-300 hover:text-brand-200">Back to freelancers</Link>
      </Panel>
    )
  }

  const allocations = getAllocationsForFreelancer(freelancer.id)
  const relatedNotifications = notifications.filter((notification) =>
    allocations.some((allocation) => allocation.id === notification.allocationId),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/freelancers" className="text-sm text-brand-300 hover:text-brand-200">← Back to freelancers</Link>
          <h2 className="mt-2 text-3xl font-semibold text-white">{freelancer.freelancerName}</h2>
          <p className="mt-2 text-sm text-slate-400">Manual edits and CSV imports stay in local browser storage until real persistence is wired.</p>
        </div>
        <StatusBadge value={freelancer.freelancerStatus} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel title="Allocations">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Project</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Dates</th>
                  <th className="pb-3 pr-4 font-medium">Rate</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {allocations.map((allocation) => {
                  const project = getProjectById(allocation.projectId)
                  return (
                    <tr key={allocation.id}>
                      <td className="py-3 pr-4 text-white">{project?.projectName ?? 'Unknown project'}</td>
                      <td className="py-3 pr-4 text-slate-300">{allocation.roleWithinProject}</td>
                      <td className="py-3 pr-4 text-slate-300">{formatDate(allocation.contractStartDate)} → {formatDate(allocation.contractEndDate)}</td>
                      <td className="py-3 pr-4 text-slate-300">{formatMoney(allocation.dailyRate, allocation.dailyRateCurrency)}</td>
                      <td className="py-3 pr-4"><StatusBadge value={allocation.allocationStatus} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Profile">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-200">{freelancer.personalEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-slate-200">{freelancer.phoneNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Country</dt>
                <dd className="text-slate-200">{freelancer.country || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Address</dt>
                <dd className="text-slate-200">{freelancer.address || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Registration number</dt>
                <dd className="text-slate-200">{freelancer.registrationNumber ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Question flag</dt>
                <dd className="text-slate-200">{freelancer.questionFlag ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Comments</dt>
                <dd className="text-slate-200">{freelancer.comments || '—'}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Notification history">
            <div className="space-y-3">
              {relatedNotifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
                  <div className="text-slate-200">{notification.message}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatDate(notification.scheduledFor)}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
