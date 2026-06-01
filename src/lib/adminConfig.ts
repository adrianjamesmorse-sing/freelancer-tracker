export type VertexAdminConfig = {
  baseUrl: string
  providerId: string
  domain: string
  tenantId: string
  issuer: string
  clientId: string
  clientSecret: string
  graphAppPermissions: string[]
  graphScopes: string
  callbackPath: string
  graphNotes: string
}

export const ADMIN_STORAGE_KEY = 'vertex-admin-config-v2'

export const defaultAdminConfig: VertexAdminConfig = {
  baseUrl: 'https://vertex.singulier.co',
  providerId: 'entra-singulier',
  domain: 'singulier.co',
  tenantId: '',
  issuer: 'https://login.microsoftonline.com/organizations/v2.0',
  clientId: '',
  clientSecret: '',
  graphAppPermissions: ['User.Read.All', 'ProfilePhoto.Read.All'],
  graphScopes: 'https://graph.microsoft.com/.default',
  callbackPath: '/login',
  graphNotes: '',
}

export function loadAdminConfig(): VertexAdminConfig {
  if (typeof window === 'undefined') return defaultAdminConfig
  const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY)
  if (!raw) return defaultAdminConfig
  try {
    return { ...defaultAdminConfig, ...JSON.parse(raw) }
  } catch {
    return defaultAdminConfig
  }
}

export function saveAdminConfig(config: VertexAdminConfig) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(config))
}

export function callbackUrl(config: VertexAdminConfig) {
  return `${config.baseUrl.replace(/\/$/, '')}${config.callbackPath}`
}

export function oidcDiscoveryUrl(config: VertexAdminConfig) {
  return `https://login.microsoftonline.com/${config.tenantId || 'organizations'}/v2.0/.well-known/openid-configuration`
}
