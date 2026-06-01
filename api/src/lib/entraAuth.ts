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

export function normalizeRoleKey(role: string) {
  return role.trim().toLowerCase().replace(/[\s._-]+/g, '')
}

const ROLE_ALIASES: Record<string, VertexRole> = {
  vertexadmin: 'admin',
  admin: 'admin',
  vertexeditor: 'editor',
  editor: 'editor',
  vertexviewer: 'viewer',
  viewer: 'viewer',
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

function extractRawRoles(payload: JWTPayload): string[] {
  const fromRoles = Array.isArray(payload.roles)
    ? payload.roles.filter((role): role is string => typeof role === 'string')
    : []

  if (fromRoles.length) {
    return fromRoles
  }

  const claimRoles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  if (typeof claimRoles === 'string') {
    return [claimRoles]
  }
  if (Array.isArray(claimRoles)) {
    return claimRoles.filter((role): role is string => typeof role === 'string')
  }

  return []
}

export function mapRolesFromToken(payload: JWTPayload): VertexRole[] {
  const rawRoles = extractRawRoles(payload)

  const mapped = rawRoles
    .map((role) => ROLE_ALIASES[normalizeRoleKey(role)])
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

function decodeJwtPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const json = Buffer.from(parts[1], 'base64url').toString('utf8')
    return JSON.parse(json) as JWTPayload
  } catch {
    return null
  }
}

export async function verifyBearerToken(
  token: string,
  options?: { accessToken?: string },
): Promise<AuthenticatedUser> {
  const tenantId = getTenantId()
  const clientId = getClientId()

  if (!tenantId || !clientId) {
    throw new Error('Entra auth is not configured on the API')
  }

  const jwks = createRemoteJWKSet(
    new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`),
  )

  let payload: JWTPayload

  try {
    const verified = await jwtVerify(token, jwks, {
      issuer: issuerForTenant(tenantId),
      audience: clientId,
      clockTolerance: '5m',
    })
    payload = verified.payload
  } catch (err) {
    const hint =
      err instanceof Error
        ? err.message
        : 'Token validation failed'
    throw new Error(
      `Could not validate your Microsoft sign-in token (${hint}). Confirm ENTRA_TENANT_ID and ENTRA_CLIENT_ID on the Static Web App match the Entra app used for login.`,
    )
  }

  const email = String(
    payload.preferred_username ?? payload.email ?? payload.upn ?? '',
  ).toLowerCase()

  if (!email) {
    throw new Error('Token is missing an email claim')
  }

  let rawRoles = extractRawRoles(payload)
  let roles = mapRolesFromToken(payload)

  if (!roles.length && options?.accessToken) {
    const accessPayload = decodeJwtPayload(options.accessToken)
    if (accessPayload) {
      const accessRoles = extractRawRoles(accessPayload)
      if (accessRoles.length) {
        rawRoles = accessRoles
        roles = mapRolesFromToken(accessPayload)
      }
    }
  }

  if (!roles.length) {
    const roleHint = rawRoles.length
      ? `Roles on your token: ${rawRoles.join(', ')}. Expected values: vertex.admin, vertex.editor, or vertex.viewer.`
      : 'No roles claim was found on your Microsoft token. In Entra, add the roles optional claim to the ID token and assign an application role on the Vertex enterprise app.'
    throw new Error(`Your Entra account is not authorized for Vertex. ${roleHint}`)
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

  const accessToken = request.headers.get('x-vertex-access-token') ?? undefined

  return verifyBearerToken(match[1], { accessToken })
}

export function hasRole(user: AuthenticatedUser, allowed: VertexRole[]) {
  if (user.roles.includes('admin')) return true
  return allowed.some((role) => user.roles.includes(role))
}
