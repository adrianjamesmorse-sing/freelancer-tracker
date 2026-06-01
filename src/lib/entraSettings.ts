import { loadAdminConfig } from './adminConfig'
import { fetchAuthConfig, type AuthConfig } from './authApi'

export type EntraClientSettings = {
  clientId: string
  tenantId: string
  domain: string
  redirectUri: string
}

let remoteConfig: AuthConfig | null = null
let loadPromise: Promise<void> | null = null

/** Load Entra IDs from the API when VITE_* build vars are not set (Azure SWA application settings). */
export async function ensureEntraSettingsLoaded() {
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const envClientId = import.meta.env.VITE_ENTRA_CLIENT_ID?.trim()
    const envTenantId = import.meta.env.VITE_ENTRA_TENANT_ID?.trim()
    if (envClientId && envTenantId) return

    try {
      remoteConfig = await fetchAuthConfig()
    } catch {
      remoteConfig = null
    }
  })()

  return loadPromise
}

export function getEntraClientSettings(): EntraClientSettings {
  const admin = loadAdminConfig()
  const clientId =
    import.meta.env.VITE_ENTRA_CLIENT_ID?.trim() ||
    remoteConfig?.clientId?.trim() ||
    admin.clientId
  const tenantId =
    import.meta.env.VITE_ENTRA_TENANT_ID?.trim() ||
    remoteConfig?.tenantId?.trim() ||
    admin.tenantId
  const domain =
    import.meta.env.VITE_ENTRA_ALLOWED_DOMAIN?.trim() ||
    remoteConfig?.domain?.trim() ||
    admin.domain

  return {
    clientId,
    tenantId,
    domain,
    redirectUri:
      import.meta.env.VITE_ENTRA_REDIRECT_URI?.trim() ||
      `${window.location.origin}/login`,
  }
}

export function isAuthDisabled() {
  return import.meta.env.VITE_AUTH_DISABLED === 'true'
}

export function isEntraConfigured() {
  const settings = getEntraClientSettings()
  return Boolean(settings.clientId && settings.tenantId)
}
