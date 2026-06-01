import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchStaff, type StaffMember } from '../lib/authApi'

type StaffPickerProps = {
  label: string
  valueEmail: string
  valueName: string
  onChange: (staff: { email: string; name: string }) => void
  required?: boolean
}

export function StaffPicker({
  label,
  valueEmail,
  valueName,
  onChange,
  required = false,
}: StaffPickerProps) {
  const { idToken, isAuthenticated } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const rows = await fetchStaff(idToken ?? undefined)
        if (!cancelled) {
          setStaff(rows)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load staff directory')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (isAuthenticated) {
      void load()
    } else {
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [idToken, isAuthenticated])

  const selectedId =
    staff.find((member) => member.email.toLowerCase() === valueEmail.toLowerCase())?.id ?? ''

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <select
        required={required}
        value={selectedId}
        disabled={loading || !staff.length}
        onChange={(event) => {
          const member = staff.find((item) => item.id === event.target.value)
          if (member) {
            onChange({ email: member.email, name: member.fullName })
          }
        }}
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500 disabled:bg-stone-100"
      >
        <option value="">
          {loading
            ? 'Loading staff from Entra…'
            : staff.length
              ? 'Select a staff member'
              : 'No staff synced yet'}
        </option>
        {staff.map((member) => (
          <option key={member.id} value={member.id}>
            {member.fullName} · {member.email}
            {member.jobTitle ? ` · ${member.jobTitle}` : ''}
          </option>
        ))}
      </select>

      {valueName && valueEmail && !selectedId ? (
        <div className="text-xs text-stone-500">
          Current value: {valueName} ({valueEmail})
        </div>
      ) : null}

      {error ? <div className="text-xs text-rose-700">{error}</div> : null}

      {!loading && !staff.length ? (
        <div className="text-xs text-stone-500">
          Sync staff from Entra in Admin → Graph permissions to enable assignment pickers.
        </div>
      ) : null}
    </label>
  )
}
