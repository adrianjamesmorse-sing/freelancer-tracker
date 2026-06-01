import type { VertexRole } from './accessControl'

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

export function extractRoleStrings(claims: Record<string, unknown> | undefined | null): string[] {
  if (!claims) return []

  const roles = claims.roles
  if (Array.isArray(roles)) {
    return roles.filter((role): role is string => typeof role === 'string')
  }
  if (typeof roles === 'string') {
    return [roles]
  }

  const claimRoles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  if (typeof claimRoles === 'string') return [claimRoles]
  if (Array.isArray(claimRoles)) {
    return claimRoles.filter((role): role is string => typeof role === 'string')
  }

  return []
}

export function mapRoleStrings(rawRoles: string[]): VertexRole[] {
  const mapped = rawRoles
    .map((role) => ROLE_ALIASES[normalizeRoleKey(role)])
    .filter((role): role is VertexRole => Boolean(role))

  return [...new Set(mapped)]
}

export function mapRolesFromClaims(claims: Record<string, unknown> | undefined | null): VertexRole[] {
  return mapRoleStrings(extractRoleStrings(claims))
}
