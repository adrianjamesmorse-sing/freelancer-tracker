import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Modal } from '../components/Modal'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import { COUNTRY_OPTIONS } from '../lib/countries'
import { formatDate } from '../lib/format'
import type { Freelancer, FreelancerStatus, NewFreelancerInput } from '../types'

type SortKey = 'freelancerName' | 'freelancerStatus' | 'owner' | 'projectCount' | 'nextEndDate' | 'personalEmail' | 'country'
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
  country: '',
  freelancerStatus: 'Active',
  registrationNumber: false,
  questionFlag: false,
  comments: '',
}

export function FreelancersPage() {
  const { freelancers, getAllocationsForFreelancer, getProjectById, addFreelancer, updateFreelancer, removeFreelancer } = useTrackerData()
  const { roles, user } = useAuth()
  const isEditor = roles.includes('editor') || roles.includes('admin')
  const isViewerOnly = !isEditor && roles.includes('viewer')
  const [form, setForm] = useState<NewFreelancerInput>(initialForm)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFreelancer, setEditingFreelancer] = useState<Freelancer | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | FreelancerStatus>('All')
  const [sortKey, setSortKey] = useState<SortKey>('freelancerName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isSaving, setIsSaving] = useState(false)

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

  // If the current user is a viewer-only role, filter to freelancers they manage/own.
  const visibleRows = useMemo(() => {
    if (!isViewerOnly || !user) return rows
    return rows.filter((row) => {
      const allocations = getAllocationsForFreelancer(row.freelancer.id)
      return allocations.some((a) => a.ownerManagerEmail === user.email) || row.freelancer.personalEmail === user.email
    })
  }, [rows, isViewerOnly, user, getAllocationsForFreelancer])

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLowerCase()
    const filtered = rows.filter((row) => {
      const matchesSearch = !searchValue || [
        row.freelancer.freelancerName,
        row.freelancer.personalEmail,
        row.freelancer.country,
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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    const result = editingFreelancer
      ? await updateFreelancer(editingFreelancer.id, form)
      : await addFreelancer(form)
    setMessage(result.message)
    setIsSaving(false)
    if (result.success) {
      setForm(initialForm)
      setEditingFreelancer(null)
      setIsModalOpen(false)
    }
  }

  const openCreateModal = () => {
    setMessage('')
    setEditingFreelancer(null)
    setForm(initialForm)
    setIsModalOpen(true)
  }

  const openEditModal = (freelancer: Freelancer) => {
    setMessage('')
    setEditingFreelancer(freelancer)
    setForm({
      freelancerName: freelancer.freelancerName,
      personalEmail: freelancer.personalEmail,
      phoneNumber: freelancer.phoneNumber,
      address: freelancer.address,
      country: freelancer.country,
      freelancerStatus: freelancer.freelancerStatus,
      registrationNumber: freelancer.registrationNumber,
      questionFlag: freelancer.questionFlag,
      comments: freelancer.comments,
    })
    setIsModalOpen(true)
  }

  const handleRemove = async (freelancer: Freelancer) => {
    if (!window.confirm(`Remove ${freelancer.freelancerName} and their related allocations?`)) return
    try {
      await removeFreelancer(freelancer.id)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove freelancer.')
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
          isEditor ? (
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-[#efe7da] px-4 py-2 text-sm font-medium text-stone-800 hover:bg-[#e6dccb]"
              onClick={openCreateModal}
              type="button"
            >
              <span aria-hidden="true">＋</span>
              <span>Add freelancer</span>
            </button>
          ) : isViewerOnly ? (
            <Link to="/request-freelancer" className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50">Request freelancer</Link>
          ) : null
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 sm:max-w-sm"
                placeholder="Search freelancer, email, country, owner, entity..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 sm:w-56"
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
            <div className="text-sm text-stone-500">{filteredRows.length} freelancers</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/85">
            <div className="max-h-[68vh] overflow-auto">
              <table className="min-w-[1180px] divide-y divide-stone-200 text-sm">
                <thead className="sticky top-0 z-10 bg-[#f8f3ea]/95 backdrop-blur">
                  <tr className="text-left text-stone-600">
                    <SortableHeader label="Freelancer" active={sortKey === 'freelancerName'} direction={sortDirection} onClick={() => toggleSort('freelancerName')} />
                    <SortableHeader label="Status" active={sortKey === 'freelancerStatus'} direction={sortDirection} onClick={() => toggleSort('freelancerStatus')} />
                    <SortableHeader label="Country" active={sortKey === 'country'} direction={sortDirection} onClick={() => toggleSort('country')} />
                    <SortableHeader label="Project owner" active={sortKey === 'owner'} direction={sortDirection} onClick={() => toggleSort('owner')} />
                    <SortableHeader label="Projects" active={sortKey === 'projectCount'} direction={sortDirection} onClick={() => toggleSort('projectCount')} />
                    <SortableHeader label="Next end" active={sortKey === 'nextEndDate'} direction={sortDirection} onClick={() => toggleSort('nextEndDate')} />
                    <SortableHeader label="Email" active={sortKey === 'personalEmail'} direction={sortDirection} onClick={() => toggleSort('personalEmail')} />
                    <th className="sticky top-0 bg-[#f8f3ea]/95 px-4 py-3 font-medium">Entity</th>
                    <th className="sticky top-0 bg-[#f8f3ea]/95 px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  {(isViewerOnly ? visibleRows : filteredRows).map((row) => (
                    <tr key={row.freelancer.id} className="hover:bg-[#fbf7ef]">
                      <td className="px-4 py-3 align-top">
                        <Link to={`/freelancers/${row.freelancer.id}`} className="font-medium text-stone-900 hover:text-brand-700">
                          {row.freelancer.freelancerName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top"><StatusBadge value={row.freelancer.freelancerStatus} /></td>
                      <td className="px-4 py-3 align-top text-stone-700">{row.freelancer.country || '—'}</td>
                      <td className="px-4 py-3 align-top text-stone-700">{row.owner || '—'}</td>
                      <td className="px-4 py-3 align-top text-stone-700">{row.projectCount}</td>
                      <td className="px-4 py-3 align-top text-stone-700">{row.nextEndDate ? formatDate(row.nextEndDate) : '—'}</td>
                      <td className="px-4 py-3 align-top text-stone-700">
                        <div className="max-w-[280px] break-all">{row.freelancer.personalEmail || '—'}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-stone-500">{row.entity}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          {isEditor ? (
                            <>
                              <button
                            className="rounded-lg border border-stone-300 bg-[#f8f3ea] px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-brand-400/40 hover:text-stone-900"
                            onClick={() => openEditModal(row.freelancer)}
                            type="button"
                          >
                            Edit
                          </button>
                              <button
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                                onClick={() => void handleRemove(row.freelancer)}
                                type="button"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <Link to="/request-freelancer" className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100">Request</Link>
                          )}
                        </div>
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
        title={editingFreelancer ? `Edit ${editingFreelancer.freelancerName}` : 'Add freelancer'}
        description={editingFreelancer ? 'Update the freelancer profile details.' : 'Create a freelancer manually without taking up permanent screen space.'}
        onClose={() => {
          setIsModalOpen(false)
          setEditingFreelancer(null)
          setForm(initialForm)
          setMessage('')
        }}
      >
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <Input label="Freelancer name" value={form.freelancerName} onChange={(value) => setForm((current) => ({ ...current, freelancerName: value }))} required />
          <Input label="Personal email" type="email" value={form.personalEmail} onChange={(value) => setForm((current) => ({ ...current, personalEmail: value }))} required />
          <Input label="Phone number" value={form.phoneNumber} onChange={(value) => setForm((current) => ({ ...current, phoneNumber: value }))} />
          <CountrySelect value={form.country} onChange={(value) => setForm((current) => ({ ...current, country: value }))} />
          <Input label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block">Status</span>
            <select
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900"
              value={form.freelancerStatus}
              onChange={(event) => setForm((current) => ({ ...current, freelancerStatus: event.target.value as FreelancerStatus }))}
            >
              {['Active', 'Ending soon', 'Open follow-up', 'Inactive'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm">
              <input type="checkbox" checked={form.registrationNumber} onChange={(event) => setForm((current) => ({ ...current, registrationNumber: event.target.checked }))} />
              Registration number received
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm">
              <input type="checkbox" checked={form.questionFlag} onChange={(event) => setForm((current) => ({ ...current, questionFlag: event.target.checked }))} />
              Question flag
            </label>
          </div>
          <label className="block text-sm text-stone-700">
            <span className="mb-1 block">Comments</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900"
              value={form.comments}
              onChange={(event) => setForm((current) => ({ ...current, comments: event.target.value }))}
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {message ? <p className="text-sm text-stone-500">{message}</p> : <span />}
            <button className="rounded-xl border border-stone-300 bg-[#efe7da] px-4 py-2 text-sm font-medium text-stone-800 hover:bg-[#e6dccb] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : editingFreelancer ? 'Save changes' : 'Add freelancer'}
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
    case 'country':
      return row.freelancer.country.toLowerCase()
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

function CountrySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="mb-1 block">Country</span>
      <select
        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select a country</option>
        {COUNTRY_OPTIONS.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
    </label>
  )
}