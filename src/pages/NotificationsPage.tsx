import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { useTrackerData } from '../hooks/useTrackerData'
import type { NewNotificationRuleInput, NotificationCadence, NotificationRecipient, NotificationRule, NotificationTrigger } from '../types'

const triggerOptions: Array<{ value: NotificationTrigger; label: string }> = [
  { value: 'join', label: 'Freelancer joins a project' },
  { value: 'end_3_days', label: 'Contract ends in 3 days' },
  { value: 'end_1_day', label: 'Contract ends in 1 day' },
  { value: 'still_open_weekly', label: 'Still-open weekly follow-up' },
  { value: 'custom', label: 'Custom notification' },
]

const cadenceOptions: NotificationCadence[] = ['Immediate', 'Daily digest', 'Weekly digest', 'Manual review']
const recipientOptions: NotificationRecipient[] = ['Owner manager', 'Project manager', 'Ops', 'Finance', 'Custom recipients']

const initialForm: NewNotificationRuleInput = {
  name: '',
  description: '',
  triggerType: 'custom',
  cadence: 'Immediate',
  recipientTypes: ['Owner manager'],
  customRecipients: '',
  subject: '',
  body: '',
  enabled: true,
}

export function NotificationsPage() {
  const {
    notificationRules,
    notifications,
    addNotificationRule,
    updateNotificationRule,
    removeNotificationRule,
    toggleNotificationRule,
  } = useTrackerData()

  const [search, setSearch] = useState('')
  const [selectedTrigger, setSelectedTrigger] = useState<'All' | NotificationTrigger>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)
  const [form, setForm] = useState<NewNotificationRuleInput>(initialForm)
  const [message, setMessage] = useState('')

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    return notificationRules.filter((rule) => {
      const matchesTrigger = selectedTrigger === 'All' || rule.triggerType === selectedTrigger
      const matchesSearch =
        !q ||
        [rule.name, rule.description, rule.subject, rule.body, rule.customRecipients].join(' ').toLowerCase().includes(q)
      return matchesTrigger && matchesSearch
    })
  }, [notificationRules, search, selectedTrigger])

  const customRecipientCount = useMemo(
    () =>
      notificationRules.reduce((count, rule) => {
        const extras = rule.customRecipients
          .split(/[;,\n]/)
          .map((item) => item.trim())
          .filter(Boolean)
        return count + extras.length
      }, 0),
    [notificationRules],
  )

  const openCreate = () => {
    setEditingRule(null)
    setForm(initialForm)
    setMessage('')
    setModalOpen(true)
  }

  const openEdit = (rule: NotificationRule) => {
    setEditingRule(rule)
    setForm({ ...rule })
    setMessage('')
    setModalOpen(true)
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = editingRule
      ? updateNotificationRule(editingRule.id, sanitizeRuleInput(form))
      : addNotificationRule(sanitizeRuleInput(form))
    setMessage(result.message)
    if (result.success) setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active notification rules"
          value={notificationRules.filter((item) => item.enabled).length}
          hint="Templates ready for email hookup later."
          tone="brand"
          icon={<Icon name="bell" className="h-5 w-5" />}
        />
        <StatCard
          label="Custom recipients"
          value={customRecipientCount}
          hint="Addresses explicitly configured inside rules."
          tone="violet"
          icon={<Icon name="mail" className="h-5 w-5" />}
        />
        <StatCard
          label="Queued notifications"
          value={notifications.filter((item) => item.status === 'queued').length}
          hint="Current in-app queue previews."
          tone="amber"
          icon={<Icon name="sparkles" className="h-5 w-5" />}
        />
        <StatCard
          label="Manual review rules"
          value={notificationRules.filter((item) => item.cadence === 'Manual review').length}
          hint="Rules that need an explicit send action later."
          tone="rose"
          icon={<Icon name="settings" className="h-5 w-5" />}
        />
      </div>

      <Panel
        title="Notification manager"
        subtitle="Design and maintain the notification content now, then wire the delivery mechanism later without reworking your UX."
        action={
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-[#efe7da] px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-[#e6dccb]"
            onClick={openCreate}
            type="button"
          >
            <Icon name="plus" className="h-4 w-4" />
            New notification rule
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <label className="relative flex-1 md:max-w-md">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white/85 py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-500"
                  placeholder="Search name, subject, body, or recipients..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="relative md:w-72">
                <Icon name="filter" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <select
                  className="w-full appearance-none rounded-2xl border border-stone-200 bg-white/85 py-2.5 pl-10 pr-3 text-sm text-stone-900"
                  value={selectedTrigger}
                  onChange={(event) => setSelectedTrigger(event.target.value as 'All' | NotificationTrigger)}
                >
                  <option value="All">All triggers</option>
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="text-sm text-stone-500">{filteredRules.length} rules</div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {filteredRules.map((rule) => (
              <article key={rule.id} className="rounded-[24px] border border-stone-200 bg-white/85 p-5 shadow-panel transition hover:border-white/15 hover:bg-white/[0.07]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight text-stone-900">{rule.name}</h3>
                      <StatusBadge value={rule.enabled ? 'Enabled' : 'Disabled'} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{rule.description || 'No description yet.'}</p>
                  </div>
                  <button
                    className={`inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium transition ${
                      rule.enabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                    onClick={() => toggleNotificationRule(rule.id)}
                    type="button"
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge value={rule.triggerType} />
                  <StatusBadge value={rule.cadence} />
                  {rule.recipientTypes.map((item) => (
                    <span key={item} className="inline-flex rounded-full border border-stone-200 bg-white/85 px-3 py-1 text-xs text-stone-700">
                      {item}
                    </span>
                  ))}
                </div>

                <dl className="mt-5 space-y-4 text-sm">
                  <div className="rounded-2xl border border-stone-200 bg-[#f8f3ea] p-4">
                    <dt className="text-xs uppercase tracking-[0.16em] text-stone-500">Subject</dt>
                    <dd className="mt-2 text-stone-900">{rule.subject}</dd>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-[#f8f3ea] p-4">
                    <dt className="text-xs uppercase tracking-[0.16em] text-stone-500">Body</dt>
                    <dd className="mt-2 whitespace-pre-wrap text-stone-700">{rule.body}</dd>
                  </div>
                  {rule.customRecipients ? (
                    <div className="rounded-2xl border border-stone-200 bg-[#f8f3ea] p-4">
                      <dt className="text-xs uppercase tracking-[0.16em] text-stone-500">Custom recipients</dt>
                      <dd className="mt-2 break-all text-stone-700">{rule.customRecipients}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/85 px-4 py-2 text-sm text-stone-900 transition hover:bg-white/10"
                    onClick={() => openEdit(rule)}
                    type="button"
                  >
                    <Icon name="settings" className="h-4 w-4" />
                    Edit rule
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-100"
                    onClick={() => {
                      if (window.confirm(`Delete notification rule “${rule.name}”?`)) removeNotificationRule(rule.id)
                    }}
                    type="button"
                  >
                    <Icon name="check" className="h-4 w-4" />
                    Delete rule
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Supported template tokens" subtitle="Use these placeholders in subjects and bodies so future emails are automatically personalized.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {['{{freelancerName}}', '{{projectName}}', '{{entity}}', '{{managerName}}', '{{startDate}}', '{{endDate}}', '{{role}}'].map((token) => (
            <div key={token} className="rounded-2xl border border-stone-200 bg-white/85 px-4 py-3 text-sm text-stone-800">
              <code>{token}</code>
            </div>
          ))}
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        title={editingRule ? 'Edit notification rule' : 'Create notification rule'}
        description="Define cadence, recipients, and copy now so the delivery hook-up later is mostly plumbing."
        onClose={() => setModalOpen(false)}
      >
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Rule name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
            <label className="block text-sm text-stone-700">
              <span className="mb-1 block">Trigger</span>
              <select
                className="w-full rounded-2xl border border-stone-200 bg-white/85 px-3 py-2.5 text-stone-900"
                value={form.triggerType}
                onChange={(event) => setForm((current) => ({ ...current, triggerType: event.target.value as NotificationTrigger }))}
              >
                {triggerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm text-stone-700">
            <span className="mb-1 block">Description</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-stone-200 bg-white/85 px-3 py-2.5 text-stone-900"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm text-stone-700">
              <span className="mb-1 block">Cadence</span>
              <select
                className="w-full rounded-2xl border border-stone-200 bg-white/85 px-3 py-2.5 text-stone-900"
                value={form.cadence}
                onChange={(event) => setForm((current) => ({ ...current, cadence: event.target.value as NotificationCadence }))}
              >
                {cadenceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/85 px-4 py-3 text-sm text-stone-800">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
              />
              Enabled when delivery gets wired up
            </label>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-stone-800">Recipients</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recipientOptions.map((recipient) => {
                const checked = form.recipientTypes.includes(recipient)
                return (
                  <label key={recipient} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/85 px-4 py-3 text-sm text-stone-800">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setForm((current) => ({
                          ...current,
                          recipientTypes: checked
                            ? current.recipientTypes.filter((item) => item !== recipient)
                            : [...current.recipientTypes, recipient],
                        }))
                      }}
                    />
                    {recipient}
                  </label>
                )
              })}
            </div>
            {form.recipientTypes.includes('Custom recipients') ? (
              <label className="block text-sm text-stone-700">
                <span className="mb-1 block">Custom recipient emails</span>
                <textarea
                  className="min-h-20 w-full rounded-2xl border border-stone-200 bg-white/85 px-3 py-2.5 text-stone-900"
                  placeholder="Separate addresses with commas, semicolons, or line breaks"
                  value={form.customRecipients}
                  onChange={(event) => setForm((current) => ({ ...current, customRecipients: event.target.value }))}
                />
              </label>
            ) : null}
          </div>

          <Input label="Subject line" value={form.subject} onChange={(value) => setForm((current) => ({ ...current, subject: value }))} required />

          <label className="block text-sm text-stone-700">
            <span className="mb-1 block">Body copy</span>
            <textarea
              className="min-h-40 w-full rounded-2xl border border-stone-200 bg-white/85 px-3 py-2.5 text-stone-900"
              value={form.body}
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              required
            />
          </label>

          <div className="rounded-2xl border border-stone-200 bg-[#f8f3ea] p-4 text-sm text-stone-700">
            <div className="text-xs uppercase tracking-[0.16em] text-stone-500">Preview</div>
            <div className="mt-3 text-stone-900">{previewText(form.subject)}</div>
            <div className="mt-2 whitespace-pre-wrap text-stone-700">{previewText(form.body)}</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {message ? <p className="text-sm text-stone-500">{message}</p> : <span />}
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-400/20 bg-brand-500/15 px-5 py-2.5 text-sm font-medium text-stone-900 transition hover:bg-brand-500/25" type="submit">
              <Icon name="check" className="h-4 w-4" />
              {editingRule ? 'Save changes' : 'Create notification rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function sanitizeRuleInput(input: NewNotificationRuleInput): NewNotificationRuleInput {
  return {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    subject: input.subject.trim(),
    body: input.body.trim(),
    customRecipients: input.customRecipients.trim(),
    recipientTypes: Array.from(new Set(input.recipientTypes)),
  }
}

function replaceToken(input: string, token: string, replacement: string) {
  return input.split(token).join(replacement)
}

function previewText(value: string) {
  let output = value
  output = replaceToken(output, '{{freelancerName}}', 'Sophie Martin')
  output = replaceToken(output, '{{projectName}}', 'Retail Transformation')
  output = replaceToken(output, '{{entity}}', 'Squadigital FR')
  output = replaceToken(output, '{{managerName}}', 'Amelie Laurent')
  output = replaceToken(output, '{{startDate}}', '2026-05-06')
  output = replaceToken(output, '{{endDate}}', '2026-06-14')
  output = replaceToken(output, '{{role}}', 'Senior Product Designer')
  return output
}


function Input({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="mb-1 block">{label}</span>
      <input
        className="w-full rounded-2xl border border-stone-200 bg-white/85 px-3 py-2.5 text-stone-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
