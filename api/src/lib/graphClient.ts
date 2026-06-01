type GraphUser = {
  id: string
  displayName?: string
  givenName?: string
  surname?: string
  mail?: string | null
  userPrincipalName?: string
  jobTitle?: string | null
  department?: string | null
  officeLocation?: string | null
  mobilePhone?: string | null
  businessPhones?: string[]
}

type GraphUsersResponse = {
  value: GraphUser[]
  '@odata.nextLink'?: string
}

export async function getGraphAccessToken() {
  const tenantId = process.env.ENTRA_TENANT_ID?.trim()
  const clientId = process.env.ENTRA_CLIENT_ID?.trim()
  const clientSecret = process.env.ENTRA_CLIENT_SECRET?.trim()
  const scope = process.env.ENTRA_GRAPH_SCOPE?.trim() || 'https://graph.microsoft.com/.default'

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('ENTRA_TENANT_ID, ENTRA_CLIENT_ID, and ENTRA_CLIENT_SECRET are required for Graph sync')
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope,
    grant_type: 'client_credentials',
  })

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    },
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Graph token request failed (${response.status}): ${details}`)
  }

  const payload = (await response.json()) as { access_token?: string }
  if (!payload.access_token) {
    throw new Error('Graph token response did not include access_token')
  }

  return payload.access_token
}

export async function fetchAllStaffUsers(accessToken: string) {
  const users: GraphUser[] = []
  let url =
    'https://graph.microsoft.com/v1.0/users?$select=id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,mobilePhone,businessPhones,officeLocation,department&$top=100'

  while (url) {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      const details = await response.text()
      throw new Error(`Graph users request failed (${response.status}): ${details}`)
    }

    const payload = (await response.json()) as GraphUsersResponse
    users.push(...payload.value)
    url = payload['@odata.nextLink'] ?? ''
  }

  return users
}

export function toStaffRecord(user: GraphUser) {
  const email = String(user.mail ?? user.userPrincipalName ?? '').toLowerCase()
  const fullName =
    user.displayName?.trim() ||
    [user.givenName, user.surname].filter(Boolean).join(' ').trim() ||
    email

  return {
    entraUserId: user.id,
    email,
    fullName,
    jobTitle: user.jobTitle ?? null,
    department: user.department ?? null,
    officeLocation: user.officeLocation ?? null,
    mobilePhone: user.mobilePhone ?? user.businessPhones?.[0] ?? null,
    userPrincipalName: user.userPrincipalName ?? null,
  }
}
