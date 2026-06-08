import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../hooks/useTrackerData'
import { fetchProjectStaff } from '../lib/api'
import { formatDate } from '../lib/format'
import type { ProjectStaffAssignment } from '../types'

type FeedbackFilter = 'All' | 'Active' | 'Ended'

export function FeedbackManagerPage() {
  const { projects, getAllocationsForProject, getFreelancerById } = useTrackerData()
  const { idToken } = useAuth()
  const [filter, setFilter] = useState<FeedbackFilter>('All')
  const [search, setSearch] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id ?? null)
  const [internalStaff, setInternalStaff] = useState<ProjectStaffAssignment[]>([])
  const [peopleMessage, setPeopleMessage] = useState('')
  const [isLoadingPeople, setIsLoadingPeople] = useState(false)

  const projectRows = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return projects.map((project) => {
      const allocations = getAllocationsForProject(project.id)
      const starts = allocations.map((item) => item.contractStartDate).sort()
      const ends = allocations.map((item) => item.contractEndDate).sort()
      const latestEnd = ends[ends.length - 1] ?? ''
      const isActive = allocations.some((allocation) => {
        if (allocation.allocationStatus === 'Closed') return false
        const end = new Date(allocation.contractEndDate)
        end.setHours(23, 59, 59, 999)
        return end >= today
      })
      const status = isActive ? 'Active' : 'Ended'
      const participants = allocations
        .map((allocation) => ({ allocation, freelancer: getFreelancerById(allocation.freelancerId) }))
        .filter((item): item is { allocation: typeof allocations[number]; freelancer: NonNullable<ReturnType<typeof getFreelancerById>> } => Boolean(item.freelancer))

      return {
        project,
        status,
        starts,
        ends,
        latestEnd,
        participants,
      }
    })
  }, [projects, getAllocationsForProject, getFreelancerById])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projectRows.filter((row) => {
      const matchesFilter = filter === 'All' || row.status === filter
      const haystack = [row.project.projectName, row.project.projectManagerName, row.project.projectManagerEmail, row.project.entity]
        .join(' ')
        .toLowerCase()
      const matchesSearch = !query || haystack.includes(query)
      return matchesFilter && matchesSearch
    })
  }, [projectRows, filter, search])

  const selectedProject = filteredRows.find((row) => row.project.id === selectedProjectId) ?? filteredRows[0] ?? null

  const activeCount = projectRows.filter((row) => row.status === 'Active').length
  const endedCount = projectRows.filter((row) => row.status === 'Ended').length
  const totalParticipants = (selectedProject?.participants.length ?? 0) + internalStaff.length + (selectedProject ? 1 : 0)

  useEffect(() => {
    if (!selectedProject || !idToken) {
      setInternalStaff([])
      return
    }

    let cancelled = false

    const loadProjectStaff = async () => {
      setIsLoadingPeople(true)
      setPeopleMessage('')
      try {
        const rows = await fetchProjectStaff(selectedProject.project.id, { idToken })
        if (!cancelled) {
          setInternalStaff(rows)
        }
      } catch (err) {
        if (!cancelled) {
          setInternalStaff([])
          setPeopleMessage(err instanceof Error ? err.message : 'Failed to load internal staff.')
        }
      } finally {
        if (!cancelled) setIsLoadingPeople(false)
      }
    }

    void loadProjectStaff()

    return () => {
      cancelled = true
    }
  }, [selectedProject?.project.id, idToken])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects in feedback scope"
          value={projectRows.length}
          hint="All shared projects from the Vertex projects database."
          tone="brand"
          icon={<Icon name="folder" className="h-5 w-5" />}
        />
        <StatCard
          label="Active projects"
          value={activeCount}
          hint="Still live and likely to enter continuous feedback loops."
          tone="olive"
          icon={<Icon name="sparkles" className="h-5 w-5" />}
        />
        <StatCard
          label="Ended projects"
          value={endedCount}
          hint="Good candidates for project-end feedback cycles."
          tone="sand"
          icon={<Icon name="check" className="h-5 w-5" />}
        />
        <StatCard
          label="Selected participants"
          value={totalParticipants}
          hint="Project owner, internal squad and freelancers linked to the selected project."
          tone="rose"
          icon={<Icon name="users" className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)]">
        <Panel title="Feedback project browser" subtitle="Shared project IDs now sit outside the freelancer module so feedback can use the same project source of truth.">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <input
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 sm:max-w-sm"
                  placeholder="Search project, manager, entity..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <div className="inline-flex overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm">
                  {(['All', 'Active', 'Ended'] as FeedbackFilter[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={[
                        'px-4 py-2 text-sm font-medium transition',
                        filter === value ? 'bg-[#e6dccb] text-brand-800' : 'text-stone-600 hover:bg-[#f5efe4] hover:text-stone-900',
                      ].join(' ')}
                      onClick={() => setFilter(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-stone-500">{filteredRows.length} projects</div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/85">
              <div className="max-h-[70vh] overflow-auto">
                <table className="min-w-[980px] divide-y divide-stone-200 text-sm">
                  <thead className="sticky top-0 z-10 bg-[#f8f3ea]/95 text-left text-stone-600 backdrop-blur">
                    <tr>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Entity</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium">Freelancers</th>
                      <th className="px-4 py-3 font-medium">Latest end</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/80">
                    {filteredRows.map((row) => (
                      <tr
                        key={row.project.id}
                        className={[
                          'cursor-pointer transition hover:bg-[#fbf7ef]',
                          selectedProject?.project.id === row.project.id ? 'bg-[#f5efe4]' : '',
                        ].join(' ')}
                        onClick={() => setSelectedProjectId(row.project.id)}
                      >
                        <td className="px-4 py-3 align-top font-medium text-stone-900">{row.project.projectName}</td>
                        <td className="px-4 py-3 align-top text-stone-700"><StatusBadge value={row.project.entity} /></td>
                        <td className="px-4 py-3 align-top">
                          <span className={[
                            'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                            row.status === 'Active' ? 'bg-olive-100 text-olive-800' : 'bg-stone-200 text-stone-700',
                          ].join(' ')}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-stone-700">
                          <div>{row.project.projectManagerName || '—'}</div>
                          <div className="max-w-[260px] break-all text-xs text-stone-500">{row.project.projectManagerEmail || '—'}</div>
                        </td>
                        <td className="px-4 py-3 align-top text-stone-700">{row.participants.length}</td>
                        <td className="px-4 py-3 align-top text-stone-700">{row.latestEnd ? formatDate(row.latestEnd) : '—'}</td>
                      </tr>
                    ))}
                    {!filteredRows.length ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-500">
                          No projects match the current search/filter.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={selectedProject ? selectedProject.project.projectName : 'Project details'} subtitle="Feedback uses the shared project record, assigned freelancers and internal Entra squad data.">
          {selectedProject ? (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-stone-500">Project owner</div>
                    <div className="mt-2 text-lg font-semibold text-stone-900">{selectedProject.project.projectManagerName || 'Unassigned'}</div>
                    <div className="mt-1 text-sm text-stone-500">{selectedProject.project.projectManagerEmail || 'No project manager email recorded'}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={selectedProject.project.entity} />
                    <span className={[
                      'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                      selectedProject.status === 'Active' ? 'bg-olive-100 text-olive-800' : 'bg-stone-200 text-stone-700',
                    ].join(' ')}>
                      {selectedProject.status}
                    </span>
                  </div>
                </div>

                <dl className="mt-4 grid gap-4 text-sm text-stone-600 sm:grid-cols-2">
                  <div>
                    <dt className="text-stone-500">Project ID</dt>
                    <dd className="mt-1 font-medium text-stone-900">{selectedProject.project.id}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Date range</dt>
                    <dd className="mt-1 font-medium text-stone-900">
                      {selectedProject.starts[0] && selectedProject.ends[selectedProject.ends.length - 1]
                        ? `${formatDate(selectedProject.starts[0])} → ${formatDate(selectedProject.ends[selectedProject.ends.length - 1])}`
                        : 'No allocation dates yet'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">People on this project</h3>
                    <p className="mt-1 text-sm text-stone-500">Internal staff are synced from Entra and combined with freelancer assignments.</p>
                  </div>
                  <span className="inline-flex rounded-full border border-stone-200 bg-[#f8f3ea] px-3 py-1 text-xs text-stone-600">
                    {totalParticipants} people
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {peopleMessage ? (
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                      {peopleMessage}
                    </div>
                  ) : null}

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Project leader</div>
                    <FeedbackPersonCard
                      name={selectedProject.project.projectManagerName || 'Unassigned'}
                      email={selectedProject.project.projectManagerEmail || ''}
                      role="Project leader"
                      detail="Internal staff"
                      featured
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Internal squad</div>
                      {isLoadingPeople ? <div className="text-xs text-stone-500">Loading…</div> : null}
                    </div>

                    {internalStaff.length ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {internalStaff.map((staff) => (
                          <FeedbackPersonCard
                            key={staff.id}
                            name={staff.fullName}
                            email={staff.email}
                            role={staff.assignmentRole}
                            detail={staff.jobTitle || staff.department || 'Internal staff'}
                            photoUrl={staff.photoUrl}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-[#fbf7ef] px-4 py-6 text-center text-sm text-stone-500">
                        No internal squad members are assigned yet.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Freelancers</div>
                    <div className="space-y-3">
                      {selectedProject.participants.map(({ allocation, freelancer }) => (
                        <div key={allocation.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-stone-900">{freelancer.freelancerName}</div>
                              <div className="mt-1 text-sm text-stone-500">Freelancer · {allocation.roleWithinProject || 'Role not set'}</div>
                            </div>
                            <StatusBadge value={allocation.allocationStatus} />
                          </div>
                          <dl className="mt-3 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
                            <div>
                              <dt className="text-stone-500">Dates</dt>
                              <dd className="mt-1 font-medium text-stone-900">{formatDate(allocation.contractStartDate)} → {formatDate(allocation.contractEndDate)}</dd>
                            </div>
                            <div>
                              <dt className="text-stone-500">Owner</dt>
                              <dd className="mt-1 font-medium text-stone-900">{allocation.ownerManagerName || '—'}</dd>
                            </div>
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!selectedProject.participants.length ? (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-[#fbf7ef] px-4 py-8 text-center text-sm text-stone-500">
                      No freelancers are currently linked to this project.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,#f7f3eb,#efe7d9)] p-5 shadow-sm">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-stone-50">
                  <Icon name="message-square" className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">Next feedback step</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  Build project-end and continuous 360 feedback flows around the internal squad, freelancers and project leader.
                </p>
                <div className="mt-4">
                  <Link to={`/projects/${selectedProject.project.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white/90 px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-white">
                    Open shared project record
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-stone-300 bg-white/70 px-4 py-10 text-center text-sm text-stone-500">
              Select a project to inspect the people that feedback will eventually be collected for.
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

function FeedbackPersonCard({
  name,
  email,
  role,
  detail,
  photoUrl,
  featured = false,
}: {
  name: string
  email: string
  role: string
  detail: string
  photoUrl?: string | null
  featured?: boolean
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div
      className={[
        'flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm',
        featured ? 'border-olive-200 bg-[#fbf7ef]' : 'border-stone-200',
      ].join(' ')}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-stone-200" />
      ) : (
        <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-olive-700 text-sm font-semibold text-white ring-1 ring-stone-200">
          {initials || 'V'}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-stone-900">{name}</div>
        <div className="mt-1 text-xs font-medium text-stone-600">{role}</div>
        <div className="mt-1 truncate text-xs text-stone-500">{detail}</div>
        {email ? <div className="mt-1 truncate text-xs text-stone-400">{email}</div> : null}
      </div>
    </div>
  )
}
