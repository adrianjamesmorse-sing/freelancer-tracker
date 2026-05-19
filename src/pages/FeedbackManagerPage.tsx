import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'

export function FeedbackManagerPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Feedback requests"
          value="14"
          hint="Open requests awaiting project input."
          tone="olive"
          icon={<Icon name="message-square" className="h-5 w-5" />}
        />
        <StatCard
          label="Responses this month"
          value="37"
          hint="Submitted across active delivery projects."
          tone="sand"
          icon={<Icon name="check" className="h-5 w-5" />}
        />
        <StatCard
          label="Projects collecting feedback"
          value="9"
          hint="Teams currently in an active feedback cycle."
          tone="brand"
          icon={<Icon name="folder" className="h-5 w-5" />}
        />
        <StatCard
          label="Escalations"
          value="2"
          hint="Responses that likely need HR follow-up."
          tone="rose"
          icon={<Icon name="bell" className="h-5 w-5" />}
        />
      </div>

      <Panel
        title="Feedback Manager"
        subtitle="Project feedback management now sits alongside freelancer management inside Vertex. This placeholder establishes the shell and navigation so the HR module can be built next."
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-stone-200 bg-white/85 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-900">Suggested first views</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
              <li>Project-level feedback requests and response status</li>
              <li>Reviewer completion tracking by project manager</li>
              <li>Escalation queue for HR follow-up</li>
              <li>Feedback templates and cadence management</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,#f7f3eb,#efe7d9)] p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-stone-50">
              <Icon name="message-square" className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900">Next HR build step</h3>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Add feedback templates, request flows, reviewer assignments, and completion reporting on top of this shell.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
