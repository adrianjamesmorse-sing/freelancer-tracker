import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../hooks/useTrackerData'
import { fetchProjectStaff } from '../lib/api'
import {
  feedbackGuidelines,
  feedbackTemplates,
  getFeedbackTemplate,
  scoreLabels,
  type Competency,
  type FeedbackTemplate,
  type ReviewDirection,
  type RoleKey,
} from '../lib/feedbackTemplates'
import { formatDate } from '../lib/format'
import type { Project, ProjectStaffAssignment } from '../types'

type AssignmentStatus = 'not started' | 'in progress' | 'submitted' | 'overdue' | 'not applicable'
type FeedbackView = 'project-browser' | 'dashboard' | 'assignments' | 'review' | 'calibration' | 'templates'

interface FeedbackPerson {
  id: string
  name: string
  email: string
  role: RoleKey
  source: 'Entra' | 'Project owner' | 'Seeded'
  office: string
  practice: string
  jobTitle: string
}

interface ReviewAssignment {
  id: string
  projectId: string
  projectName: string
  projectCode: string
  reviewer: FeedbackPerson
  reviewee: FeedbackPerson
  direction: ReviewDirection
  dueDate: string
  status: AssignmentStatus
  template: FeedbackTemplate
  scores: Record<string, number>
  comments: Record<string, string>
  finalRating: number
  qualityFlags: string[]
  calibrationNotes: string
}

interface FeedbackCycle {
  project: Project
  projectCode: string
  starts: string[]
  ends: string[]
  closeDate: string
  durationDays: number
  mandatory: boolean
  dueDate: string
  status: 'Ready to launch' | 'Open' | 'Overdue' | 'Not mandatory'
}

const roleRank: Record<RoleKey, number> = {
  Analyst: 1,
  Consultant: 2,
  'Senior Consultant': 3,
  Manager: 4,
  'Senior Manager': 5,
  'Associate Director': 6,
  Director: 7,
  Partner: 8,
  'Expert Partner': 9,
}

const projectTypeScope = ['DD', 'VDD', 'Transformation', 'Proposal', 'Internal']

const seededPeopleByProject: Record<string, FeedbackPerson[]> = {
  'project-1': [
    makePerson('p1-analyst', 'Maya Singh', 'Analyst', 'Paris', 'Transformation'),
    makePerson('p1-consultant', 'Louis Perrin', 'Consultant', 'Paris', 'DD'),
    makePerson('p1-sm', 'Claire Dubois', 'Senior Manager', 'Paris', 'Transformation'),
    makePerson('p1-director', 'Julien Moreau', 'Director', 'Paris', 'Transformation'),
  ],
  'project-2': [
    makePerson('p2-consultant', 'Oliver Reed', 'Consultant', 'London', 'AI'),
    makePerson('p2-sc', 'Priya Nair', 'Senior Consultant', 'London', 'AI'),
    makePerson('p2-manager', 'Hannah Clarke', 'Manager', 'London', 'Transformation'),
    makePerson('p2-director', 'Rebecca Miles', 'Director', 'London', 'AI'),
  ],
  'project-3': [
    makePerson('p3-analyst', 'Jonas Weber', 'Analyst', 'Berlin', 'VDD'),
    makePerson('p3-sc', 'Elena Rossi', 'Senior Consultant', 'Berlin', 'Product'),
    makePerson('p3-manager', 'Markus Klein', 'Manager', 'Berlin', 'VDD'),
    makePerson('p3-ad', 'Klara Vogel', 'Associate Director', 'Berlin', 'Product'),
  ],
}

export function FeedbackManagerPage({ view = 'dashboard' }: { view?: FeedbackView }) {
  const { projects, getAllocationsForProject } = useTrackerData()
  const { idToken, getFreshIdToken } = useAuth()
  const navigate = useNavigate()
  const { assignmentId } = useParams()
  const [search, setSearch] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id ?? null)
  const [internalStaff, setInternalStaff] = useState<ProjectStaffAssignment[]>([])
  const [peopleMessage, setPeopleMessage] = useState('')
  const [isLoadingPeople, setIsLoadingPeople] = useState(false)
  const [draftScores, setDraftScores] = useState<Record<string, number>>({})
  const [draftComments, setDraftComments] = useState<Record<string, string>>({})
  const [finalRating, setFinalRating] = useState(3)
  const [overallStrengths, setOverallStrengths] = useState(
    'Consistently created clarity for the team and turned ambiguous asks into useful outputs.',
  )
  const [developmentAreas, setDevelopmentAreas] = useState(
    'Keep tightening recommendations earlier so senior discussions can move faster.',
  )

  const cycles = useMemo(
    () =>
      projects.map((project, index) => {
        const allocations = getAllocationsForProject(project.id)
        const starts = allocations.map((item) => item.contractStartDate).sort()
        const ends = allocations.map((item) => item.contractEndDate).sort()
        const startDate = project.startDate ?? starts[0] ?? '2026-05-01'
        const closeDate = project.endDate ?? ends[ends.length - 1] ?? '2026-06-10'
        const durationDays = daysBetween(startDate, closeDate)
        const dueDate = addDays(closeDate, 7)
        const mandatory = durationDays > 21
        const overdue = mandatory && new Date(dueDate) < new Date('2026-06-16')

        return {
          project,
          projectCode: `VX-${String(index + 214).padStart(4, '0')}`,
          starts,
          ends,
          closeDate,
          durationDays,
          mandatory,
          dueDate,
          status: !mandatory ? 'Not mandatory' : overdue ? 'Overdue' : index === 0 ? 'Open' : 'Ready to launch',
        } satisfies FeedbackCycle
      }),
    [projects, getAllocationsForProject],
  )

  const filteredCycles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return cycles.filter((cycle) => {
      const haystack = [
        cycle.project.projectName,
        cycle.project.projectManagerName,
        cycle.project.projectManagerEmail,
        cycle.project.entity,
        cycle.projectCode,
      ]
        .join(' ')
        .toLowerCase()
      return !query || haystack.includes(query)
    })
  }, [cycles, search])

  const selectedCycle = cycles.find((cycle) => cycle.project.id === selectedProjectId) ?? cycles[0] ?? null

  useEffect(() => {
    if (!selectedCycle || !idToken) {
      setInternalStaff([])
      return
    }

    let cancelled = false

    const loadProjectStaff = async () => {
      setIsLoadingPeople(true)
      setPeopleMessage('')
      try {
        const freshToken = await getFreshIdToken()
        if (!freshToken) throw new Error('Please sign in again to load Entra staff.')
        const rows = await fetchProjectStaff(selectedCycle.project.id, { idToken: freshToken })
        if (!cancelled) setInternalStaff(rows)
      } catch (err) {
        if (!cancelled) {
          setInternalStaff([])
          const message = err instanceof Error ? err.message : 'Failed to load Entra staff.'
          setPeopleMessage(
            message.includes('"exp" claim') || message.includes('Microsoft sign-in token')
              ? 'Microsoft session expired. Seeded project staff are shown until Entra can be refreshed.'
              : `${message} Seeded project staff are shown for review design.`,
          )
        }
      } finally {
        if (!cancelled) setIsLoadingPeople(false)
      }
    }

    void loadProjectStaff()

    return () => {
      cancelled = true
    }
  }, [selectedCycle?.project.id, idToken, getFreshIdToken])

  const people = useMemo(
    () => (selectedCycle ? buildProjectPeople(selectedCycle.project, internalStaff) : []),
    [selectedCycle, internalStaff],
  )

  const assignments = useMemo(
    () => (selectedCycle ? generateAssignments(selectedCycle, people) : []),
    [selectedCycle, people],
  )

  const selectedAssignment = assignments.find((assignment) => assignment.id === assignmentId) ?? assignments[0] ?? null

  useEffect(() => {
    if (!selectedAssignment) return
    setDraftScores(selectedAssignment.scores)
    setDraftComments(selectedAssignment.comments)
    setFinalRating(selectedAssignment.finalRating)
  }, [selectedAssignment?.id])

  useEffect(() => {
    if (view !== 'review' || !selectedAssignment || assignmentId === selectedAssignment.id) return
    navigate(`/feedback/reviews/${selectedAssignment.id}`, { replace: true })
  }, [assignmentId, navigate, selectedAssignment, view])

  const submittedCount = assignments.filter((assignment) => assignment.status === 'submitted').length
  const overdueCount = assignments.filter((assignment) => assignment.status === 'overdue').length
  const completion = assignments.length ? Math.round((submittedCount / assignments.length) * 100) : 0
  const weakCommentFlags = assignments.reduce((total, assignment) => total + assignment.qualityFlags.length, 0)
  const averageScore = average(Object.values(draftScores))
  const missingRequired = selectedAssignment
    ? selectedAssignment.template.competencies.filter((competency) =>
        requiresComment(competency, draftScores[competency.id]) && !draftComments[competency.id]?.trim(),
      )
    : []
  const pageTitle: Record<FeedbackView, string> = {
    'project-browser': 'Feedback Project Browser',
    dashboard: 'Feedback Dashboard',
    assignments: 'Review Assignments',
    review: 'Review Form',
    calibration: 'HR Calibration',
    templates: 'Feedback Templates',
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">{pageTitle[view]}</h2>
          <div className="page-description">
            End-of-project feedback cycles with automatic reviewer pairing, role-based templates,
            quality checks, and HR calibration inputs.
          </div>
        </div>
      </div>

      {view === 'dashboard' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Feedback cycles"
            value={cycles.length}
            hint="Launched from project closure or a project record."
            tone="brand"
            icon={<Icon name="folder" className="h-5 w-5" />}
          />
          <StatCard
            label="Completion"
            value={`${completion}%`}
            hint="Submitted assignments in the selected cycle."
            tone="olive"
            icon={<Icon name="check" className="h-5 w-5" />}
          />
          <StatCard
            label="Overdue reviews"
            value={overdueCount}
            hint="Target completion is within 7 days of closure."
            tone="amber"
            icon={<Icon name="bell" className="h-5 w-5" />}
          />
          <StatCard
            label="Quality flags"
            value={weakCommentFlags}
            hint="Vague, unsupported, or missing-rationale signals."
            tone="rose"
            icon={<Icon name="sparkles" className="h-5 w-5" />}
          />
        </div>
      ) : null}

      {['assignments', 'review', 'calibration'].includes(view) ? (
        <ProjectCycleSelector
          cycles={cycles}
          selectedCycle={selectedCycle}
          onSelectProject={setSelectedProjectId}
        />
      ) : null}

      {view === 'project-browser' ? (
        <ProjectBrowserView
          filteredCycles={filteredCycles}
          selectedCycle={selectedCycle}
          people={people}
          assignments={assignments}
          peopleMessage={peopleMessage}
          isLoadingPeople={isLoadingPeople}
          search={search}
          onSearch={setSearch}
          onSelectProject={setSelectedProjectId}
          onReviewAssignments={() => navigate('/feedback/assignments')}
        />
      ) : null}

      {view === 'dashboard' ? (
        <DashboardView cycle={selectedCycle} assignments={assignments} />
      ) : null}

      {view === 'assignments' ? (
        <MatrixView
          people={people}
          assignments={assignments}
          onSelect={(assignment) => {
            navigate(`/feedback/reviews/${assignment.id}`)
          }}
        />
      ) : null}

      {view === 'review' && selectedAssignment ? (
        <ReviewFormView
          assignment={selectedAssignment}
          draftScores={draftScores}
          draftComments={draftComments}
          finalRating={finalRating}
          overallStrengths={overallStrengths}
          developmentAreas={developmentAreas}
          averageScore={averageScore}
          missingRequired={missingRequired}
          onScore={(id, score) => setDraftScores((current) => ({ ...current, [id]: score }))}
          onComment={(id, comment) => setDraftComments((current) => ({ ...current, [id]: comment }))}
          onFinalRating={setFinalRating}
          onStrengths={setOverallStrengths}
          onDevelopmentAreas={setDevelopmentAreas}
        />
      ) : null}

      {view === 'calibration' ? (
        <CalibrationView assignments={assignments} />
      ) : null}

      {view === 'templates' ? (
        <TemplateAdminView />
      ) : null}
    </div>
  )
}

export function FeedbackDashboardPage() {
  return <FeedbackManagerPage view="dashboard" />
}

export function FeedbackProjectBrowserPage() {
  return <FeedbackManagerPage view="project-browser" />
}

export function FeedbackAssignmentsPage() {
  return <FeedbackManagerPage view="assignments" />
}

export function FeedbackReviewPage() {
  return <FeedbackManagerPage view="review" />
}

export function FeedbackCalibrationPage() {
  return <FeedbackManagerPage view="calibration" />
}

export function FeedbackTemplatesPage() {
  return <FeedbackManagerPage view="templates" />
}

function ProjectBrowserView({
  filteredCycles,
  selectedCycle,
  people,
  assignments,
  peopleMessage,
  isLoadingPeople,
  search,
  onSearch,
  onSelectProject,
  onReviewAssignments,
}: {
  filteredCycles: FeedbackCycle[]
  selectedCycle: FeedbackCycle | null
  people: FeedbackPerson[]
  assignments: ReviewAssignment[]
  peopleMessage: string
  isLoadingPeople: boolean
  search: string
  onSearch: (value: string) => void
  onSelectProject: (projectId: string) => void
  onReviewAssignments: () => void
}) {
  return (
    <Panel
      title="Cycle launcher"
      subtitle="Admin-only project browser for creating feedback cycles, checking the >3 week rule, and reviewing generated assignments before launch."
      action={
        selectedCycle ? (
          <Link to={`/projects/${selectedCycle.project.id}`} className="btn-primary-sm">
            Open project
          </Link>
        ) : null
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.75fr)]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <input
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 lg:max-w-sm"
              placeholder="Search project, manager, office..."
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
            <div className="text-sm text-stone-500">{filteredCycles.length} projects in scope list</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/85">
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-[900px] divide-y divide-stone-200 text-sm">
                <thead className="sticky top-0 z-10 bg-[#f8f3ea]/95 text-left text-stone-600 backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Rule</th>
                    <th className="px-4 py-3 font-medium">Closure</th>
                    <th className="px-4 py-3 font-medium">Due date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  {filteredCycles.map((cycle) => (
                    <tr
                      key={cycle.project.id}
                      onClick={() => onSelectProject(cycle.project.id)}
                      className={[
                        'cursor-pointer transition hover:bg-[#fbf7ef]',
                        selectedCycle?.project.id === cycle.project.id ? 'bg-[#f5efe4]' : '',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-stone-900">{cycle.project.projectName}</div>
                        <div className="text-xs text-stone-500">{cycle.projectCode} · {cycle.project.entity}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge value={cycle.mandatory ? 'Mandatory' : 'Optional'} />
                        <div className="mt-1 text-xs text-stone-500">{cycle.durationDays} days</div>
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700">{formatDate(cycle.closeDate)}</td>
                      <td className="px-4 py-3 align-top text-stone-700">{formatDate(cycle.dueDate)}</td>
                      <td className="px-4 py-3 align-top"><CycleStatus status={cycle.status} /></td>
                      <td className="px-4 py-3 align-top text-stone-700">
                        <div>{cycle.project.projectManagerName || 'Unassigned'}</div>
                        <div className="max-w-[240px] truncate text-xs text-stone-500">{cycle.project.projectManagerEmail}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <CycleSummary
          cycle={selectedCycle}
          people={people}
          assignments={assignments}
          peopleMessage={peopleMessage}
          isLoadingPeople={isLoadingPeople}
          onReviewAssignments={onReviewAssignments}
        />
      </div>
    </Panel>
  )
}

function ProjectCycleSelector({
  cycles,
  selectedCycle,
  onSelectProject,
}: {
  cycles: FeedbackCycle[]
  selectedCycle: FeedbackCycle | null
  onSelectProject: (projectId: string) => void
}) {
  const justEndedCount = cycles.filter((cycle) => getCycleRecency(cycle) === 'Just ended').length
  const historicalCount = cycles.filter((cycle) => getCycleRecency(cycle) === 'Historical').length

  return (
    <Panel
      title="Project feedback cycle"
      subtitle="Choose the project cycle you want to work on before reviewing assignments, completing feedback, or calibrating results."
      action={
        selectedCycle ? (
          <div className="flex flex-wrap gap-2">
            <CycleRecencyBadge cycle={selectedCycle} />
            <CycleStatus status={selectedCycle.status} />
          </div>
        ) : null
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.35fr)]">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Project</span>
          <select
            value={selectedCycle?.project.id ?? ''}
            onChange={(event) => onSelectProject(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500"
          >
            {cycles.map((cycle) => (
              <option key={cycle.project.id} value={cycle.project.id}>
                {cycle.project.projectName} · {cycle.projectCode} · {getCycleRecency(cycle)} · closed {formatDate(cycle.closeDate)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Just ended" value={justEndedCount} />
          <Metric label="Historical" value={historicalCount} />
        </div>
      </div>

      {selectedCycle ? (
        <div className="mt-4 grid gap-3 text-sm text-stone-700 md:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Project code</div>
            <div className="mt-1 font-medium text-stone-900">{selectedCycle.projectCode}</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Closed</div>
            <div className="mt-1 font-medium text-stone-900">{formatDate(selectedCycle.closeDate)}</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Due</div>
            <div className="mt-1 font-medium text-stone-900">{formatDate(selectedCycle.dueDate)}</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Duration</div>
            <div className="mt-1 font-medium text-stone-900">{selectedCycle.durationDays} days</div>
          </div>
        </div>
      ) : null}
    </Panel>
  )
}

function CycleSummary({
  cycle,
  people,
  assignments,
  peopleMessage,
  isLoadingPeople,
  onReviewAssignments,
}: {
  cycle: FeedbackCycle | null
  people: FeedbackPerson[]
  assignments: ReviewAssignment[]
  peopleMessage: string
  isLoadingPeople: boolean
  onReviewAssignments: () => void
}) {
  if (!cycle) {
    return (
      <div className="rounded-[24px] border border-dashed border-stone-300 bg-white/70 px-4 py-10 text-center text-sm text-stone-500">
        Select a project to prepare a feedback cycle.
      </div>
    )
  }

  const topDown = assignments.filter((assignment) => assignment.direction === 'top-down').length
  const upward = assignments.filter((assignment) => assignment.direction === 'upward').length

  return (
    <div className="space-y-4 rounded-[24px] border border-stone-200 bg-white/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-stone-500">Selected cycle</div>
          <h3 className="mt-2 text-xl font-semibold text-stone-900">{cycle.project.projectName}</h3>
          <p className="mt-1 text-sm text-stone-600">
            Due {formatDate(cycle.dueDate)} · {cycle.mandatory ? 'Mandatory' : 'Optional'} because the project ran {cycle.durationDays} days.
          </p>
        </div>
        <CycleStatus status={cycle.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="People" value={people.length} />
        <Metric label="Top-down" value={topDown} />
        <Metric label="Upward" value={upward} />
      </div>

      {peopleMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {peopleMessage}
        </div>
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Generated from staffing and Entra role data</div>
          {isLoadingPeople ? <div className="text-xs text-stone-500">Loading Entra...</div> : null}
        </div>
        <div className="grid gap-2">
          {people.slice(0, 5).map((person) => (
            <PersonRow key={person.id} person={person} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-[#fbf7ef] p-4 text-sm text-stone-700">
        <div className="font-medium text-stone-900">Admin override guardrails</div>
        <p className="mt-1 leading-6">
          Ambiguous staffing can be overridden before launch, but invalid hierarchy combinations remain blocked.
          Partners and Expert Partners are excluded for now and can be handed off to Elevo later.
        </p>
      </div>

      <button type="button" onClick={onReviewAssignments} className="btn-primary w-full justify-center">
        Review assignment matrix
      </button>
    </div>
  )
}

function DashboardView({ cycle, assignments }: { cycle: FeedbackCycle | null; assignments: ReviewAssignment[] }) {
  const statuses: AssignmentStatus[] = ['submitted', 'in progress', 'not started', 'overdue']

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)]">
      <Panel title="Project feedback dashboard" subtitle="Open cycles, overdue items, completion heatmap, and quality signals.">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-4">
            {statuses.map((status) => (
              <Metric
                key={status}
                label={titleCase(status)}
                value={assignments.filter((assignment) => assignment.status === status).length}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-stone-900">Completion heatmap</h3>
              <span className="text-xs text-stone-500">{cycle?.projectCode}</span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  title={`${assignment.reviewer.name} → ${assignment.reviewee.name}: ${assignment.status}`}
                  className={[
                    'aspect-square rounded-lg border',
                    assignment.status === 'submitted'
                      ? 'border-emerald-200 bg-emerald-100'
                      : assignment.status === 'in progress'
                        ? 'border-amber-200 bg-amber-100'
                        : assignment.status === 'overdue'
                          ? 'border-rose-200 bg-rose-100'
                          : 'border-stone-200 bg-stone-100',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-stone-900">Process rules preserved</h3>
            <div className="mt-3 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
              {[
                'Mandatory for projects longer than 3 weeks',
                'Default due date is project close + 7 days',
                'Top-down and upward feedback supported',
                'Role templates selected from Entra-derived seniority',
                '1-2 and 4-5 scores require rationale',
                'Average score is advisory only',
              ].map((rule) => (
                <div key={rule} className="flex items-start gap-2 rounded-xl bg-[#fbf7ef] px-3 py-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-stone-200 bg-[#fbf7ef] px-3 py-2 text-sm text-stone-700">
              Applies to {projectTypeScope.join(', ')} and relevant internal project work.
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-stone-900">Spreadsheet guidance imported</h3>
            <div className="mt-3 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
              {feedbackGuidelines.slice(0, 6).map((item) => (
                <div key={`${item.section}-${item.topic}`} className="rounded-xl bg-[#fbf7ef] px-3 py-2">
                  <div className="font-medium text-stone-900">{item.topic}</div>
                  <div className="mt-1 text-xs leading-5 text-stone-600">{item.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="AI-assisted quality queue" subtitle="AI improves review quality and summarization without replacing judgement.">
        <div className="space-y-3">
          {assignments.slice(0, 6).map((assignment) => (
            <div key={assignment.id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-stone-900">{assignment.reviewee.name}</div>
                  <div className="mt-1 text-xs text-stone-500">
                    {assignment.reviewer.name} · {assignment.direction}
                  </div>
                </div>
                <AssignmentStatusBadge status={assignment.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {assignment.qualityFlags.length ? (
                  assignment.qualityFlags.map((flag) => (
                    <span key={flag} className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-900">
                      {flag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-800">
                    Specific and example-led
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function MatrixView({
  people,
  assignments,
  onSelect,
}: {
  people: FeedbackPerson[]
  assignments: ReviewAssignment[]
  onSelect: (assignment: ReviewAssignment) => void
}) {
  const reviewees = people.filter((person) => roleRank[person.role] <= roleRank.Director)
  const reviewers = people

  return (
    <Panel title="Review assignment matrix" subtitle="Rows are reviewees, columns are reviewers. Invalid combinations are blocked by hierarchy rules.">
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/90">
        <div className="max-h-[680px] overflow-auto">
          <table className="min-w-[1100px] divide-y divide-stone-200 text-sm">
            <thead className="sticky top-0 z-10 bg-[#f8f3ea]/95 text-left backdrop-blur">
              <tr>
                <th className="sticky left-0 z-20 bg-[#f8f3ea] px-4 py-3 font-medium text-stone-600">Reviewee</th>
                {reviewers.map((reviewer) => (
                  <th key={reviewer.id} className="min-w-[150px] px-3 py-3 font-medium text-stone-600">
                    <div className="truncate">{reviewer.name}</div>
                    <div className="text-xs font-normal text-stone-500">{reviewer.role}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80">
              {reviewees.map((reviewee) => (
                <tr key={reviewee.id}>
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 align-top">
                    <div className="font-medium text-stone-900">{reviewee.name}</div>
                    <div className="text-xs text-stone-500">{reviewee.role}</div>
                  </td>
                  {reviewers.map((reviewer) => {
                    const assignment = assignments.find(
                      (item) => item.reviewer.id === reviewer.id && item.reviewee.id === reviewee.id,
                    )
                    return (
                      <td key={`${reviewee.id}-${reviewer.id}`} className="px-3 py-3 align-top">
                        {assignment ? (
                          <button
                            type="button"
                            onClick={() => onSelect(assignment)}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-left transition hover:border-stone-400 hover:bg-[#fbf7ef]"
                          >
                            <AssignmentStatusBadge status={assignment.status} />
                            <div className="mt-2 text-xs text-stone-500">{assignment.direction}</div>
                          </button>
                        ) : (
                          <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-400">
                            Not applicable
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  )
}

function ReviewFormView({
  assignment,
  draftScores,
  draftComments,
  finalRating,
  overallStrengths,
  developmentAreas,
  averageScore,
  missingRequired,
  onScore,
  onComment,
  onFinalRating,
  onStrengths,
  onDevelopmentAreas,
}: {
  assignment: ReviewAssignment
  draftScores: Record<string, number>
  draftComments: Record<string, string>
  finalRating: number
  overallStrengths: string
  developmentAreas: string
  averageScore: number
  missingRequired: Competency[]
  onScore: (id: string, score: number) => void
  onComment: (id: string, comment: string) => void
  onFinalRating: (rating: number) => void
  onStrengths: (value: string) => void
  onDevelopmentAreas: (value: string) => void
}) {
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(() => {
    const firstPillar = assignment.template.competencies[0]?.pillar
    return firstPillar ? new Set([firstPillar]) : new Set()
  })
  const groups = groupBy(assignment.template.competencies, (competency) => competency.pillar)
  const groupEntries = Object.entries(groups)
  const completed = assignment.template.competencies.filter((competency) => {
    return isCompetencyComplete(competency, draftScores, draftComments)
  }).length
  const progress = Math.round((completed / assignment.template.competencies.length) * 100)

  const togglePillar = (pillar: string) => {
    setExpandedPillars((current) => {
      const next = new Set(current)
      if (next.has(pillar)) {
        next.delete(pillar)
      } else {
        next.add(pillar)
      }
      return next
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel title="Review form" subtitle="Structured role-based feedback with validation, autosave, and AI quality assistance.">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.14em] text-stone-500">{assignment.projectCode}</div>
                <h3 className="mt-1 text-xl font-semibold text-stone-900">{assignment.projectName}</h3>
                <p className="mt-1 text-sm text-stone-600">
                  {assignment.reviewer.name} reviewing {assignment.reviewee.name} · {assignment.direction}
                </p>
                <p className="mt-3 max-w-3xl rounded-2xl border border-stone-200 bg-[#fbf7ef] px-4 py-3 text-sm leading-6 text-stone-700">
                  {assignment.template.reviewerGuidance}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={assignment.reviewee.role} />
                <AssignmentStatusBadge status={assignment.status} />
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-olive-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-xs text-stone-500">{progress}% complete · Autosaved just now</div>
          </div>

          {groupEntries.map(([pillar, competencies]) => {
            const sectionCompleted = competencies.filter((competency) =>
              isCompetencyComplete(competency, draftScores, draftComments),
            ).length
            const sectionMissing = competencies.filter((competency) => {
              const score = draftScores[competency.id]
              return requiresComment(competency, score) && !draftComments[competency.id]?.trim()
            }).length
            const sectionProgress = Math.round((sectionCompleted / competencies.length) * 100)
            const expanded = expandedPillars.has(pillar)

            return (
            <section key={pillar} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <button
                type="button"
                onClick={() => togglePillar(pillar)}
                className="flex w-full flex-col gap-3 px-4 py-4 text-left transition hover:bg-[#fbf7ef] sm:flex-row sm:items-center sm:justify-between"
                aria-expanded={expanded}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon name={expanded ? 'minus' : 'plus'} className="h-4 w-4 shrink-0 text-stone-600" />
                    <h3 className="truncate text-lg font-semibold text-stone-900">{pillar}</h3>
                  </div>
                  <div className="mt-1 text-sm text-stone-500">
                    {sectionCompleted} of {competencies.length} questions complete · {sectionProgress}%
                  </div>
                </div>

                <div className="flex min-w-[220px] flex-col gap-2">
                  <div className="flex items-center justify-end gap-2">
                    {sectionMissing ? (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800">
                        {sectionMissing} required
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                        Ready
                      </span>
                    )}
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                      {sectionProgress}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-olive-700" style={{ width: `${sectionProgress}%` }} />
                  </div>
                </div>
              </button>

              {expanded ? (
                <div className="space-y-3 border-t border-stone-200 bg-[#fbf7ef]/45 p-4">
                  {competencies.map((competency) => {
                    const score = draftScores[competency.id] ?? 3
                    const comment = draftComments[competency.id] ?? ''
                    const needsComment = requiresComment(competency, score) && !comment.trim()
                    return (
                      <div key={competency.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h4 className="text-base font-semibold text-stone-900">{competency.title}</h4>
                            <p className="mt-1 text-sm leading-6 text-stone-600">{competency.definition}</p>
                          </div>
                          {competency.allowNotRelevant ? (
                            <label className="inline-flex items-center gap-2 text-sm text-stone-600">
                              <input type="checkbox" className="h-4 w-4 rounded border-stone-300" />
                              Not relevant
                            </label>
                          ) : null}
                        </div>

                        <details className="mt-4 rounded-xl border border-stone-200 bg-[#fbf7ef] px-4 py-3">
                          <summary className="cursor-pointer text-sm font-medium text-stone-800">How to score this</summary>
                          <div className="mt-3 grid gap-2 text-sm text-stone-700">
                            {([1, 2, 3, 4, 5] as const).map((value) => (
                              <div key={value}>
                                <span className="font-medium">{value} · {scoreLabels[value]}:</span> {competency.rubric[value]}
                              </div>
                            ))}
                          </div>
                        </details>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-stone-700">Score</span>
                            <span className="text-xs text-stone-500" title="3 is the expected norm. 5 is exceptional and should be rare.">
                              3 is norm · 5 is exceptional
                            </span>
                          </div>
                          <div className="grid grid-cols-5 overflow-hidden rounded-xl border border-stone-300 bg-white">
                            {([1, 2, 3, 4, 5] as const).map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => onScore(competency.id, value)}
                                className={[
                                  'min-h-12 border-r border-stone-200 px-2 py-2 text-sm font-semibold last:border-r-0',
                                  score === value ? scoreTone(value, true) : scoreTone(value, false),
                                ].join(' ')}
                              >
                                <span className="block">{value}</span>
                                <span className="block text-[11px] font-normal leading-4">{scoreLabels[value]}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="mt-4 block space-y-2">
                          <span className="text-sm font-medium text-stone-700">
                            Comment {requiresComment(competency, score) ? 'required' : 'optional'}
                          </span>
                          <textarea
                            value={comment}
                            onChange={(event) => onComment(competency.id, event.target.value)}
                            rows={4}
                            className={[
                              'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition',
                              needsComment ? 'border-rose-300' : 'border-stone-300 focus:border-stone-500',
                            ].join(' ')}
                            placeholder="Use facts, examples, and constructive observations."
                          />
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {needsComment ? (
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">
                              Rationale required for this score
                            </span>
                          ) : null}
                          {comment && commentQualityFlags(comment).map((flag) => (
                            <span key={flag} className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                              AI flag: {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </section>
            )
          })}

          <section className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-stone-900">Summary</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Overall strengths</span>
                <textarea value={overallStrengths} onChange={(event) => onStrengths(event.target.value)} rows={4} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Development areas</span>
                <textarea value={developmentAreas} onChange={(event) => onDevelopmentAreas(event.target.value)} rows={4} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm" />
              </label>
            </div>
          </section>
        </div>
      </Panel>

      <aside className="space-y-4 xl:sticky xl:top-[72px] xl:self-start">
        <Panel title="Submit readiness">
          <div className="space-y-4">
            <Metric label="Completion" value={`${progress}%`} />
            <Metric label="Current average" value={averageScore.toFixed(1)} />
            <Metric label="Required comments missing" value={missingRequired.length} />

            <div>
              <label className="text-sm font-medium text-stone-700">Final overall rating</label>
              <div className="mt-2 grid grid-cols-5 overflow-hidden rounded-xl border border-stone-300 bg-white">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => onFinalRating(rating)}
                    className={[
                      'py-2 text-sm font-semibold',
                      finalRating === rating ? 'bg-stone-900 text-white' : 'hover:bg-stone-100',
                    ].join(' ')}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                Average is advisory only and does not automatically become the final rating.
              </p>
            </div>

            <div className="rounded-2xl border border-olive-200 bg-olive-50 p-4 text-sm text-olive-950">
              <div className="font-medium">Suggested in-person feedback summary</div>
              <p className="mt-2 leading-6">
                Thank {assignment.reviewee.name.split(' ')[0]} for their contribution, anchor the
                discussion in project examples, lead with strengths, and align on one concrete
                development action for the next project.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">HR calibration notes</span>
              <textarea
                defaultValue={assignment.calibrationNotes}
                rows={4}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
              />
            </label>

            <button type="button" disabled={missingRequired.length > 0} className="btn-primary w-full justify-center">
              Submit review
            </button>
          </div>
        </Panel>
      </aside>
    </div>
  )
}

function CalibrationView({ assignments }: { assignments: ReviewAssignment[] }) {
  const scores = assignments.flatMap((assignment) => Object.values(assignment.scores))
  const distribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: scores.filter((value) => value === score).length,
  }))
  const maxCount = Math.max(...distribution.map((item) => item.count), 1)

  return (
    <Panel title="HR calibration view" subtitle="Filterable completion, distribution, outlier, and comment-quality signals for leadership review.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.8fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            {['Project', 'Office', 'Practice', 'Level', 'Reviewer'].map((filter) => (
              <select key={filter} className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700">
                <option>{filter}: All</option>
              </select>
            ))}
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-stone-900">Rating distribution</h3>
            <div className="mt-4 space-y-3">
              {distribution.map((item) => (
                <div key={item.score} className="grid grid-cols-[80px_1fr_40px] items-center gap-3 text-sm">
                  <div>{item.score} · {scoreLabels[item.score as 1 | 2 | 3 | 4 | 5]}</div>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-olive-700" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                  <div className="text-right text-stone-600">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {assignments
            .filter((assignment) => average(Object.values(assignment.scores)) >= 4.3 || assignment.qualityFlags.length)
            .slice(0, 5)
            .map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-stone-900">{assignment.reviewee.name}</div>
                    <div className="mt-1 text-sm text-stone-500">{assignment.reviewee.role} · {assignment.reviewee.office}</div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-900">
                    Avg {average(Object.values(assignment.scores)).toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {assignment.qualityFlags.length
                    ? `Quality review: ${assignment.qualityFlags.join(', ')}.`
                    : 'Outlier high score. Confirm evidence is specific and exceptional.'}
                </p>
              </div>
            ))}
          <button type="button" className="btn-primary w-full justify-center">
            Export calibration summary
          </button>
        </div>
      </div>
    </Panel>
  )
}

function TemplateAdminView() {
  return (
    <Panel title="Role template system" subtitle="Pre-defined, versioned templates auto-selected from the reviewee role. HR can evolve active templates without code changes.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {feedbackTemplates.map((template) => (
          <div key={template.roleKey} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-stone-900">{template.displayName}</h3>
                <p className="mt-1 text-sm text-stone-500">Version {template.version} · {template.competencies.length} competencies</p>
              </div>
              <StatusBadge value={template.active ? 'Enabled' : 'Disabled'} />
            </div>
            <div className="mt-4 space-y-2">
              {template.competencies.map((competency) => (
                <div key={competency.id} className="rounded-xl bg-[#fbf7ef] px-3 py-2 text-sm text-stone-700">
                  <div className="font-medium text-stone-900">{competency.title}</div>
                  <div className="text-xs text-stone-500">{competency.pillar}</div>
                </div>
              ))}
            </div>
            <button type="button" className="mt-4 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
              Edit template
            </button>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-4">
      <div className="text-xs uppercase tracking-[0.12em] text-stone-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-stone-900">{value}</div>
    </div>
  )
}

function PersonRow({ person }: { person: FeedbackPerson }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-stone-900">{person.name}</div>
        <div className="truncate text-xs text-stone-500">{person.jobTitle} · {person.office} · {person.source}</div>
      </div>
      <StatusBadge value={person.role} />
    </div>
  )
}

function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const styles: Record<AssignmentStatus, string> = {
    submitted: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    'in progress': 'bg-amber-100 text-amber-900 ring-amber-200',
    overdue: 'bg-rose-100 text-rose-800 ring-rose-200',
    'not started': 'bg-stone-100 text-stone-700 ring-stone-200',
    'not applicable': 'bg-stone-50 text-stone-400 ring-stone-200',
  }
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${styles[status]}`}>{titleCase(status)}</span>
}

function CycleStatus({ status }: { status: FeedbackCycle['status'] }) {
  const styles: Record<FeedbackCycle['status'], string> = {
    Open: 'bg-olive-100 text-olive-800 ring-olive-200',
    Overdue: 'bg-rose-100 text-rose-800 ring-rose-200',
    'Ready to launch': 'bg-amber-100 text-amber-900 ring-amber-200',
    'Not mandatory': 'bg-stone-100 text-stone-700 ring-stone-200',
  }
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${styles[status]}`}>{status}</span>
}

function CycleRecencyBadge({ cycle }: { cycle: FeedbackCycle }) {
  const recency = getCycleRecency(cycle)
  const styles: Record<ReturnType<typeof getCycleRecency>, string> = {
    Open: 'bg-olive-100 text-olive-800 ring-olive-200',
    'Just ended': 'bg-amber-100 text-amber-900 ring-amber-200',
    Historical: 'bg-stone-100 text-stone-700 ring-stone-200',
  }
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${styles[recency]}`}>{recency}</span>
}

function getCycleRecency(cycle: FeedbackCycle): 'Open' | 'Just ended' | 'Historical' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const closeDate = new Date(cycle.closeDate)
  closeDate.setHours(0, 0, 0, 0)
  const daysSinceClose = Math.floor((today.getTime() - closeDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceClose < 0) return 'Open'
  if (daysSinceClose <= 14) return 'Just ended'
  return 'Historical'
}

function buildProjectPeople(project: Project, internalStaff: ProjectStaffAssignment[]): FeedbackPerson[] {
  const ownerRole = inferRole(project.projectManagerName || project.projectManagerEmail || 'Manager')
  const owner: FeedbackPerson = {
    id: `${project.id}-owner`,
    name: project.projectManagerName || 'Unassigned project lead',
    email: project.projectManagerEmail,
    role: roleRank[ownerRole] >= roleRank.Manager ? ownerRole : 'Manager',
    source: 'Project owner',
    office: officeFromEntity(project.entity),
    practice: project.projectName.includes('AI') ? 'AI' : project.projectName.includes('Retail') ? 'Transformation' : 'VDD',
    jobTitle: 'Project Lead',
  }
  const entraPeople = internalStaff.map((staff) => ({
    id: staff.staffId || staff.id,
    name: staff.fullName,
    email: staff.email,
    role: inferRole(`${staff.jobTitle ?? ''} ${staff.assignmentRole}`),
    source: 'Entra' as const,
    office: staff.officeLocation || officeFromEntity(project.entity),
    practice: staff.department || 'Consulting',
    jobTitle: staff.jobTitle || staff.assignmentRole,
  }))
  const seeded = seededPeopleByProject[project.id] ?? seededPeopleByProject['project-1']
  const people = [owner, ...entraPeople, ...(entraPeople.length ? [] : seeded)]
  return dedupePeople(people).filter((person) => person.role !== 'Partner' && person.role !== 'Expert Partner')
}

function generateAssignments(cycle: FeedbackCycle, people: FeedbackPerson[]): ReviewAssignment[] {
  const assignments: ReviewAssignment[] = []
  people.forEach((reviewer) => {
    people.forEach((reviewee) => {
      if (reviewer.id === reviewee.id) return
      const direction = getDirection(reviewer.role, reviewee.role)
      if (!direction) return
      const template = getFeedbackTemplate(reviewee.role, direction, reviewer.role)
      if (!template) return
      const seed = assignments.length
      const status: AssignmentStatus = seed % 7 === 0 ? 'overdue' : seed % 4 === 0 ? 'submitted' : seed % 3 === 0 ? 'in progress' : 'not started'
      const scores = Object.fromEntries(
        template.competencies.map((competency, index) => [competency.id, seededScore(seed + index)]),
      )
      const comments = Object.fromEntries(
        template.competencies.map((competency, index) => [
          competency.id,
          index === 0 && seed % 5 === 0
            ? 'Good job.'
            : `On ${competency.title.toLowerCase()}, ${reviewee.name.split(' ')[0]} showed clear evidence through the project cadence, stakeholder handling, and delivered outputs.`,
        ]),
      )
      assignments.push({
        id: `${cycle.project.id}-${reviewer.id}-${reviewee.id}`,
        projectId: cycle.project.id,
        projectName: cycle.project.projectName,
        projectCode: cycle.projectCode,
        reviewer,
        reviewee,
        direction,
        dueDate: cycle.dueDate,
        status,
        template,
        scores,
        comments,
        finalRating: Math.round(average(Object.values(scores))) || 3,
        qualityFlags: Object.values(comments).flatMap(commentQualityFlags),
        calibrationNotes: seed % 6 === 0 ? 'Check whether high scores are supported by specific examples before calibration.' : '',
      })
    })
  })
  return assignments
}

function getDirection(reviewer: RoleKey, reviewee: RoleKey): ReviewDirection | null {
  if (
    ['Manager', 'Senior Manager'].includes(reviewer) &&
    ['Analyst', 'Consultant', 'Senior Consultant'].includes(reviewee)
  ) {
    return 'top-down'
  }
  if (
    ['Associate Director', 'Director'].includes(reviewer) &&
    ['Manager', 'Senior Manager'].includes(reviewee)
  ) {
    return 'top-down'
  }
  if (
    reviewer === 'Partner' &&
    ['Manager', 'Senior Manager', 'Associate Director', 'Director'].includes(reviewee)
  ) {
    return 'top-down'
  }
  if (
    ['Analyst', 'Consultant', 'Senior Consultant'].includes(reviewer) &&
    ['Manager', 'Senior Manager', 'Associate Director', 'Director'].includes(reviewee)
  ) {
    return 'upward'
  }
  if (['Manager', 'Senior Manager'].includes(reviewer) && reviewee === 'Director') return 'upward'
  return null
}

function makePerson(id: string, name: string, role: RoleKey, office: string, practice: string): FeedbackPerson {
  return {
    id,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@singulier.co`,
    role,
    source: 'Seeded',
    office,
    practice,
    jobTitle: role,
  }
}

function inferRole(value: string): RoleKey {
  const normalized = value.toLowerCase()
  if (normalized.includes('expert partner')) return 'Expert Partner'
  if (normalized.includes('partner')) return 'Partner'
  if (normalized.includes('associate director')) return 'Associate Director'
  if (normalized.includes('director')) return 'Director'
  if (normalized.includes('senior manager')) return 'Senior Manager'
  if (normalized.includes('manager') || normalized.includes('lead')) return 'Manager'
  if (normalized.includes('senior consultant')) return 'Senior Consultant'
  if (normalized.includes('consultant')) return 'Consultant'
  if (normalized.includes('analyst')) return 'Analyst'
  return 'Manager'
}

function officeFromEntity(entity: string) {
  if (entity.includes('UK')) return 'London'
  if (entity.includes('GE') || entity.includes('DE')) return 'Berlin'
  if (entity.includes('FR')) return 'Paris'
  return 'Global'
}

function requiresComment(competency: Competency, score?: number) {
  if (!score) return false
  return (score <= 2 && competency.requireLowComment) || (score >= 4 && competency.requireHighComment)
}

function isCompetencyComplete(
  competency: Competency,
  scores: Record<string, number>,
  comments: Record<string, string>,
) {
  const score = scores[competency.id]
  if (!score) return false
  return !requiresComment(competency, score) || Boolean(comments[competency.id]?.trim())
}

function commentQualityFlags(comment: string) {
  const flags: string[] = []
  const trimmed = comment.trim()
  if (!trimmed) return flags
  if (trimmed.length < 36) flags.push('too brief')
  if (/\b(good|great|nice|bad|ok)\b/i.test(trimmed) && !/\b(because|for example|when|during|on)\b/i.test(trimmed)) {
    flags.push('needs example')
  }
  if (/\b(always|never|attitude|personality)\b/i.test(trimmed)) flags.push('bias check')
  return flags
}

function seededScore(seed: number) {
  const values = [3, 3, 4, 3, 2, 4, 3, 5]
  return values[seed % values.length]
}

function scoreTone(score: number, selected: boolean) {
  if (selected) {
    if (score <= 2) return 'bg-rose-100 text-rose-900'
    if (score === 3) return 'bg-stone-900 text-white'
    return 'bg-emerald-100 text-emerald-900'
  }
  if (score <= 2) return 'text-rose-800 hover:bg-rose-50'
  if (score === 3) return 'text-stone-700 hover:bg-stone-100'
  return 'text-emerald-800 hover:bg-emerald-50'
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}

function addDays(date: string, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (!valid.length) return 0
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = getKey(item)
    groups[key] = groups[key] ?? []
    groups[key].push(item)
    return groups
  }, {})
}

function dedupePeople(people: FeedbackPerson[]) {
  const seen = new Set<string>()
  return people.filter((person) => {
    const key = person.email || person.name
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase())
}
