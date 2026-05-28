import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { WorldMapPanel } from '../components/WorldMapPanel'
import { useTrackerData } from '../hooks/useTrackerData'
import { buildCountryCounts } from '../lib/geo'
import { formatDate, formatMoney } from '../lib/format'
import type { Allocation, SupportedCurrency } from '../types'

type EnrichedAllocation = Allocation & {
  freelancer: { id: string; freelancerName: string; freelancerStatus: string }
  project: { projectName: string; entity: string }
  daysRemaining: number
}

export function DashboardPage() {
  const { dashboard, enrichedAllocations, freelancers } = useTrackerData()

  const endingSoon = enrichedAllocations
    .filter(
      (item) =>
        item.daysRemaining <= 7 &&
        item.daysRemaining >= 0 &&
        item.allocationStatus !== 'Closed',
    )
    .sort((a, b) => a.daysRemaining - b.daysRemaining)

  const countryCounts = buildCountryCounts(freelancers)
  const monthlyCosts = buildMonthlyCostForecast(enrichedAllocations as EnrichedAllocation[])
  const maxMonthlyNominal = Math.max(...monthlyCosts.map((item) => item.nominalTotal), 1)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active freelancers"
          value={dashboard.activeFreelancers}
          hint="Currently in play across all entities."
          tone="brand"
          icon={<Icon name="users" className="h-5 w-5" />}
        />
        <StatCard
          label="Ending in 3 days"
          value={dashboard.endingIn3Days}
          hint="Needs a renewal or closeout decision."
          tone="amber"
          icon={<Icon name="sparkles" className="h-5 w-5" />}
        />
        <StatCard
          label="Ending in 1 day"
          value={dashboard.endingIn1Day}
          hint="Immediate action window."
          tone="rose"
          icon={<Icon name="bell" className="h-5 w-5" />}
        />
        <StatCard
          label="Open follow-up"
          value={dashboard.openFollowUps}
          hint="Still unresolved allocations."
          tone="violet"
          icon={<Icon name="settings" className="h-5 w-5" />}
        />
      </div>

      <Panel
        title="Ending soon"
        subtitle="Primary operational view: all allocations expiring in the next 7 days, sorted by urgency."
      >
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/85">
          <div className="max-h-[560px] overflow-auto">
            <table className="min-w-[900px] divide-y divide-stone-200 text-sm">
              <thead className="sticky top-0 z-10 bg-[#f8f3ea]/95 text-left text-stone-600 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Freelancer</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">End date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {endingSoon.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fbf7ef]">
                    <td className="px-4 py-3 align-top font-medium text-stone-900">
                      {item.freelancer.freelancerName}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700">
                      {item.project.projectName}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700">
                      {item.project.entity}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700">
                      {item.ownerManagerName || '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700">
                      {item.roleWithinProject || '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700">
                      {formatDate(item.contractEndDate)} ({item.daysRemaining}d)
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge value={item.freelancer.freelancerStatus} />
                    </td>
                  </tr>
                ))}
                {!endingSoon.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-stone-500"
                    >
                      Nothing is ending in the next 7 days.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
        <WorldMapPanel countries={countryCounts} compact />

        <Panel
          title="Monthly freelancer costs"
          subtitle="Estimated delivery spend by month from current allocations. Costs stay in their native currencies."
        >
          <div className="space-y-4">
            {monthlyCosts.map((month) => (
              <div
                key={month.key}
                className="rounded-[24px] border border-stone-200 bg-white/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-stone-900">{month.label}</div>
                    <div className="mt-1 text-xs text-stone-500">
                      {month.activeFreelancers} active freelancer
                      {month.activeFreelancers === 1 ? '' : 's'} contributing
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {month.currencyTotals.EUR > 0 ? (
                      <CurrencyChip currency="EUR" amount={month.currencyTotals.EUR} />
                    ) : null}
                    {month.currencyTotals.GBP > 0 ? (
                      <CurrencyChip currency="GBP" amount={month.currencyTotals.GBP} />
                    ) : null}
                    {month.currencyTotals.USD > 0 ? (
                      <CurrencyChip currency="USD" amount={month.currencyTotals.USD} />
                    ) : null}
                    {month.currencyTotals.CHF > 0 ? (
                      <CurrencyChip currency="CHF" amount={month.currencyTotals.CHF} />
                    ) : null}

                    {month.currencyTotals.EUR <= 0 &&
                    month.currencyTotals.GBP <= 0 &&
                    month.currencyTotals.USD <= 0 &&
                    month.currencyTotals.CHF <= 0 ? (
                      <span className="inline-flex rounded-full border border-stone-200 bg-[#f8f3ea] px-3 py-1 text-xs text-stone-500">
                        No spend
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#ece4d7]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 via-olive-500 to-[#95a17f]"
                    style={{
                      width: `${Math.max(6, (month.nominalTotal / maxMonthlyNominal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function CurrencyChip({
  currency,
  amount,
}: {
  currency: SupportedCurrency
  amount: number
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-[#f8f3ea] px-3 py-1 text-xs text-stone-700">
      <Icon name="chart" className="h-3.5 w-3.5 text-brand-600" />
      {formatMoney(Math.round(amount), currency)}
    </span>
  )
}

function buildMonthlyCostForecast(allocations: EnrichedAllocation[]) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    monthStart.setMonth(monthStart.getMonth() + index)

    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setDate(0)
    monthEnd.setHours(23, 59, 59, 999)

    return {
      key: `${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`,
      label: monthStart.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      }),
      monthStart,
      monthEnd,
      currencyTotals: { EUR: 0, GBP: 0, USD: 0, CHF: 0 } as Record<
        SupportedCurrency,
        number
      >,
      freelancerIds: new Set<string>(),
    }
  })

  allocations
    .filter((allocation) => allocation.allocationStatus !== 'Closed')
    .forEach((allocation) => {
      const allocationStart = new Date(allocation.contractStartDate)
      const allocationEnd = new Date(allocation.contractEndDate)

      allocationStart.setHours(0, 0, 0, 0)
      allocationEnd.setHours(23, 59, 59, 999)

      const totalCalendarDays = inclusiveDayCount(allocationStart, allocationEnd)
      if (
        totalCalendarDays <= 0 ||
        allocation.numberOfDays <= 0 ||
        allocation.dailyRate <= 0
      ) {
        return
      }

      months.forEach((month) => {
        const overlapStart =
          allocationStart > month.monthStart ? allocationStart : month.monthStart
        const overlapEnd =
          allocationEnd < month.monthEnd ? allocationEnd : month.monthEnd

        if (overlapStart > overlapEnd) return

        const overlapDays = inclusiveDayCount(overlapStart, overlapEnd)
        if (overlapDays <= 0) return

        const estimatedWorkDays =
          (allocation.numberOfDays * overlapDays) / totalCalendarDays

        month.currencyTotals[allocation.dailyRateCurrency] +=
          estimatedWorkDays * allocation.dailyRate
        month.freelancerIds.add(allocation.freelancer.id)
      })
    })

  return months.map((month) => ({
    key: month.key,
    label: month.label,
    currencyTotals: month.currencyTotals,
    activeFreelancers: month.freelancerIds.size,
    nominalTotal:
      month.currencyTotals.EUR +
      month.currencyTotals.GBP +
      month.currencyTotals.USD +
      month.currencyTotals.CHF,
  }))
}

function inclusiveDayCount(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}
