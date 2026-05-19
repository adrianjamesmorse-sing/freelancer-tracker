import { useState } from 'react'
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
  } = useTrackerData()

  const project = id ? getProjectById(id) : undefined

  if (!project) {
    return (
      <Panel title="Project not found">
        <Link to="/projects" className="text-brand-700 hover:text-brand-800">Back to projects</Link>
      </Panel>
    )
  }

  const allocations = getAllocationsForProject(project.id)

  const availableFreelancers = freelancers.slice().sort((a, b) => a.freelancerName.localeCompare(b.freelancerName))

  const defaultFreelancerId = availableFreelancers[0]?.id ?? ''

  const initialForm: NewAllocationInput = {
    freelancerId: defaultFreelancerId,
    projectId: project.id,
    contractStartDate: new Date().toISOString().slice(0, 10),
    contractEndDate: new Date().toISOString().slice(0, 10),
    numberOfDays: 0,
    dailyRate: 0,
    dailyRateCurrency: 'EUR',
    dailyRateNote: '',
    roleWithinProject: '',
    ownerManagerName: project.projectManagerName,
    ownerManagerEmail: project.projectManagerEmail,
    allocationStatus: 'Active',
  }

  const [form, setForm] = useState<NewAllocationInput>(initialForm)
  const [message, setMessage] = useState('')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = addAllocation({ ...form, projectId: project.id })
    setMessage(result.message)
    if (result.success) {
      setForm({
        ...initialForm,
        freelancerId: availableFreelancers[0]?.id ?? '',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/projects" className="text-sm text-brand-700 hover:text-brand-800">← Back to projects</Link>
        <h2 className="mt-2 text-3xl font-semibold text-stone-900">{project.projectName}</h2>
        <p className="mt-2 text-sm text-stone-500">{project.entity} · {project.projectManagerName}</p>
      </div>

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
                  <th className="pb-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/80">
                {allocations.map((allocation) => {
                  const freelancer = getFreelancerById(allocation.freelancerId)
                  return (
                    <tr key={allocation.id}>
                      <td className="py-3 pr-4 text-stone-900">{freelancer?.freelancerName ?? 'Unknown freelancer'}</td>
                      <td className="py-3 pr-4 text-stone-700">{allocation.roleWithinProject}</td>
                      <td className="py-3 pr-4 text-stone-700">{formatDate(allocation.contractStartDate)} → {formatDate(allocation.contractEndDate)}</td>
                      <td className="py-3 pr-4 text-stone-700">{formatMoney(allocation.dailyRate, allocation.dailyRateCurrency)}</td>
                      <td className="py-3 pr-4"><StatusBadge value={allocation.allocationStatus} /></td>
                      <td className="py-3 pr-4">
                        <button
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                          onClick={() => {
                            if (window.confirm('Remove this freelancer from the project?')) {
                              removeAllocation(allocation.id)
                            }
                          }}
                        >
                          Remove
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
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm text-stone-700">
              <span className="mb-1 block">Freelancer</span>
              <select
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm"
                value={form.freelancerId}
                onChange={(event) => setForm((current) => ({ ...current, freelancerId: event.target.value }))}
                required
              >
                {availableFreelancers.map((freelancer) => (
                  <option key={freelancer.id} value={freelancer.id}>{freelancer.freelancerName}</option>
                ))}
              </select>
            </label>

            <Input label="Role on project" value={form.roleWithinProject} onChange={(value) => setForm((current) => ({ ...current, roleWithinProject: value }))} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Start date" type="date" value={form.contractStartDate} onChange={(value) => setForm((current) => ({ ...current, contractStartDate: value }))} required />
              <Input label="End date" type="date" value={form.contractEndDate} onChange={(value) => setForm((current) => ({ ...current, contractEndDate: value }))} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Number of days" type="number" value={String(form.numberOfDays)} onChange={(value) => setForm((current) => ({ ...current, numberOfDays: Number(value) || 0 }))} />
              <Input label="Daily rate" type="number" value={String(form.dailyRate)} onChange={(value) => setForm((current) => ({ ...current, dailyRate: Number(value) || 0 }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-stone-700">
                <span className="mb-1 block">Currency</span>
                <select
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm"
                  value={form.dailyRateCurrency}
                  onChange={(event) => setForm((current) => ({ ...current, dailyRateCurrency: event.target.value as 'EUR' | 'GBP' }))}
                >
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </label>
              <label className="block text-sm text-stone-700">
                <span className="mb-1 block">Status</span>
                <select
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm"
                  value={form.allocationStatus}
                  onChange={(event) => setForm((current) => ({ ...current, allocationStatus: event.target.value as NewAllocationInput['allocationStatus'] }))}
                >
                  <option value="Active">Active</option>
                  <option value="Extended pending close">Extended pending close</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
            </div>
            <Input label="Daily rate note" value={form.dailyRateNote} onChange={(value) => setForm((current) => ({ ...current, dailyRateNote: value }))} />
            <Input label="Owner manager name" value={form.ownerManagerName} onChange={(value) => setForm((current) => ({ ...current, ownerManagerName: value }))} />
            <Input label="Owner manager email" type="email" value={form.ownerManagerEmail} onChange={(value) => setForm((current) => ({ ...current, ownerManagerEmail: value }))} />
            <button className="rounded-xl border border-brand-400/30 bg-brand-500/20 px-4 py-2 text-sm font-medium text-stone-900" type="submit">
              Add freelancer
            </button>
            {message ? <p className="text-sm text-stone-500">{message}</p> : null}
          </form>
        </Panel>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="mb-1 block">{label}</span>
      <input
        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
