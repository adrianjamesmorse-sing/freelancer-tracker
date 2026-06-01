import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { syncStaffFromEntra } from '../lib/authApi'
import { loadAdminConfig, saveAdminConfig, type VertexAdminConfig } from '../lib/adminConfig'


const allPermissions = [
  'User.Read.All',
  'AppRoleAssignment.Read.All',
  'Directory.Read.All',
  'ProfilePhoto.Read.All',
]

export function AdminGraphPage() {
  const { idToken } = useAuth()
  const [config, setConfig] = useState<VertexAdminConfig>(() => loadAdminConfig())
  const [syncMessage, setSyncMessage] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  useEffect(() => { saveAdminConfig(config) }, [config])

  const consentUrl = useMemo(() => {
    if (!config.clientId || !config.tenantId) return ''
    return `https://login.microsoftonline.com/${config.tenantId}/adminconsent?client_id=${encodeURIComponent(config.clientId)}`
  }, [config.clientId, config.tenantId])

  const graphSnippet = useMemo(() => `POST https://login.microsoftonline.com/${config.tenantId || '{tenant-id}'}/oauth2/v2.0/token
  grant_type=client_credentials
  client_id=${config.clientId || '{client-id}'}
  client_secret=${config.clientSecret ? '***configured***' : '{client-secret}'}
  scope=${config.graphScopes}

GET https://graph.microsoft.com/v1.0/users?$select=id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,mobilePhone,businessPhones,officeLocation,department
GET https://graph.microsoft.com/v1.0/users/{id}/photos/120x120/$value`, [config])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Graph permissions" value={config.graphAppPermissions.length} hint="Application permissions expected in Entra." tone="brand" icon={<Icon name="apps" className="h-5 w-5" />} />
        <StatCard label="Photo sync" value={config.graphAppPermissions.includes('ProfilePhoto.Read.All') ? 'Enabled' : 'Missing'} hint="Used for staff profile pictures in Feedback Manager." tone="olive" icon={<Icon name="users" className="h-5 w-5" />} />
        <StatCard label="Token scope" value={config.graphScopes.replace('https://graph.microsoft.com/', '')} hint="Recommended app-only Graph scope." tone="sand" icon={<Icon name="globe" className="h-5 w-5" />} />
        <StatCard label="Admin consent" value={consentUrl ? 'Ready' : 'Needs IDs'} hint="Generate consent URL once tenant and client IDs are set." tone="amber" icon={<Icon name="check" className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel title="Graph app permissions" subtitle="Select the permissions Vertex needs in order to read Entra staff details and profile photos.">
          <div className="space-y-3">
            {allPermissions.map((permission) => {
              const checked = config.graphAppPermissions.includes(permission)
              return (
                <label key={permission} className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-stone-300 text-olive-700"
                    checked={checked}
                    onChange={(event) => {
                      setConfig((current) => ({
                        ...current,
                        graphAppPermissions: event.target.checked
                          ? [...new Set([...current.graphAppPermissions, permission])]
                          : current.graphAppPermissions.filter((item) => item !== permission),
                      }))
                    }}
                  />
                  <div>
                    <div className="font-medium text-stone-900">{permission}</div>
                    <div className="mt-1 text-stone-600">{describePermission(permission)}</div>
                  </div>
                </label>
              )
            })}
          </div>

          <label className="mt-5 block text-sm text-stone-700">
            <span className="mb-2 block font-medium">Graph scope</span>
            <input className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm" value={config.graphScopes} onChange={(event) => setConfig((current) => ({ ...current, graphScopes: event.target.value }))} />
          </label>

          <label className="mt-4 block text-sm text-stone-700">
            <span className="mb-2 block font-medium">Implementation notes</span>
            <textarea className="min-h-[140px] w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm" value={config.graphNotes} onChange={(event) => setConfig((current) => ({ ...current, graphNotes: event.target.value }))} placeholder="Optional notes for admin consent, data mapping, photo sync, or environment setup." />
          </label>
        </Panel>

        <Panel title="Graph sync reference" subtitle="Suggested flow for pulling staff and photos into Vertex for Feedback Manager.">
          <div className="space-y-4">
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-stone-700">
              <li>Create a dedicated Entra app registration for Vertex Graph sync.</li>
              <li>Grant the selected application permissions and complete admin consent.</li>
              <li>Use client credentials to request a token with the Graph <code>.default</code> scope.</li>
              <li>Sync <code>/users</code> into a local <code>staff</code> table in Vertex.</li>
              <li>Fetch <code>/photos/120x120/$value</code> per staff member and cache avatars locally.</li>
            </ol>
            <div className="rounded-2xl border border-stone-200 bg-[#f7f3eb] p-4 text-xs leading-6 text-stone-700"><pre className="overflow-auto"><code>{graphSnippet}</code></pre></div>
            {consentUrl ? (
              <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-700">
                Admin consent URL: <a className="font-medium text-brand-700 underline" href={consentUrl} target="_blank" rel="noreferrer">Open Entra admin consent</a>
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600">Set the tenant ID and client ID on the Credentials page to generate an admin-consent link.</div>
            )}

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
              <button
                type="button"
                className="btn-primary"
                disabled={!idToken || isSyncing}
                onClick={async () => {
                  if (!idToken) return
                  setIsSyncing(true)
                  setSyncMessage('')
                  try {
                    const result = await syncStaffFromEntra(idToken)
                    setSyncMessage(
                      `Synced ${result.synced} staff members from Entra (${result.skipped} skipped).`,
                    )
                  } catch (err) {
                    setSyncMessage(err instanceof Error ? err.message : 'Staff sync failed')
                  } finally {
                    setIsSyncing(false)
                  }
                }}
              >
                {isSyncing ? 'Syncing staff…' : 'Sync staff from Entra'}
              </button>
              <p className="text-sm text-stone-600">
                Pulls Entra users into the Vertex <code>staff</code> table for project assignment pickers.
              </p>
            </div>

            {syncMessage ? (
              <div className="rounded-2xl border border-stone-200 bg-[#f7f3eb] px-4 py-3 text-sm text-stone-700">
                {syncMessage}
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function describePermission(permission: string) {
  if (permission === 'User.Read.All') return 'Read user profiles for the local Vertex staff directory.'
  if (permission === 'AppRoleAssignment.Read.All') {
    return 'Read which app roles (vertex.admin, etc.) are assigned to each user when the ID token has no roles claim.'
  }
  if (permission === 'Directory.Read.All') return 'Read broader tenant directory metadata when user-only access is insufficient.'
  if (permission === 'ProfilePhoto.Read.All') return 'Read staff profile photos for review cards and people pickers.'
  return ''
}
