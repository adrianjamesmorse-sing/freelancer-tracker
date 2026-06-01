import type { VertexRole } from './accessControl'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export type AuthUser = {
  entraUserId?: string
  email: string
  fullName: string
  roles: VertexRole[]
  jobTitle?: string | null
  department?: string | null
}

export type AuthConfig = {
  configured: boolean
  tenantId: string
  clientId: string
  domain: string
  scopes: string[]
  redirectPath: string
  roleMapping: Record<string, VertexRole>
}

export type StaffMember = {
  id: string
  entraUserId: string | null
  email: string
  fullName: string
  jobTitle: string | null
  department: string | null
  officeLocation: string | null
  mobilePhone: string | null
  userPrincipalName: string | null
  photoUrl: string | null
  isActive: boolean
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export function fetchAuthConfig() {
  return apiFetch<AuthConfig>('/auth/config')
}

export function fetchAuthMe(idToken: string) {
  return apiFetch<{ authenticated: boolean; devMode?: boolean; user: AuthUser }>('/auth/me', {
    headers: { authorization: `Bearer ${idToken}` },
  })
}

export function fetchStaff(idToken?: string) {
  return apiFetch<StaffMember[]>('/staff', {
    headers: idToken ? { authorization: `Bearer ${idToken}` } : {},
  })
}

export function syncStaffFromEntra(idToken: string) {
  return apiFetch<{ synced: number; skipped: number; total: number }>('/staff/sync', {
    method: 'POST',
    headers: { authorization: `Bearer ${idToken}` },
  })
}
