export type VertexRole = 'viewer' | 'editor' | 'admin'

export type AppSection = 'freelancers' | 'feedback' | 'projects' | 'admin'

const sectionRoles: Record<AppSection, VertexRole[]> = {
  freelancers: ['viewer', 'editor', 'admin'],
  feedback: ['viewer', 'editor', 'admin'],
  projects: ['viewer', 'editor', 'admin'],
  admin: ['admin'],
}

const routeRoles: Array<{ pattern: RegExp; roles: VertexRole[] }> = [
  { pattern: /^\/admin/, roles: ['admin'] },
  { pattern: /^\/imports$/, roles: ['editor', 'admin'] },
  { pattern: /^\/notifications$/, roles: ['editor', 'admin'] },
  { pattern: /^\/financials$/, roles: ['editor', 'admin'] },
  { pattern: /^\/onboarding$/, roles: ['editor', 'admin'] },
]

export function canAccessSection(roles: VertexRole[], section: AppSection) {
  if (roles.includes('admin')) return true
  return sectionRoles[section].some((role) => roles.includes(role))
}

export function canAccessPath(roles: VertexRole[], pathname: string) {
  if (roles.includes('admin')) return true

  const match = routeRoles.find((entry) => entry.pattern.test(pathname))
  if (!match) return true
  return match.roles.some((role) => roles.includes(role))
}

export function highestRole(roles: VertexRole[]): VertexRole {
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('editor')) return 'editor'
  return 'viewer'
}
