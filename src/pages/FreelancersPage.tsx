import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate } from '../lib/format'
import type { Freelancer, FreelancerStatus, NewFreelancerInput } from '../types'

type SortKey = 'freelancerName' | 'freelancerStatus' | 'owner' | 'projectCount' | 'nextEndDate' | 'personalEmail'
type SortDirection = 'asc' | 'desc'

interface FreelancerRow {
  freelancer: Freelancer
  owner: string
  projectCount: number
  nextEndDate: string
  entity: string
}

const initialForm: NewFreelancerInput = {
  freelancerName: '',
  personalEmail: '',
  phoneNumber: '',
  address: '',
  freelancerStatus: 'Active',
  registrationNumber: false,
  questionFlag: false,
  comments: '',
}

export function FreelancersPage() {
  const { freelancers, getAllocationsForFreelancer, getProjectById, addFreelancer, removeFreelancer } = useTrackerData()
  const [form, setForm] = useState<NewFreelancerInput>(initialForm)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | FreelancerStatus>('All')
  const [sortKey, setSortKey] = useState<SortKey>('freelancerName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const rows = useMemo<FreelancerRow[]>(() => freelancers.map((freelancer) => {
    const items = getAllocationsForFreelancer(freelancer.id)
    const sorted = [...items].sort((a, b) => a.contractEndDate.localeCompare(b.contractEndDate))
    const next = sorted[0]
    const firstProject = next ? getProjectById(next.projectId) : undefined
    return {
      freelancer,
      owner: next?.ownerManagerName ?? '',
      projectCount: items.length,
      nextEndDate: next?.contractEndDate ?? '',
      entity: firstProject?.entity ?? 'No entity',
    }
  }), [freelancers, getAllocationsForFreelancer, getProjectById])

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLowerCase()
    const filtered = rows.filter((row) => {
      const matchesSearch = !searchValue || [
        row.freelancer.freelancerName,
        row.freelancer.personalEmail,
        row.owner,
        row.entity,
      ].join(' ').toLowerCase().includes(searchValue)
      const matchesStatus = statusFilter === 'All' || row.freelancer.freelancerStatus === statusFilter
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1
      const left = getSortValue(a, sortKey)
      const right = getSortValue(b, sortKey)
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction
      return String(left).localeCompare(String(right)) * direction
    })

    return filtered
  }, [rows, search, statusFilter, sortKey, sortDirection])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = addFreelancer(form)
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
        title="All freelancers"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-500/20 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500/30"
            onClick={() => {
              setMessage('')
              setIsModalOpen(true)
            }}
            type="button"
          >
            <span aria-hidden="true">＋</span>
            <span>Add freelancer</span>
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 sm:max-w-sm"
                placeholder="Search freelancer, email, owner, entity..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white sm:w-56"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'All' | FreelancerStatus)}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Ending soon">Ending soon</option>
                <option value="Open follow-up">Open follow-up</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="text-sm text-slate-400">{filteredRows.length} freelancers</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <div className="max-h-[68vh] overflow-auto">
              <table className="min-w-[1100px] divide-y divide-slate-800 text-sm">
                <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                  <tr className="text-left text-slate-400">
                    <SortableHeader label="Freelancer" active={sortKey === 'freelancerName'} direction={sortDirection} onClick={() => toggleSort('freelancerName')} />
                    <SortableHeader label="Status" active={sortKey === 'freelancerStatus'} direction={sortDirection} onClick={() => toggleSort('freelancerStatus')} />
                    <SortableHeader label="Project owner" active={sortKey === 'owner'} direction={sortDirection} onClick={() => toggleSort('owner')} />
                    <SortableHeader label="Projects" active={sortKey === 'projectCount'} direction={sortDirection} onClick={() => toggleSort('projectCount')} />
                    <SortableHeader label="Next end" active={sortKey === 'nextEndDate'} direction={sortDirection} onClick={() => toggleSort('nextEndDate')} />
                    <SortableHeader label="Email" active={sortKey === 'personalEmail'} direction={sortDirection} onClick={() => toggleSort('personalEmail')} />
                    <th className="sticky top-0 bg-slate-900/95 px-4 py-3 font-medium">Entity</th>
                    <th className="sticky top-0 bg-slate-900/95 px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRows.map((row) => (
                    <tr key={row.freelancer.id} className="hover:bg-slate-900/45">
                      <td className="px-4 py-3 align-top">
                        <Link to={`/freelancers/${row.freelancer.id}`} className="font-medium text-white hover:text-brand-300">
                          {row.freelancer.freelancerName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top"><StatusBadge value={row.freelancer.freelancerStatus} /></td>
                      <td className="px-4 py-3 align-top text-slate-300">{row.owner || '—'}</td>
                      <td className="px-4 py-3 align-top text-slate-300">{row.projectCount}</td>
                      <td className="px-4 py-3 align-top text-slate-300">{row.nextEndDate ? formatDate(row.nextEndDate) : '—'}</td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        <div className="max-w-[280px] break-all">{row.freelancer.personalEmail || '—'}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-400">{row.entity}</td>
                      <td className="px-4 py-3 align-top">
                        <button
                          className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
                          onClick={() => {
                            if (window.confirm(`Remove ${row.freelancer.freelancerName} and their related allocations?`)) {
                              removeFreelancer(row.freelancer.id)
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
        title="Add freelancer"
        description="Create a freelancer manually without taking up permanent screen space."
        onClose={() => setIsModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Freelancer name" value={form.freelancerName} onChange={(value) => setForm((current) => ({ ...current, freelancerName: value }))} required />
          <Input label="Personal email" type="email" value={form.personalEmail} onChange={(value) => setForm((current) => ({ ...current, personalEmail: value }))} required />
          <Input label="Phone number" value={form.phoneNumber} onChange={(value) => setForm((current) => ({ ...current, phoneNumber: value }))} />
          <Input label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Status</span>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={form.freelancerStatus}
              onChange={(event) => setForm((current) => ({ ...current, freelancerStatus: event.target.value as FreelancerStatus }))}
            >
              {['Active', 'Ending soon', 'Open follow-up', 'Inactive'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.registrationNumber} onChange={(event) => setForm((current) => ({ ...current, registrationNumber: event.target.checked }))} />
              Registration number received
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.questionFlag} onChange={(event) => setForm((current) => ({ ...current, questionFlag: event.target.checked }))} />
              Question flag
            </label>
          </div>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Comments</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={form.comments}
              onChange={(event) => setForm((current) => ({ ...current, comments: event.target.value }))}
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {message ? <p className="text-sm text-slate-400">{message}</p> : <span />}
            <button className="rounded-xl border border-brand-400/30 bg-brand-500/20 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500/30" type="submit">
              Add freelancer
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function getSortValue(row: FreelancerRow, key: SortKey) {
  switch (key) {
    case 'freelancerName':
      return row.freelancer.freelancerName.toLowerCase()
    case 'freelancerStatus':
      return row.freelancer.freelancerStatus.toLowerCase()
    case 'owner':
      return row.owner.toLowerCase()
    case 'projectCount':
      return row.projectCount
    case 'nextEndDate':
      return row.nextEndDate || '9999-12-31'
    case 'personalEmail':
      return row.freelancer.personalEmail.toLowerCase()
  }
}

function SortableHeader({ label, active, direction, onClick }: { label: string; active: boolean; direction: SortDirection; onClick: () => void }) {
  return (
    <th className="sticky top-0 bg-slate-900/95 px-4 py-3 font-medium">
      <button className="inline-flex items-center gap-2 text-left transition hover:text-white" onClick={onClick} type="button">
        <span>{label}</span>
        <span className={active ? 'text-brand-300' : 'text-slate-600'}>{active ? (direction === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  )
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1 block">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
