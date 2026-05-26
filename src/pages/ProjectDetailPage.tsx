import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate, formatMoney } from '../lib/format'
import type { NewAllocationInput } from '../types'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const {
    freelancers,
    getProjectById,
    getAllocationsForProject,
    getFreelancerById,
    addAllocation,
    removeAllocation,
    isProjectsLoaded,
    isAllocationsLoaded,
  } = useTrackerData()

  const project = id ? getProjectById(id) : undefined
  const isReady = isProjectsLoaded && isAllocationsLoaded

  const allocations = project ? getAllocationsForProject(project.id) : []
  const availableFreelancers = useMemo(
    () => freelancers.slice().sort((a, b) => a.freelancerName.localeCompare(b.freelancerName)),
    [freelancers],
  )

  const defaultFreelancerId = availableFreelancers[0]?.id ?? ''

  const initialForm = useMemo<NewAllocationInput>(
    () => ({
      freelancerId: defaultFreelancerId,
      projectId: project?.id ?? '',
      contractStartDate: new Date().toISOString().slice(0, 10),
      contractEndDate: new Date().toISOString().slice(0, 10),
      numberOfDays: 0,
      dailyRate: 0,
      dailyRateCurrency: 'EUR',
      dailyRateNote: '',
      roleWithinProject: '',
      ownerManagerName: project?.projectManagerName ?? '',
      ownerManagerEmail: project?.projectManagerEmail ?? '',
      allocationStatus: 'Active',
    }),
    [defaultFreelancerId, project],
  )

  const [form, setForm] = useState<NewAllocationInput>(initialForm)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  if (!isReady) {
    return (
      <Panel title="Loading project">
        <div className="text-sm text-stone-600">Fetching project details…</div>
      </Panel>
    )
  }

  if (!project) {
    return (
      <Panel title="Project not found">
        <Link to="/projects" className="text-brand-700 hover:text-brand-800">Back to projects</Link>
      </Panel>
    )
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await addAllocation({ ...form, projectId: project.id, ownerManagerName: project.projectManagerName, ownerManagerEmail: project.projectManagerEmail })
      setMessage(result.message)
      if (result.success) {
        setForm({ ...initialForm, freelancerId: availableFreelancers[0]?.id ?? '' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (allocationId: string) => {
    setRemovingId(allocationId)
    setMessage('')
    try {
      await removeAllocation(allocationId)
      setMessage('Allocation removed.')
    } catch {
      setMessage('Failed to remove allocation.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/projects" className="text-sm text-brand-700 hover:text-brand-800">← Back to projects</Link>
        <h2 className="mt-2 text-3xl font-semibold text-stone-900">{project.projectName}</h2>
        <p className="mt-2 text-sm text-stone-500">{project.entity} · {project.projectManagerName}</p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">{message}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Assigned freelancers">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead>
                <tr className="text-left text-stone-500">
                  <th className="pb-3 pr-4 font-medium">Freelancer</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Dates</th>
                  <th className="pb-3 pr-4 font-medium">Rate</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">No freelancers assigned yet.</td>
                  </tr>
                ) : allocations.map((allocation) => {
                  const freelancer = getFreelancerById(allocation.freelancerId)
                  return (
                    <tr key={allocation.id}>
                      <td className="py-3 pr-4 text-stone-900">{freelancer?.freelancerName ?? 'Unknown freelancer'}</td>
                      <td className="py-3 pr-4 text-stone-700">{allocation.roleWithinProject || '—'}</td>
                      <td className="py-3 pr-4 text-stone-700">{formatDate(allocation.contractStartDate)} → {formatDate(allocation.contractEndDate)}</td>
                      <td className="py-3 pr-4 text-stone-700">{formatMoney(allocation.dailyRate, allocation.dailyRateCurrency)}</td>
                      <td className="py-3 pr-4"><StatusBadge value={allocation.allocationStatus} /></td>
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => void handleRemove(allocation.id)}
                          disabled={removingId === allocation.id}
                          className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {removingId === allocation.id ? 'Removing…' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Add freelancer to project">
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Freelancer</span>
              <select
                value={form.freelancerId}
                onChange={(event) => setForm((current) => ({ ...current, freelancerId: event.target.value }))}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
              >
                {availableFreelancers.map((freelancer) => (
                  <option key={freelancer.id} value={freelancer.id}>{freelancer.freelancerName}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Start date</span>
                <input
                  type="date"
                  value={form.contractStartDate}
                  onChange={(event) => setForm((current) => ({ ...current, contractStartDate: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">End date</span>
                <input
                  type="date"
                  value={form.contractEndDate}
                  onChange={(event) => setForm((current) => ({ ...current, contractEndDate: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Number of days</span>
                <input
                  type="number"
                  min={0}
                  value={form.numberOfDays}
                  onChange={(event) => setForm((current) => ({ ...current, numberOfDays: Number(event.target.value) }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Role</span>
                <input
                  value={form.roleWithinProject}
                  onChange={(event) => setForm((current) => ({ ...current, roleWithinProject: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Daily rate</span>
                <input
                  type="number"
                  min={0}
                  value={form.dailyRate}
                  onChange={(event) => setForm((current) => ({ ...current, dailyRate: Number(event.target.value) }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Currency</span>
                <select
                  value={form.dailyRateCurrency}
                  onChange={(event) => setForm((current) => ({ ...current, dailyRateCurrency: event.target.value as 'EUR' | 'GBP' }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Rate note</span>
              <input
                value={form.dailyRateNote}
                onChange={(event) => setForm((current) => ({ ...current, dailyRateNote: event.target.value }))}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
              >
                {isSubmitting ? 'Saving…' : 'Add freelancer'}
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  )
}