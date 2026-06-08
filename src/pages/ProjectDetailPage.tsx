import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import { fetchStaff, type StaffMember } from '../lib/authApi'
import { createProjectStaff, deleteProjectStaff, fetchProjectStaff } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatMoney } from '../lib/format'
import type { NewAllocationInput, ProjectStaffAssignment } from '../types'

const squadRoleOptions = ['Squad Lead', 'Consultant', 'Manager', 'Expert', 'Reviewer', 'Operations']

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
  const { idToken, roles } = useAuth()
  const canEditProjectStaff = roles.includes('editor') || roles.includes('admin')

  const project = id ? getProjectById(id) : undefined
  const isReady = isProjectsLoaded && isAllocationsLoaded

  const allocations = project ? getAllocationsForProject(project.id) : []
  const [staffDirectory, setStaffDirectory] = useState<StaffMember[]>([])
  const [projectStaff, setProjectStaff] = useState<ProjectStaffAssignment[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffMessage, setStaffMessage] = useState('')
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedStaffRole, setSelectedStaffRole] = useState(squadRoleOptions[1])
  const [isAssigningStaff, setIsAssigningStaff] = useState(false)
  const [removingStaffId, setRemovingStaffId] = useState<string | null>(null)

  const availableFreelancers = useMemo(
    () => freelancers
      .filter((item) => item.freelancerStatus !== 'Inactive')
      .slice()
      .sort((a, b) => a.freelancerName.localeCompare(b.freelancerName)),
    [freelancers],
  )

  const buildInitialForm = (): NewAllocationInput => ({
    freelancerId: availableFreelancers[0]?.id ?? '',
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
  })

  const [form, setForm] = useState<NewAllocationInput>(buildInitialForm())
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const projectLeader = useMemo(() => {
    const syncedLeader = staffDirectory.find(
      (staff) => staff.email.toLowerCase() === project?.projectManagerEmail.toLowerCase(),
    )
    if (syncedLeader) {
      return {
        fullName: syncedLeader.fullName,
        email: syncedLeader.email,
        role: 'Project Leader',
        jobTitle: syncedLeader.jobTitle,
        department: syncedLeader.department,
        photoUrl: syncedLeader.photoUrl,
      }
    }

    return project
      ? {
          fullName: project.projectManagerName,
          email: project.projectManagerEmail,
          role: 'Project Leader',
          jobTitle: null,
          department: null,
          photoUrl: null,
        }
      : null
  }, [project, staffDirectory])

  const assignableStaff = useMemo(() => {
    const assignedIds = new Set(projectStaff.map((assignment) => assignment.staffId))
    return staffDirectory
      .filter((staff) => !assignedIds.has(staff.id))
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [projectStaff, staffDirectory])

  useEffect(() => {
    if (!project) return
    setForm(buildInitialForm())
  }, [project?.id, availableFreelancers[0]?.id])

  useEffect(() => {
    if (!project || !idToken) return
    let cancelled = false

    const loadStaff = async () => {
      setStaffLoading(true)
      setStaffMessage('')
      try {
        const [staffRows, assignmentRows] = await Promise.all([
          fetchStaff(idToken),
          fetchProjectStaff(project.id, { idToken }),
        ])
        if (!cancelled) {
          const assignedIds = new Set(assignmentRows.map((assignment) => assignment.staffId))
          const firstAssignable = staffRows.find((staff) => !assignedIds.has(staff.id))
          setStaffDirectory(staffRows)
          setProjectStaff(assignmentRows)
          setSelectedStaffId((current) =>
            current && !assignedIds.has(current) ? current : firstAssignable?.id || '',
          )
        }
      } catch (err) {
        if (!cancelled) {
          setStaffMessage(err instanceof Error ? err.message : 'Failed to load project squad.')
        }
      } finally {
        if (!cancelled) setStaffLoading(false)
      }
    }

    void loadStaff()

    return () => {
      cancelled = true
    }
  }, [project?.id, idToken])

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
      const result = await addAllocation({
        ...form,
        projectId: project.id,
        ownerManagerName: project.projectManagerName,
        ownerManagerEmail: project.projectManagerEmail,
      })
      setMessage(result.message)
      if (result.success) {
        setForm(buildInitialForm())
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

  const handleAssignStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!project || !idToken || !selectedStaffId) return

    setIsAssigningStaff(true)
    setStaffMessage('')
    try {
      await createProjectStaff(
        project.id,
        {
          staffId: selectedStaffId,
          assignmentRole: selectedStaffRole,
        },
        { idToken },
      )
      const rows = await fetchProjectStaff(project.id, { idToken })
      const assignedIds = new Set(rows.map((assignment) => assignment.staffId))
      setProjectStaff(rows)
      setSelectedStaffId(staffDirectory.find((staff) => !assignedIds.has(staff.id))?.id || '')
      setStaffMessage('Squad member added.')
    } catch (err) {
      setStaffMessage(err instanceof Error ? err.message : 'Failed to add squad member.')
    } finally {
      setIsAssigningStaff(false)
    }
  }

  const handleRemoveStaff = async (assignmentId: string) => {
    if (!project || !idToken) return
    setRemovingStaffId(assignmentId)
    setStaffMessage('')
    try {
      await deleteProjectStaff(project.id, assignmentId, { idToken })
      setProjectStaff((current) => current.filter((assignment) => assignment.id !== assignmentId))
      setStaffMessage('Squad member removed.')
    } catch (err) {
      setStaffMessage(err instanceof Error ? err.message : 'Failed to remove squad member.')
    } finally {
      setRemovingStaffId(null)
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

      <Panel title="Project squad" subtitle="Internal staff synced from Microsoft Entra and assigned to this project.">
        <div className="space-y-6">
          {staffMessage ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
              {staffMessage}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Project leader
              </div>
              {projectLeader ? (
                <SquadPersonCard
                  name={projectLeader.fullName}
                  email={projectLeader.email}
                  role={projectLeader.role}
                  jobTitle={projectLeader.jobTitle}
                  department={projectLeader.department}
                  photoUrl={projectLeader.photoUrl}
                  featured
                />
              ) : null}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Squad</div>
                {staffLoading ? <div className="text-xs text-stone-500">Loading Entra staff…</div> : null}
              </div>

              {projectStaff.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {projectStaff.map((assignment) => (
                    <SquadPersonCard
                      key={assignment.id}
                      name={assignment.fullName}
                      email={assignment.email}
                      role={assignment.assignmentRole}
                      jobTitle={assignment.jobTitle}
                      department={assignment.department}
                      photoUrl={assignment.photoUrl}
                      action={
                        canEditProjectStaff ? (
                          <button
                            type="button"
                            onClick={() => void handleRemoveStaff(assignment.id)}
                            disabled={removingStaffId === assignment.id}
                            className="mt-3 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                          >
                            {removingStaffId === assignment.id ? 'Removing…' : 'Remove'}
                          </button>
                        ) : null
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-stone-300 bg-white/70 px-4 py-8 text-center text-sm text-stone-500">
                  No internal squad members assigned yet.
                </div>
              )}
            </div>
          </div>

          {canEditProjectStaff ? (
            <form
              onSubmit={handleAssignStaff}
              className="grid gap-3 border-t border-stone-200 pt-5 md:grid-cols-[minmax(0,1fr)_220px_auto]"
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Add internal staff</span>
                <select
                  value={selectedStaffId}
                  onChange={(event) => setSelectedStaffId(event.target.value)}
                  disabled={staffLoading || !assignableStaff.length}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500 disabled:bg-stone-100"
                >
                  <option value="">
                    {assignableStaff.length ? 'Select staff member' : 'All synced staff are already assigned'}
                  </option>
                  {assignableStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName} · {staff.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Role</span>
                <select
                  value={selectedStaffRole}
                  onChange={(event) => setSelectedStaffRole(event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                >
                  {squadRoleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAssigningStaff || !selectedStaffId}
                  className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
                >
                  {isAssigningStaff ? 'Adding…' : 'Add to squad'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </Panel>

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
                  onChange={(event) => setForm((current) => ({ ...current, dailyRateCurrency: event.target.value as 'EUR' | 'GBP' | 'USD' | 'CHF', }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="CHF">CHF</option>
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
                disabled={isSubmitting || availableFreelancers.length === 0}
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

function SquadPersonCard({
  name,
  email,
  role,
  jobTitle,
  department,
  photoUrl,
  featured = false,
  action,
}: {
  name: string
  email: string
  role: string
  jobTitle: string | null
  department: string | null
  photoUrl: string | null
  featured?: boolean
  action?: React.ReactNode
}) {
  return (
    <div
      className={[
        'flex h-full flex-col items-center rounded-[24px] border bg-white/85 px-4 py-5 text-center shadow-sm',
        featured ? 'border-olive-200 bg-[#f7f5eb]' : 'border-stone-200',
      ].join(' ')}
    >
      <PersonAvatar name={name} photoUrl={photoUrl} featured={featured} />
      <div className="mt-3 text-sm font-semibold text-stone-900">{name}</div>
      <div className="mt-1 rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">{role}</div>
      <div className="mt-2 text-xs leading-5 text-stone-500">
        {jobTitle || 'Internal staff'}
        {department ? <span> · {department}</span> : null}
      </div>
      <div className="mt-1 max-w-full truncate text-xs text-stone-400">{email}</div>
      {action}
    </div>
  )
}

function PersonAvatar({
  name,
  photoUrl,
  featured,
}: {
  name: string
  photoUrl: string | null
  featured: boolean
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  const sizeClass = featured ? 'h-24 w-24' : 'h-20 w-20'

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`${sizeClass} rounded-full border-4 border-white object-cover shadow-md ring-1 ring-stone-200`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} inline-flex items-center justify-center rounded-full border-4 border-white bg-olive-700 text-lg font-semibold text-white shadow-md ring-1 ring-stone-200`}
      aria-hidden="true"
    >
      {initials || 'V'}
    </div>
  )
}
