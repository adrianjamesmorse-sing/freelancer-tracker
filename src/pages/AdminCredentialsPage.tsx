import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { callbackUrl, loadAdminConfig, saveAdminConfig, type VertexAdminConfig } from '../lib/adminConfig'

export function AdminCredentialsPage() {
  const [config, setConfig] = useState<VertexAdminConfig>(() => loadAdminConfig())
  const [revealSecret, setRevealSecret] = useState(false)

  useEffect(() => { saveAdminConfig(config) }, [config])

  const envSnippet = useMemo(() => `DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/vertex?sslmode=require
ENTRA_TENANT_ID=${config.tenantId || '{tenant-id}'}
ENTRA_CLIENT_ID=${config.clientId || '{client-id}'}
ENTRA_CLIENT_SECRET=${config.clientSecret || '{client-secret}'}
ENTRA_ALLOWED_DOMAIN=${config.domain || 'singulier.co'}
ENTRA_GRAPH_SCOPE=https://graph.microsoft.com/.default`, [config])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tenant ID" value={config.tenantId || 'Not set'} hint="Used for both SSO and Graph app auth." tone="brand" icon={<Icon name="shield" className="h-5 w-5" />} />
        <StatCard label="Client ID" value={config.clientId ? 'Configured' : 'Missing'} hint="App registration identifier for Vertex." tone="olive" icon={<Icon name="apps" className="h-5 w-5" />} />
        <StatCard label="Client secret" value={config.clientSecret ? 'Stored locally' : 'Missing'} hint="Set ENTRA_CLIENT_SECRET in Azure SWA application settings." tone="sand" icon={<Icon name="mail" className="h-5 w-5" />} />
        <StatCard label="Callback" value={callbackUrl(config).replace('https://', '')} hint="Use this in your Entra redirect URI list." tone="amber" icon={<Icon name="check" className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel title="Entra application credentials" subtitle="Store the key identifiers Vertex needs to authenticate against Entra and Microsoft Graph.">
          <div className="grid gap-4">
            <Field label="Tenant ID" value={config.tenantId} onChange={(value) => setConfig((current) => ({ ...current, tenantId: value }))} placeholder="Tenant GUID or organizations" />
            <Field label="Client ID" value={config.clientId} onChange={(value) => setConfig((current) => ({ ...current, clientId: value }))} placeholder="Application (client) ID" />
            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-medium">Client secret</span>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm"
                  type={revealSecret ? 'text' : 'password'}
                  value={config.clientSecret}
                  placeholder="Paste the secret value here"
                  onChange={(event) => setConfig((current) => ({ ...current, clientSecret: event.target.value }))}
                />
                <button type="button" className="rounded-2xl border border-stone-300 bg-white px-4 text-sm text-stone-700" onClick={() => setRevealSecret((current) => !current)}>{revealSecret ? 'Hide' : 'Show'}</button>
              </div>
            </label>
          </div>
        </Panel>

        <Panel title="Azure Static Web Apps settings" subtitle="Production secrets belong in SWA Configuration → Application settings. The API uses them at runtime; the login page reads tenant and client IDs from /api/auth/config.">
          <div className="rounded-2xl border border-stone-200 bg-[#f7f3eb] p-4 text-xs leading-6 text-stone-700"><pre className="overflow-auto"><code>{envSnippet}</code></pre></div>
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600">
            Never commit <code>ENTRA_CLIENT_SECRET</code> or <code>DATABASE_URL</code>. Browser fields
            below are for local development only.
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="mb-2 block font-medium">{label}</span>
      <input className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
