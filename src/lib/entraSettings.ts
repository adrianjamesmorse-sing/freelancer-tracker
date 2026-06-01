import { loadAdminConfig } from './adminConfig'

export type EntraClientSettings = {
  clientId: string
  tenantId: string
  domain: string
  redirectUri: string
}

export function getEntraClientSettings(): EntraClientSettings {
  const admin = loadAdminConfig()
  const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID?.trim() || admin.clientId
  const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID?.trim() || admin.tenantId
  const domain = import.meta.env.VITE_ENTRA_ALLOWED_DOMAIN?.trim() || admin.domain

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
