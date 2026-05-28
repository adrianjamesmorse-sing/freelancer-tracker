import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import {
  REQUEST_STAGES,
  deleteRequest,
  loadFreelancerRequests,
  moveRequestBackward,
  moveRequestForward,
  saveFreelancerRequests,
  type FreelancerRequestRecord,
  type RequestStage,
} from '../lib/freelancerRequests'
import { formatDate, formatMoney } from '../lib/format'

export function FreelancerOnboardingPage() {
  const [requests, setRequests] = useState<FreelancerRequestRecord[]>([])

  useEffect(() => {
    setRequests(loadFreelancerRequests())
  }, [])

  const grouped = useMemo(
    () =>
      REQUEST_STAGES.map((stage) => ({
        stage,
        items: requests.filter((request) => request.stage === stage),
      })),
    [requests],
  )

  const setAndPersist = (next: FreelancerRequestRecord[]) => {
    setRequests(next)
    saveFreelancerRequests(next)
  }

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.freelancerStatus === 'Pending').length,
      complete: requests.filter((request) => request.freelancerStatus === 'Complete').length,
    }),
    [requests],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
            Freelancer Onboarding
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-stone-600">
            Track freelancer requests through the onboarding funnel from new submission to
            complete setup.
          </p>
        </div>

        <Link
          to="/freelancers/request"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Request Freelancer
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total requests" value={String(counts.total)} />
        <SummaryCard label="Pending" value={String(counts.pending)} />
        <SummaryCard label="Complete" value={String(counts.complete)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3 2xl:grid-cols-6">
        {grouped.map(({ stage, items }) => (
          <StageColumn
            key={stage}
            stage={stage}
            items={items}
            onBack={(id) => setAndPersist(moveRequestBackward(requests, id))}
            onForward={(id) => setAndPersist(moveRequestForward(requests, id))}
            onDelete={(id) => setAndPersist(deleteRequest(requests, id))}
          />
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/85 p-5 shadow-panel">
      <div className="text-sm text-stone-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{value}</div>
    </div>
  )
}

function StageColumn({
  stage,
  items,
  onBack,
  onForward,
  onDelete,
}: {
  stage: RequestStage
  items: FreelancerRequestRecord[]
  onBack: (id: string) => void
  onForward: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Panel
      title={stage}
      subtitle={`${items.length} request${items.length === 1 ? '' : 's'}`}
    >
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-500">
            No requests in this stage.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-stone-200 bg-white/90 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-stone-900">{item.freelancerName}</div>
                  <div className="mt-1 text-sm text-stone-600">{item.projectName}</div>
                </div>
                <StatusBadge value={item.freelancerStatus} />
              </div>

              <div className="mt-3 space-y-1 text-xs text-stone-500">
                <div>Submitted {formatDate(item.submittedAt)}</div>
                <div>
                  {item.contractStartDate} → {item.contractEndDate}
                </div>
                <div>
                  {item.roleWithinProject || 'No role set'} ·{' '}
                  {formatMoney(item.dailyRate, item.dailyRateCurrency)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {stage !== 'New' ? (
                  <button
                    type="button"
                    onClick={() => onBack(item.id)}
                    className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Back
                  </button>
                ) : null}

                {stage !== 'Complete' ? (
                  <button
                    type="button"
                    onClick={() => onForward(item.id)}
                    className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
                  >
                    Move forward
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}
