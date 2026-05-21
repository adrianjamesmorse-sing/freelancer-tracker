import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatMoney } from '../lib/format'

type Currency = 'EUR' | 'GBP'

type FinancialRow = {
  key: string
  label: string
  currencyTotals: Record<Currency, number>
  activeFreelancers: number
  nominalTotal: number
}

export function FinancialsPage() {
  const { enrichedAllocations, projects, freelancers } = useTrackerData()
  const monthOptions = useMemo(() => buildMonthOptions(), [])
  const yearOptions = useMemo(() => buildYearOptions(enrichedAllocations.map((item) => item.contractStartDate), enrichedAllocations.map((item) => item.contractEndDate)), [enrichedAllocations])
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(today.getMonth() + 1)

  const summary = useMemo(() => buildFinancialSummary(enrichedAllocations, selectedYear, selectedMonth), [enrichedAllocations, selectedYear, selectedMonth])
  const projectRows = useMemo(() => buildProjectRows(enrichedAllocations, projects, selectedYear, selectedMonth), [enrichedAllocations, projects, selectedYear, selectedMonth])
  const freelancerRows = useMemo(() => buildFreelancerRows(enrichedAllocations, freelancers, selectedYear, selectedMonth), [enrichedAllocations, freelancers, selectedYear, selectedMonth])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estimated EUR spend" value={formatMoney(Math.round(summary.currencyTotals.EUR), 'EUR')} hint="Filtered to the selected period." tone="brand" icon={<Icon name="coins" className="h-5 w-5" />} />
        <StatCard label="Estimated GBP spend" value={formatMoney(Math.round(summary.currencyTotals.GBP), 'GBP')} hint="Native currency totals without FX conversion." tone="olive" icon={<Icon name="chart" className="h-5 w-5" />} />
        <StatCard label="Active freelancers" value={summary.activeFreelancers} hint="Unique freelancers contributing in the period." tone="sand" icon={<Icon name="users" className="h-5 w-5" />} />
        <StatCard label="Active projects" value={summary.activeProjects} hint="Projects carrying spend in the period." tone="amber" icon={<Icon name="folder" className="h-5 w-5" />} />
      </div>

      <Panel title="Financial filters" subtitle="Filter rollups by month and year for finance review.">
        <div className="grid gap-4 md:grid-cols-[240px_240px_auto]">
          <label className="block text-sm text-stone-700">
            <span className="mb-2 block font-medium">Year</span>
            <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm">
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="block text-sm text-stone-700">
            <span className="mb-2 block font-medium">Month</span>
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm">
              <option value="all">All months</option>
              {monthOptions.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
          </label>
          <div className="flex items-end text-sm text-stone-600">Showing estimated cost contribution from current active and extended allocations.</div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Project cost rollup" subtitle="Highest-cost projects in the selected period.">
          <FinancialTable rows={projectRows} emptyLabel="No project costs in this period." />
        </Panel>
        <Panel title="Freelancer cost rollup" subtitle="Highest-cost freelancers in the selected period.">
          <FinancialTable rows={freelancerRows} emptyLabel="No freelancer costs in this period." />
        </Panel>
      </div>
    </div>
  )
}

function FinancialTable({ rows, emptyLabel }: { rows: FinancialRow[]; emptyLabel: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/85">
      <div className="max-h-[560px] overflow-auto">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="sticky top-0 z-10 bg-[#f8f3ea]/95 text-left text-stone-600 backdrop-blur">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">EUR</th>
              <th className="px-4 py-3 font-medium">GBP</th>
              <th className="px-4 py-3 font-medium">Active freelancers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-[#fbf7ef]">
                <td className="px-4 py-3 font-medium text-stone-900">{row.label}</td>
                <td className="px-4 py-3 text-stone-700">{row.currencyTotals.EUR ? formatMoney(Math.round(row.currencyTotals.EUR), 'EUR') : '—'}</td>
                <td className="px-4 py-3 text-stone-700">{row.currencyTotals.GBP ? formatMoney(Math.round(row.currencyTotals.GBP), 'GBP') : '—'}</td>
                <td className="px-4 py-3 text-stone-700">{row.activeFreelancers}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-500">{emptyLabel}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function buildFinancialSummary(allocations: any[], year: number, month: number | 'all') {
  const filtered = allocationsWithSpend(allocations, year, month)
  const freelancerIds = new Set(filtered.map((item) => item.freelancerId))
  const projectIds = new Set(filtered.map((item) => item.projectId))
  return {
    currencyTotals: filtered.reduce((acc, item) => {
      acc[item.dailyRateCurrency] += item.cost
      return acc
    }, { EUR: 0, GBP: 0 } as Record<Currency, number>),
    activeFreelancers: freelancerIds.size,
    activeProjects: projectIds.size,
  }
}

function buildProjectRows(allocations: any[], projects: any[], year: number, month: number | 'all'): FinancialRow[] {
  const projectMap = new Map(projects.map((project) => [project.id, project]))
  const grouped = new Map<string, FinancialRow>()
  const freelancerSets = new Map<string, Set<string>>()
  allocationsWithSpend(allocations, year, month).forEach((item) => {
    const project = projectMap.get(item.projectId)
    if (!project) return
    if (!grouped.has(project.id)) grouped.set(project.id, { key: project.id, label: project.projectName, currencyTotals: { EUR: 0, GBP: 0 }, activeFreelancers: 0, nominalTotal: 0 })
    if (!freelancerSets.has(project.id)) freelancerSets.set(project.id, new Set<string>())
    const row = grouped.get(project.id)!
    row.currencyTotals[item.dailyRateCurrency as Currency] += item.cost
    row.nominalTotal += item.cost
    freelancerSets.get(project.id)!.add(item.freelancerId)
  })
  grouped.forEach((row, projectId) => {
    row.activeFreelancers = freelancerSets.get(projectId)?.size ?? 0
  })
  return Array.from(grouped.values()).sort((a, b) => b.nominalTotal - a.nominalTotal)
}

function buildFreelancerRows(allocations: any[], freelancers: any[], year: number, month: number | 'all'): FinancialRow[] {
  const freelancerMap = new Map(freelancers.map((freelancer) => [freelancer.id, freelancer]))
  const grouped = new Map<string, FinancialRow>()
  allocationsWithSpend(allocations, year, month).forEach((item) => {
    const freelancer = freelancerMap.get(item.freelancerId)
    if (!freelancer) return
    if (!grouped.has(freelancer.id)) grouped.set(freelancer.id, { key: freelancer.id, label: freelancer.freelancerName, currencyTotals: { EUR: 0, GBP: 0 }, activeFreelancers: 1, nominalTotal: 0 })
    const row = grouped.get(freelancer.id)!
    row.currencyTotals[item.dailyRateCurrency as Currency] += item.cost
    row.nominalTotal += item.cost
  })
  return Array.from(grouped.values()).sort((a, b) => b.nominalTotal - a.nominalTotal)
}

function allocationsWithSpend(allocations: any[], year: number, month: number | 'all') {
  const start = new Date(year, month === 'all' ? 0 : month - 1, 1)
  const end = month === 'all' ? new Date(year, 11, 31, 23, 59, 59, 999) : new Date(year, month, 0, 23, 59, 59, 999)
  return allocations
    .filter((allocation) => allocation.allocationStatus !== 'Closed')
    .map((allocation) => ({ ...allocation, cost: estimateCostInRange(allocation, start, end) }))
    .filter((allocation) => allocation.cost > 0)
}

function estimateCostInRange(allocation: any, start: Date, end: Date) {
  const allocationStart = new Date(allocation.contractStartDate)
  const allocationEnd = new Date(allocation.contractEndDate)
  allocationStart.setHours(0, 0, 0, 0)
  allocationEnd.setHours(23, 59, 59, 999)
  const overlapStart = allocationStart > start ? allocationStart : start
  const overlapEnd = allocationEnd < end ? allocationEnd : end
  if (overlapStart > overlapEnd || allocation.numberOfDays <= 0 || allocation.dailyRate <= 0) return 0
  const totalCalendarDays = inclusiveDayCount(allocationStart, allocationEnd)
  if (totalCalendarDays <= 0) return 0
  const overlapDays = inclusiveDayCount(overlapStart, overlapEnd)
  return (allocation.numberOfDays * overlapDays / totalCalendarDays) * allocation.dailyRate
}

function inclusiveDayCount(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function buildMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2026, index, 1).toLocaleDateString('en-GB', { month: 'long' }) }))
}

function buildYearOptions(starts: string[], ends: string[]) {
  const years = new Set<number>()
  ;[...starts, ...ends].forEach((value) => { const date = new Date(value); if (!Number.isNaN(date.getTime())) years.add(date.getFullYear()) })
  years.add(new Date().getFullYear())
  return Array.from(years).sort((a, b) => b - a)
}
