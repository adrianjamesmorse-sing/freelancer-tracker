import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
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
  const { projects, getAllocationsForProject, addProject, removeProject } = useTrackerData()
  const [form, setForm] = useState<NewProjectInput>(initialForm)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<'All' | Entity>('All')
  const [sortKey, setSortKey] = useState<SortKey>('projectName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = addProject(form)
    setMessage(result.message)
    if (result.success) {
      setForm(initialForm)
      setIsModalOpen(false)
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

  return (
    <>
      <Panel
        title="All projects"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-[#efe7da] px-4 py-2 text-sm font-medium text-stone-800 hover:bg-[#e6dccb]"
            onClick={() => {
              setMessage('')
              setIsModalOpen(true)
            }}
            type="button"
          >
            <span aria-hidden="true">＋</span>
            <span>Add project</span>
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 sm:max-w-sm"
                placeholder="Search project, manager, entity..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 sm:w-56"
                value={entityFilter}
                onChange={(event) => setEntityFilter(event.target.value as 'All' | Entity)}
              >
                <option value="All">All entities</option>
                {entityOptions.map((entity) => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-stone-500">{filteredRows.length} projects</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/85">
            <div className="max-h-[68vh] overflow-auto">
              <table className="min-w-[1080px] divide-y divide-slate-800 text-sm">
                <thead className="sticky top-0 z-10 bg-[#f8f3ea]/95 backdrop-blur">
                  <tr className="text-left text-stone-600">
                    <SortableHeader label="Project" active={sortKey === 'projectName'} direction={sortDirection} onClick={() => toggleSort('projectName')} />
                    <SortableHeader label="Entity" active={sortKey === 'entity'} direction={sortDirection} onClick={() => toggleSort('entity')} />
                    <SortableHeader label="Project manager" active={sortKey === 'projectManagerName'} direction={sortDirection} onClick={() => toggleSort('projectManagerName')} />
                    <SortableHeader label="Freelancers" active={sortKey === 'freelancerCount'} direction={sortDirection} onClick={() => toggleSort('freelancerCount')} />
                    <SortableHeader label="Date range" active={sortKey === 'dateRange'} direction={sortDirection} onClick={() => toggleSort('dateRange')} />
                    <th className="sticky top-0 bg-[#f8f3ea]/95 px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRows.map((row) => (
                    <tr key={row.project.id} className="hover:bg-[#fbf7ef]">
                      <td className="px-4 py-3 align-top">
                        <Link to={`/projects/${row.project.id}`} className="font-medium text-stone-900 hover:text-brand-700">
                          {row.project.projectName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700"><StatusBadge value={row.project.entity} /></td>
                      <td className="px-4 py-3 align-top text-stone-700">
                        <div>{row.project.projectManagerName || '—'}</div>
                        <div className="max-w-[280px] break-all text-xs text-stone-500">{row.project.projectManagerEmail || '—'}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700">{row.freelancerCount}</td>
                      <td className="px-4 py-3 align-top text-stone-700">
                        {row.start && row.end ? `${formatDate(row.start)} → ${formatDate(row.end)}` : '—'}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
                          onClick={() => {
                            if (window.confirm(`Remove ${row.project.projectName} and related allocations?`)) {
                              removeProject(row.project.id)
                            }
                          }}
                          type="button"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Panel>

      <Modal
        open={isModalOpen}
        title="Add project"
        description="Create a project manually and keep the table area focused on data."
        onClose={() => setIsModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Project name" value={form.projectName} onChange={(value) => setForm((current) => ({ ...current, projectName: value }))} required />
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block">Entity</span>
            <select
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900"
              value={form.entity}
              onChange={(event) => setForm((current) => ({ ...current, entity: event.target.value as Entity }))}
            >
              {entityOptions.map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </label>
          <Input label="Project manager name" value={form.projectManagerName} onChange={(value) => setForm((current) => ({ ...current, projectManagerName: value }))} />
          <Input label="Project manager email" type="email" value={form.projectManagerEmail} onChange={(value) => setForm((current) => ({ ...current, projectManagerEmail: value }))} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {message ? <p className="text-sm text-stone-500">{message}</p> : <span />}
            <button className="rounded-xl border border-stone-300 bg-[#efe7da] px-4 py-2 text-sm font-medium text-stone-800 hover:bg-[#e6dccb]" type="submit">
              Add project
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function getSortValue(row: { project: { projectName: string; entity: string; projectManagerName: string }; freelancerCount: number; start: string }, key: SortKey) {
  switch (key) {
    case 'projectName':
      return row.project.projectName.toLowerCase()
    case 'entity':
      return row.project.entity.toLowerCase()
    case 'projectManagerName':
      return row.project.projectManagerName.toLowerCase()
    case 'freelancerCount':
      return row.freelancerCount
    case 'dateRange':
      return row.start || '9999-12-31'
  }
}

function SortableHeader({ label, active, direction, onClick }: { label: string; active: boolean; direction: SortDirection; onClick: () => void }) {
  return (
    <th className="sticky top-0 bg-[#f8f3ea]/95 px-4 py-3 font-medium">
      <button className="inline-flex items-center gap-2 text-left transition hover:text-stone-900" onClick={onClick} type="button">
        <span>{label}</span>
        <span className={active ? 'text-brand-700' : 'text-stone-400'}>{active ? (direction === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  )
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="mb-1 block">{label}</span>
      <input
        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
