import { useMemo, useState, type ReactNode } from 'react'
import { Modal } from '../components/Modal'
import { Panel } from '../components/Panel'
import { useTrackerData } from '../hooks/useTrackerData'
import { COUNTRY_OPTIONS } from '../lib/countries'
import {
  createFreelancerRequest,
  loadFreelancerRequests,
  saveFreelancerRequests,
  type NewFreelancerRequestInput,
  type RequestCurrency,
} from '../lib/freelancerRequests'

const initialForm: NewFreelancerRequestInput = {
  requesterName: '',
  requesterEmail: '',
  projectId: '',
  hasWorkedWithUsBefore: false,
  existingFreelancerId: '',
  freelancerName: '',
  personalEmail: '',
  phoneNumber: '',
  country: '',
  address: '',
  registrationNumber: true,
  roleWithinProject: '',
  contractStartDate: '',
  contractEndDate: '',
  numberOfDays: 0,
  dailyRate: 0,
  dailyRateCurrency: 'EUR',
  comments: '',
}

export function RequestFreelancerPage() {
  const { projects, freelancers } = useTrackerData()

  const [form, setForm] = useState<NewFreelancerRequestInput>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showRegistrationError, setShowRegistrationError] = useState(false)
  const [submittedRecordName, setSubmittedRecordName] = useState<string | null>(null)

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.projectName.localeCompare(b.projectName)),
    [projects],
  )

  const sortedFreelancers = useMemo(
    () => [...freelancers].sort((a, b) => a.freelancerName.localeCompare(b.freelancerName)),
    [freelancers],
  )

  const selectedProject = sortedProjects.find((project) => project.id === form.projectId)
  const selectedExistingFreelancer = sortedFreelancers.find(
    (freelancer) => freelancer.id === form.existingFreelancerId,
  )

  const resetForAnother = () => {
    setForm(initialForm)
    setMessage(null)
    setSubmittedRecordName(null)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    if (!form.registrationNumber) {
      setShowRegistrationError(true)
      return
    }

    if (!selectedProject) {
      setMessage('Please select a project.')
      return
    }

    if (!form.requesterName.trim() || !form.requesterEmail.trim()) {
      setMessage('Please complete your requester details.')
      return
    }

    if (form.hasWorkedWithUsBefore && !selectedExistingFreelancer) {
      setMessage('Please select the freelancer who has worked with us before.')
      return
    }

    if (
      !form.hasWorkedWithUsBefore &&
      (!form.freelancerName.trim() ||
        !form.personalEmail.trim() ||
        !form.phoneNumber.trim() ||
        !form.country.trim() ||
        !form.address.trim())
    ) {
      setMessage('Please complete all freelancer identity fields.')
      return
    }

    if (!form.contractStartDate || !form.contractEndDate) {
      setMessage('Please complete the freelancer start and end dates.')
      return
    }

    setIsSubmitting(true)

    try {
      const next = loadFreelancerRequests()
      const record = createFreelancerRequest(form, selectedProject, selectedExistingFreelancer)
      saveFreelancerRequests([record, ...next])

      setSubmittedRecordName(record.freelancerName)
      setMessage(
        'Freelancer request submitted successfully. The onboarding team can now move it through the pipeline.',
      )
      setForm(initialForm)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h2 className="page-title">Request Freelancer</h2>
            <p className="page-description max-w-4xl whitespace-pre-line">
            {'You wish to onboard a freelancer on your project. Please fill out this questionnaire so we can prepare their contract and NDA.\nOnce signed, we can create a Singulier email address for them and grant access to Singulier Teams\nAs a reminder, you are supposed to have filled the spending request before to validate the budget with the partner of your project\n(Singulier >> Employee Resources >> Internal >> Finance & Legal)'}
          </p>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="font-medium">
              {submittedRecordName ? `${submittedRecordName} request submitted.` : message}
            </div>
            <div className="mt-1">{message}</div>
            <div className="mt-3">
              <button
                type="button"
                onClick={resetForAnother}
                className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
              >
                Request another freelancer
              </button>
            </div>
          </div>
        ) : null}

        <Panel
          title="Freelancer request form"
          subtitle="Complete the onboarding request so Vertex can prepare contract, setup, and onboarding."
        >
          <form onSubmit={onSubmit} className="space-y-8">
            <Section title="Your details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Requester name"
                  value={form.requesterName}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, requesterName: value }))
                  }
                  placeholder="Your full name"
                  required
                />
                <TextField
                  label="Requester email"
                  type="email"
                  value={form.requesterEmail}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, requesterEmail: value }))
                  }
                  placeholder="your.name@singulier.co"
                  required
                />
              </div>
            </Section>

            <Section title="Project and engagement">
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Requested project"
                  value={form.projectId}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, projectId: value }))
                  }
                  options={sortedProjects.map((project) => ({
                    value: project.id,
                    label: `${project.projectName} · ${project.entity}`,
                  }))}
                  placeholder="Select a project"
                  required
                />

                <TextField
                  label="Role within the project"
                  value={form.roleWithinProject}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, roleWithinProject: value }))
                  }
                  placeholder="Manager, Senior Consultant, Designer..."
                  required
                />

                <TextField
                  label="Freelancer start date"
                  type="date"
                  value={form.contractStartDate}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, contractStartDate: value }))
                  }
                  required
                />

                <TextField
                  label="Freelancer end date"
                  type="date"
                  value={form.contractEndDate}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, contractEndDate: value }))
                  }
                  required
                />

                <TextField
                  label="Number of days"
                  type="number"
                  value={String(form.numberOfDays)}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      numberOfDays: Number(value || 0),
                    }))
                  }
                  required
                />

                <CurrencyField
                  amount={form.dailyRate}
                  value={form.dailyRateCurrency}
                  onAmountChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      dailyRate: Number(value || 0),
                    }))
                  }
                  onCurrencyChange={(value) =>
                    setForm((current) => ({ ...current, dailyRateCurrency: value }))
                  }
                />
              </div>
            </Section>

            <Section title="Freelancer history">
              <BinaryChoice
                label="Has the freelancer worked with us before?"
                value={form.hasWorkedWithUsBefore ? 'yes' : 'no'}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    hasWorkedWithUsBefore: value === 'yes',
                    existingFreelancerId: value === 'yes' ? current.existingFreelancerId : '',
                  }))
                }
              />

              {form.hasWorkedWithUsBefore ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Select freelancer"
                    value={form.existingFreelancerId ?? ''}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, existingFreelancerId: value }))
                    }
                    options={sortedFreelancers.map((freelancer) => ({
                      value: freelancer.id,
                      label: `${freelancer.freelancerName}${freelancer.personalEmail ? ` · ${freelancer.personalEmail}` : ''}`,
                    }))}
                    placeholder="Choose an existing freelancer"
                    required
                  />

                  <ReadOnlyField
                    label="Known freelancer details"
                    value={
                      selectedExistingFreelancer
                        ? [
                            selectedExistingFreelancer.personalEmail || 'No email',
                            selectedExistingFreelancer.phoneNumber || 'No phone',
                            selectedExistingFreelancer.country || 'No country',
                          ].join(' · ')
                        : 'Select a freelancer to reuse existing details'
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Freelancer name"
                    value={form.freelancerName}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, freelancerName: value }))
                    }
                    placeholder="Freelancer full name"
                    required
                  />
                  <TextField
                    label="Freelancer email address"
                    type="email"
                    value={form.personalEmail}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, personalEmail: value }))
                    }
                    placeholder="freelancer@email.com"
                    required
                  />
                  <TextField
                    label="Freelancer phone number"
                    value={form.phoneNumber}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, phoneNumber: value }))
                    }
                    placeholder="+44 ..."
                    required
                  />
                  <SelectField
                    label="Country"
                    value={form.country}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, country: value }))
                    }
                    options={COUNTRY_OPTIONS.map((country) => ({
                      value: country,
                      label: country,
                    }))}
                    placeholder="Select a country"
                    required
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Address"
                      value={form.address}
                      onChange={(value) =>
                        setForm((current) => ({ ...current, address: value }))
                      }
                      placeholder="Street, city, postcode"
                      required
                    />
                  </div>
                </div>
              )}
            </Section>

            <Section title="Compliance">
              <BinaryChoice
                label="Does the freelancer have a registration number?"
                helper='Please note that if answer is "No", we won’t be able to provide a contract.'
                value={form.registrationNumber ? 'yes' : 'no'}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    registrationNumber: value === 'yes',
                  }))
                }
              />

              <TextAreaField
                label="Additional comments"
                value={form.comments}
                onChange={(value) =>
                  setForm((current) => ({ ...current, comments: value }))
                }
                placeholder="Anything legal, finance, or IT should know"
              />
            </Section>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 pt-5">
              <button
                type="button"
                onClick={resetForAnother}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                Reset form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-4 py-2"
              >
                {isSubmitting ? 'Submitting…' : 'Submit freelancer request'}
              </button>
            </div>
          </form>
        </Panel>
      </div>

      <Modal
        open={showRegistrationError}
        onClose={() => setShowRegistrationError(false)}
        title="Registration number required"
        description='All freelancers must have a registration number for us to provide a contract.'
        footer={
          <button
            type="button"
            onClick={() => setShowRegistrationError(false)}
            className="btn-primary px-4 py-2"
          >
            Understood
          </button>
        }
      >
        <div className="text-sm text-stone-600">
          Please update the answer to <strong>Yes</strong> before submitting this request.
        </div>
      </Modal>
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 rounded-[28px] border border-stone-200 bg-white/80 p-5">
      <div>
        <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder: string
  required?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function BinaryChoice({
  label,
  helper,
  value,
  onChange,
}: {
  label: string
  helper?: string
  value: 'yes' | 'no'
  onChange: (value: 'yes' | 'no') => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        {helper ? (
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 bg-white text-xs text-stone-500"
            title={helper}
          >
            i
          </span>
        ) : null}
      </div>
      <div className="inline-flex rounded-full border border-stone-300 bg-white p-1">
        <button
          type="button"
          onClick={() => onChange('yes')}
          className={[
            'rounded-full px-4 py-2 text-sm font-medium transition',
            value === 'yes'
              ? 'bg-olive-700 text-white'
              : 'text-stone-700 hover:bg-stone-100',
          ].join(' ')}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange('no')}
          className={[
            'rounded-full px-4 py-2 text-sm font-medium transition',
            value === 'no'
              ? 'bg-rose-700 text-white'
              : 'text-stone-700 hover:bg-stone-100',
          ].join(' ')}
        >
          No
        </button>
      </div>
    </div>
  )
}

function CurrencyField({
  amount,
  value,
  onAmountChange,
  onCurrencyChange,
}: {
  amount: number
  value: RequestCurrency
  onAmountChange: (value: string) => void
  onCurrencyChange: (value: RequestCurrency) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
      <TextField
        label="Daily rate"
        type="number"
        value={String(amount)}
        onChange={onAmountChange}
      />
      <SelectField
        label="Currency"
        value={value}
        onChange={(next) => onCurrencyChange(next as RequestCurrency)}
        options={[
          { value: 'EUR', label: 'EUR' },
          { value: 'GBP', label: 'GBP' },
          { value: 'USD', label: 'USD' },
          { value: 'CHF', label: 'CHF' },
        ]}
        placeholder="Currency"
      />
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-stone-700">{label}</div>
      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        {value}
      </div>
    </div>
  )
}
