import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { callbackUrl, loadAdminConfig, oidcDiscoveryUrl, saveAdminConfig, type VertexAdminConfig } from '../lib/adminConfig'

export function AdminSSOPage() {
  const [config, setConfig] = useState<VertexAdminConfig>(() => loadAdminConfig())
  const [savedState, setSavedState] = useState('')

  useEffect(() => {
    saveAdminConfig(config)
  }, [config])

  const callback = callbackUrl(config)
  const discoveryUrl = oidcDiscoveryUrl(config)

  const serverSnippet = useMemo(() => `import { betterAuth } from "better-auth"
import { sso } from "@better-auth/sso"

export const auth = betterAuth({
  plugins: [sso()]
})

await auth.api.registerSSOProvider({
  body: {
    providerId: "${config.providerId}",
    issuer: "${config.issuer}",
    domain: "${config.domain}",
    oidcConfig: {
      discoveryUrl: "${discoveryUrl}",
      clientId: process.env.ENTRA_CLIENT_ID!,
      clientSecret: process.env.ENTRA_CLIENT_SECRET!,
      scopes: ["openid", "profile", "email", "offline_access"]
    }
  }
})`, [config, discoveryUrl])

  const clientSnippet = useMemo(() => `import { createAuthClient } from "better-auth/client"
import { ssoClient } from "@better-auth/sso/client"

export const authClient = createAuthClient({
  plugins: [ssoClient()]
})

await authClient.signIn.sso({
  domain: "${config.domain}",
  providerId: "${config.providerId}",
  callbackURL: "/"
})`, [config])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Provider" value={config.providerId || 'entra-singulier'} hint="Better Auth SSO provider ID." tone="brand" icon={<Icon name="shield" className="h-5 w-5" />} />
        <StatCard label="Email domain" value={config.domain || 'singulier.co'} hint="Used for domain-based SSO routing." tone="olive" icon={<Icon name="mail" className="h-5 w-5" />} />
        <StatCard label="Callback URL" value={callback.replace('https://', '')} hint="Register this redirect in Entra." tone="sand" icon={<Icon name="check" className="h-5 w-5" />} />
        <StatCard label="Discovery URL" value={(config.tenantId || 'organizations')} hint="OIDC metadata source for Entra." tone="amber" icon={<Icon name="globe" className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <Panel title="SSO configuration" subtitle="Configure Better Auth SSO for Microsoft Entra. These values are stored locally for now and can later be moved into secure environment variables.">
          <form className="grid gap-4 md:grid-cols-2">
            <Field label="Base URL" value={config.baseUrl} onChange={(value) => setConfig((current) => ({ ...current, baseUrl: value }))} />
            <Field label="Provider ID" value={config.providerId} onChange={(value) => setConfig((current) => ({ ...current, providerId: value }))} />
            <Field label="Email domain" value={config.domain} onChange={(value) => setConfig((current) => ({ ...current, domain: value }))} />
            <Field label="Tenant ID" value={config.tenantId} onChange={(value) => setConfig((current) => ({ ...current, tenantId: value }))} placeholder="organizations or tenant GUID" />
            <Field label="Issuer" value={config.issuer} onChange={(value) => setConfig((current) => ({ ...current, issuer: value }))} className="md:col-span-2" />
            <Field label="Callback path" value={config.callbackPath} onChange={(value) => setConfig((current) => ({ ...current, callbackPath: value }))} className="md:col-span-2" />
          </form>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white/75 px-4 py-3">
            <div className="text-sm text-stone-600">Changes are saved locally in the browser so you can iterate on the setup before wiring the backend.</div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-[#efe7da] px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-[#e6dccb]"
              onClick={() => {
                saveAdminConfig(config)
                setSavedState('Saved')
                window.setTimeout(() => setSavedState(''), 1600)
              }}
            >
              <Icon name="check" className="h-4 w-4" />
              {savedState || 'Save locally'}
            </button>
          </div>
        </Panel>

        <Panel title="Implementation snippets" subtitle="Starter code for Better Auth SSO registration and client sign-in.">
          <Snippet title="Server" code={serverSnippet} />
          <div className="mt-4" />
          <Snippet title="Client" code={clientSnippet} />
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white/75 px-4 py-3 text-sm text-stone-600">
            OIDC discovery: <span className="font-medium text-stone-800">{discoveryUrl}</span>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, className = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block text-sm text-stone-700 ${className}`}>
      <span className="mb-2 block font-medium">{label}</span>
      <input className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Snippet({ title, code }: { title: string; code: string }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-stone-800">{title}</div>
      <pre className="overflow-auto rounded-2xl border border-stone-200 bg-[#f7f3eb] p-4 text-xs leading-6 text-stone-700"><code>{code}</code></pre>
    </div>
  )
}
