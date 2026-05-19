import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { useTrackerData } from '../hooks/useTrackerData'
import { formatDate } from '../lib/format'

export function ImportsPage() {
  const { importCsvFile, lastImportSummary, freelancers, projects, allocations } = useTrackerData()
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    setMessage(null)
    try {
      const summary = await importCsvFile(file)
      setMessage(`Processed ${summary.processedRows} rows from ${summary.fileName}. Added ${summary.addedFreelancers} freelancers, ${summary.addedProjects} projects, and ${summary.addedAllocations} allocations.`)
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Freelancers loaded"
          value={freelancers.length}
          hint="Current records in the tracker."
          tone="brand"
          icon={<Icon name="users" className="h-5 w-5" />}
        />
        <StatCard
          label="Projects loaded"
          value={projects.length}
          hint="Current project entities in scope."
          tone="violet"
          icon={<Icon name="folder" className="h-5 w-5" />}
        />
        <StatCard
          label="Allocations loaded"
          value={allocations.length}
          hint="Assignments currently tracked."
          tone="emerald"
          icon={<Icon name="sparkles" className="h-5 w-5" />}
        />
        <StatCard
          label="Last import rows"
          value={lastImportSummary?.processedRows ?? 0}
          hint={lastImportSummary ? `Last file: ${lastImportSummary.fileName}` : 'No CSV imported yet.'}
          tone="amber"
          icon={<Icon name="upload" className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Panel title="Import Microsoft Forms CSV" subtitle="Upload the raw semicolon-delimited Forms export. The importer already understands the current column layout and applies duplicate protection.">
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard title="Freelancers" body="Matched by freelancer name + personal email to avoid duplicates." />
              <InfoCard title="Projects" body="Matched by project name + entity so repeated imports update instead of cloning." />
              <InfoCard title="Allocations" body="Deduped by Forms row id or by matching freelancer, project, dates, and role." />
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-stone-300 bg-[#efe7da] px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-[#e6dccb]">
              <Icon name="upload" className="h-4 w-4" />
              <input className="hidden" type="file" accept=".csv,text/csv" onChange={onFileChange} disabled={isImporting} />
              {isImporting ? 'Importing...' : 'Choose CSV file'}
            </label>

            {message ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {message}
              </div>
            ) : null}

            <div className="rounded-[24px] border border-white/8 bg-white/85 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-stone-500">Expected input</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                <li>• Semicolon-delimited Microsoft Forms CSV</li>
                <li>• Windows-1252 encoding supported</li>
                <li>• Real Forms columns already mapped to tracker fields</li>
                <li>• Re-importing the same file will skip duplicate allocations</li>
              </ul>
            </div>
          </div>
        </Panel>

        <Panel title="Last import summary" subtitle="Keep the ingestion admin work separate from the live dashboard so the operations view stays focused.">
          {lastImportSummary ? (
            <div className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Metric label="File" value={lastImportSummary.fileName} />
                <Metric label="Imported at" value={formatDate(lastImportSummary.importedAt)} />
                <Metric label="Processed rows" value={String(lastImportSummary.processedRows)} />
                <Metric label="Freelancers added" value={String(lastImportSummary.addedFreelancers)} />
                <Metric label="Freelancers updated" value={String(lastImportSummary.updatedFreelancers)} />
                <Metric label="Projects added" value={String(lastImportSummary.addedProjects)} />
                <Metric label="Projects updated" value={String(lastImportSummary.updatedProjects)} />
                <Metric label="Allocations added" value={String(lastImportSummary.addedAllocations)} />
                <Metric label="Duplicates skipped" value={String(lastImportSummary.skippedAllocations)} />
              </dl>
              {lastImportSummary.errors.length ? (
                <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 p-4">
                  <div className="text-sm font-medium text-amber-100">Import warnings</div>
                  <ul className="mt-2 space-y-2 text-sm text-amber-50/90">
                    {lastImportSummary.errors.slice(0, 8).map((error, index) => (
                      <li key={`${error}-${index}`}>• {error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[24px] border border-white/8 bg-white/85 p-5 text-sm text-stone-500">
              No CSV imported yet. Upload your Forms export to populate the tracker and review the summary here.
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/85 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-stone-500">{title}</div>
      <div className="mt-2 text-sm text-slate-200">{body}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/85 p-3.5">
      <dt className="text-stone-500">{label}</dt>
      <dd className="mt-1 break-words text-stone-900">{value}</dd>
    </div>
  )
}
