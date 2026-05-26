import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { Panel } from '../components/Panel'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate } from '../lib/format'
import type { Entity, NewProjectInput } from '../types'

type SortKey = 'projectName' | 'entity' | 'projectManagerName' | 'freelancerCount' | 'dateRange'
type SortDirection = 'asc' | 'desc'

const entityOptions: Entity[] = ['Squadigital FR', 'Squadigital UK', 'Squadigital GE', 'JV', 'Unspecified']

const initialForm: NewProjectInput = {
  projectName: '',
  entity: 'Squadigital UK',
  projectManagerName: '',
  projectManagerEmail: '',
}

export function ProjectsPage() {
  const { projects, getAllocationsForProject, addProject, removeProject, isProjectsLoaded, isAllocationsLoaded } = useTrackerData()
  const [form, setForm] = useState<NewProjectInput>(initialForm)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<'All' | Entity>('All')
  const [sortKey, setSortKey] = useState<SortKey>('projectName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const rows = useMemo(() => projects.map((project) => {
    const items = getAllocationsForProject(project.id)
    const starts = items.map((item) => item.contractStartDate).sort()
    const ends = items.map((item) => item.contractEndDate).sort()
    return {
      project,
      freelancerCount: items.length,
      start: starts[0] ?? '',
      end: ends[ends.length - 1] ?? '',
    }
  }), [projects, getAllocationsForProject])

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLowerCase()
    const filtered = rows.filter((row) => {
      const matchesSearch = !searchValue || [
        row.project.projectName,
        row.project.projectManagerName,
        row.project.projectManagerEmail,
        row.project.entity,
      ].join(' ').toLowerCase().includes(searchValue)
      const matchesEntity = entityFilter === 'All' || row.project.entity === entityFilter
      return matchesSearch && matchesEntity
    })

    filtered.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1
      const left = getSortValue(a, sortKey)
      const right = getSortValue(b, sortKey)
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction
      return String(left).localeCompare(String(right)) * direction
    })

    return filtered
  }, [rows, search, entityFilter, sortKey, sortDirection])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await addProject(form)
      setMessage(result.message)
      if (result.success) {
        setForm(initialForm)
        setIsModalOpen(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    setRemovingId(id)
    setMessage('')
    try {
      await removeProject(id)
      setMessage('Project removed.')
    } catch {
      setMessage('Failed to remove project.')
    } finally {
      setRemovingId(null)
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
      return
    }
    setSortKey(key)
    setSortDirection('asc')
  }

  const isLoaded = isProjectsLoaded && isAllocationsLoaded

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Projects</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Shared project database used across freelancers and feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          <span aria-hidden="true">＋</span>
          Add project
        </button>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <Panel title="All projects" subtitle="Shared project records with staffing visibility across Vertex.">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects, managers or entities"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none ring-0 transition placeholder:text-stone-400 focus:border-stone-500 md:max-w-md"
            />
            <select
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value as 'All' | Entity)}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            >
              <option value="All">All entities</option>
              {entityOptions.map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-stone-200 bg-white">
          <div className="max-h-[560px] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 text-stone-500 backdrop-blur">
                <tr>
                  <SortableHeader label="Project" active={sortKey === 'projectName'} direction={sortDirection} onClick={() => toggleSort('projectName')} />
                  <SortableHeader label="Entity" active={sortKey === 'entity'} direction={sortDirection} onClick={() => toggleSort('entity')} />
                  <SortableHeader label="Project manager" active={sortKey === 'projectManagerName'} direction={sortDirection} onClick={() => toggleSort('projectManagerName')} />
                  <SortableHeader label="Freelancers" active={sortKey === 'freelancerCount'} direction={sortDirection} onClick={() => toggleSort('freelancerCount')} />
                  <SortableHeader label="Date range" active={sortKey === 'dateRange'} direction={sortDirection} onClick={() => toggleSort('dateRange')} />
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoaded ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-stone-500">Loading projects…</td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-stone-500">No projects found.</td>
                  </tr>
                ) : filteredRows.map((row) => (
                  <tr key={row.project.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/70">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      <Link to={`/projects/${row.project.id}`} className="hover:text-stone-700">
                        {row.project.projectName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{row.project.entity}</td>
                    <td className="px-4 py-3 text-stone-700">
                      <div>{row.project.projectManagerName}</div>
                      <div className="text-xs text-stone-500">{row.project.projectManagerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{row.freelancerCount}</td>
                    <td className="px-4 py-3 text-stone-700">
                      {row.start && row.end ? `${formatDate(row.start)} → ${formatDate(row.end)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/projects/${row.project.id}`} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100">
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleRemove(row.project.id)}
                          disabled={removingId === row.project.id}
                          className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {removingId === row.project.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      <Modal
        open={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false)
            setForm(initialForm)
          }
        }}
        title="Add project"
      >
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Project name</span>
            <input
              required
              value={form.projectName}
              onChange={(event) => setForm((current) => ({ ...current, projectName: event.target.value }))}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Entity</span>
            <select
              value={form.entity}
              onChange={(event) => setForm((current) => ({ ...current, entity: event.target.value as Entity }))}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            >
              {entityOptions.map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Project manager name</span>
            <input
              required
              value={form.projectManagerName}
              onChange={(event) => setForm((current) => ({ ...current, projectManagerName: event.target.value }))}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Project manager email</span>
            <input
              required
              type="email"
              value={form.projectManagerEmail}
              onChange={(event) => setForm((current) => ({ ...current, projectManagerEmail: event.target.value }))}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            />
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setForm(initialForm)
              }}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Add project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 font-medium">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-left hover:text-stone-900">
        <span>{label}</span>
        <span className="text-xs text-stone-400">{active ? (direction === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  )
}

function getSortValue(
  row: { project: { projectName: string; entity: string; projectManagerName: string }; freelancerCount: number; start: string; end: string },
  key: SortKey,
) {
  if (key === 'projectName') return row.project.projectName
  if (key === 'entity') return row.project.entity
  if (key === 'projectManagerName') return row.project.projectManagerName
  if (key === 'freelancerCount') return row.freelancerCount
  return `${row.start}-${row.end}`
}