import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import type { HttpRequest } from '@azure/functions'

export type VertexRole = 'viewer' | 'editor' | 'admin'

export type AuthenticatedUser = {
  entraUserId: string
  email: string
  fullName: string
  roles: VertexRole[]
  jobTitle?: string
  department?: string
}

const ROLE_MAP: Record<string, VertexRole> = {
  'Vertex.Admin': 'admin',
  'Vertex.Editor': 'editor',
  'Vertex.Viewer': 'viewer',
  Admin: 'admin',
  Editor: 'editor',
  Viewer: 'viewer',
}

function getTenantId() {
  return process.env.ENTRA_TENANT_ID?.trim() || ''
}

function getClientId() {
  return process.env.ENTRA_CLIENT_ID?.trim() || ''
}

function issuerForTenant(tenantId: string) {
  return `https://login.microsoftonline.com/${tenantId}/v2.0`
}

function mapRoles(payload: JWTPayload): VertexRole[] {
  const rawRoles = Array.isArray(payload.roles)
    ? payload.roles.filter((role): role is string => typeof role === 'string')
  : []

  const mapped = rawRoles
    .map((role) => ROLE_MAP[role])
    .filter((role): role is VertexRole => Boolean(role))

  if (mapped.length) {
    return [...new Set(mapped)]
  }

  const email = String(payload.preferred_username ?? payload.email ?? payload.upn ?? '').toLowerCase()
  const allowedDomain = (process.env.ENTRA_ALLOWED_DOMAIN || 'singulier.co').toLowerCase()

  if (email.endsWith(`@${allowedDomain}`)) {
    return ['viewer']
  }

  return []
}

export function isAuthConfigured() {
  return Boolean(getTenantId() && getClientId())
}

export async function verifyBearerToken(token: string): Promise<AuthenticatedUser> {
  const tenantId = getTenantId()
  const clientId = getClientId()

  if (!tenantId || !clientId) {
    throw new Error('Entra auth is not configured on the API')
  }

  const jwks = createRemoteJWKSet(
    new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`),
  )

  const { payload } = await jwtVerify(token, jwks, {
    issuer: issuerForTenant(tenantId),
    audience: clientId,
  })

  const email = String(
    payload.preferred_username ?? payload.email ?? payload.upn ?? '',
  ).toLowerCase()

  if (!email) {
    throw new Error('Token is missing an email claim')
  }

  const roles = mapRoles(payload)
  if (!roles.length) {
    throw new Error('Your Entra account is not authorized for Vertex')
  }

  return {
    entraUserId: String(payload.oid ?? payload.sub ?? ''),
    email,
    fullName: String(payload.name ?? email),
    roles,
    jobTitle: typeof payload.jobTitle === 'string' ? payload.jobTitle : undefined,
    department: typeof payload.department === 'string' ? payload.department : undefined,
  }
}

export async function authenticateRequest(request: HttpRequest): Promise<AuthenticatedUser | null> {
  if (!isAuthConfigured()) {
    return null
  }

  const header = request.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    throw new Error('Missing bearer token')
  }

  return verifyBearerToken(match[1])
}

export function hasRole(user: AuthenticatedUser, allowed: VertexRole[]) {
  if (user.roles.includes('admin')) return true
  return allowed.some((role) => user.roles.includes(role))
}
