import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'

type SsoConfig = {
  baseUrl: string
  providerId: string
  domain: string
  tenantId: string
  issuer: string
  clientId: string
  clientSecret: string
  scopes: string
  loginHint: string
  callbackPath: string
}

const STORAGE_KEY = 'vertex-admin-sso-config'

const defaultConfig: SsoConfig = {
  baseUrl: 'https://vertex.singulier.co',
  providerId: 'entra-singulier',
  domain: 'singulier.co',
  tenantId: 'organizations',
  issuer: 'https://login.microsoftonline.com/organizations/v2.0',
  clientId: '',
  clientSecret: '',
  scopes: 'openid profile email offline_access',
  loginHint: '',
  callbackPath: '/api/auth/sso/callback/entra-singulier',
}

export function AdminPage() {
  const [config, setConfig] = useState<SsoConfig>(() => {
    if (typeof window === 'undefined') return defaultConfig
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultConfig
    try { return { ...defaultConfig, ...JSON.parse(saved) } } catch { return defaultConfig }
  })
  const [savedState, setSavedState] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const callbackUrl = `${config.baseUrl.replace(/\/$/, '')}${config.callbackPath}`
  const oidcDiscoveryUrl = `https://login.microsoftonline.com/${config.tenantId || 'organizations'}/v2.0/.well-known/openid-configuration`

  const serverSnippet = useMemo(
    () => `import { betterAuth } from "better-auth"
import { sso } from "@better-auth/sso"

export const auth = betterAuth({
  plugins: [sso()]
})

// Register an OIDC provider
await auth.api.registerSSOProvider({
  body: {
    providerId: "${config.providerId}",
    issuer: "${config.issuer}",
    domain: "${config.domain}",
    oidcConfig: {
      discoveryUrl: "${oidcDiscoveryUrl}",
      clientId: process.env.ENTRA_CLIENT_ID!,
      clientSecret: process.env.ENTRA_CLIENT_SECRET!,
      scopes: ${JSON.stringify(config.scopes.split(/\s+/).filter(Boolean))}
    }
  }
})`,
    [config, oidcDiscoveryUrl],
  )

  const clientSnippet = useMemo(
    () => `import { createAuthClient } from "better-auth/client"
import { ssoClient } from "@better-auth/sso/client"

export const authClient = createAuthClient({
  plugins: [ssoClient()]
})

await authClient.signIn.sso({
  domain: "${config.domain}",
  providerId: "${config.providerId}",
  callbackURL: "/",
  ${config.loginHint ? `loginHint: "${config.loginHint}",
  ` : ''}})`,
    [config],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Plugin package" value="@better-auth/sso" hint="Add the Better Auth SSO plugin server-side." tone="brand" icon={<Icon name="shield" className="h-5 w-5" />} />
        <StatCard label="Client plugin" value="ssoClient()" hint="Needed in the auth client for sign-in." tone="olive" icon={<Icon name="check" className="h-5 w-5" />} />
        <StatCard label="Callback URL" value={callbackUrl.replace('https://', '')} hint="Auto-generated from provider ID and base path." tone="sand" icon={<Icon name="mail" className="h-5 w-5" />} />
        <StatCard label="Sign-in routing" value={config.domain || '—'} hint="Users can sign in through domain or provider matching." tone="amber" icon={<Icon name="apps" className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <Panel title="Entra SSO configuration" subtitle="Local configuration helper for wiring Vertex to Microsoft Entra via Better Auth SSO.">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Base URL', 'baseUrl'],
              ['Provider ID', 'providerId'],
              ['Email domain', 'domain'],
              ['Tenant ID', 'tenantId'],
              ['Issuer', 'issuer'],
              ['Client ID', 'clientId'],
              ['Client secret', 'clientSecret'],
              ['Scopes', 'scopes'],
              ['Login hint', 'loginHint'],
              ['Callback path', 'callbackPath'],
            ].map(([label, key]) => (
              <label key={key} className="block text-sm text-stone-700">
                <span className="mb-2 block font-medium">{label}</span>
                <input
                  type="text"
                  value={config[key as keyof SsoConfig]}
                  onChange={(event) => setConfig((current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 shadow-sm"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600">
            <div>Saved locally in the browser to help you stage the Entra config before backend wiring.</div>
            <button type="button" onClick={() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); setSavedState('Saved'); setTimeout(() => setSavedState(''), 1200) }} className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-[#efe7da] px-4 py-2 font-medium text-stone-800 transition hover:bg-[#e6dccb]">
              <Icon name="check" className="h-4 w-4" /> Save
            </button>
          </div>
          {savedState ? <div className="mt-2 text-sm text-olive-700">Saved locally.</div> : null}
        </Panel>

        <Panel title="Better Auth implementation guide" subtitle="What Vertex needs on the backend to complete Entra SSO.">
          <ol className="space-y-3 text-sm leading-6 text-stone-700">
            <li>1. Install <code>@better-auth/sso</code> and add <code>sso()</code> to the Better Auth server plugins.</li>
            <li>2. Run the Better Auth migration/generation so the SSO tables and fields exist.</li>
            <li>3. Register an OIDC SSO provider for Entra with a provider ID, domain, issuer, and discovery URL.</li>
            <li>4. Add <code>ssoClient()</code> to the auth client and call <code>signIn.sso()</code> using the domain or provider ID.</li>
            <li>5. Set the Entra app redirect URI to the generated callback URL shown here.</li>
          </ol>
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white/80 p-4 text-sm text-stone-700">
            <div className="font-medium text-stone-900">Entra OIDC discovery URL</div>
            <div className="mt-2 break-all text-stone-600">{oidcDiscoveryUrl}</div>
            <div className="mt-4 font-medium text-stone-900">Callback URL</div>
            <div className="mt-2 break-all text-stone-600">{callbackUrl}</div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CodePanel title="Server snippet" code={serverSnippet} />
        <CodePanel title="Client snippet" code={clientSnippet} />
      </div>
    </div>
  )
}

function CodePanel({ title, code }: { title: string; code: string }) {
  return (
    <Panel title={title} subtitle="Generated from the form above so the admin page doubles as a setup helper.">
      <pre className="overflow-auto rounded-2xl border border-stone-200 bg-[#f8f3ea] p-4 text-xs leading-6 text-stone-700"><code>{code}</code></pre>
    </Panel>
  )
}
