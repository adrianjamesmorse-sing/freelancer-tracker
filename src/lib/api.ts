import type {
  Allocation,
  CsvImportSummary,
  Freelancer,
  NewAllocationInput,
  NewFreelancerInput,
  NewProjectInput,
  Project,
} from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

type ApiOptions = {
  idToken?: string | null
}

type ApiFreelancerRow = {
  id: string
  created_at: string
  freelancer_name: string
  personal_email: string | null
  phone_number: string | null
  address: string | null
  country: string | null
  freelancer_status: Freelancer['freelancerStatus']
  registration_number: boolean
  question_flag: boolean
  comments: string | null
}

type ApiProjectRow = {
  id: string
  created_at?: string
  project_name: string
  entity: string
  project_manager_name: string
  project_manager_email: string
  status?: string
  start_date?: string | null
  end_date?: string | null
}

type ApiAllocationRow = {
  id: string
  created_at: string
  freelancer_id: string
  project_id: string
  contract_start_date: string
  contract_end_date: string
  number_of_days: number | null
  daily_rate: number | null
  daily_rate_currency: Allocation['dailyRateCurrency'] | null
  daily_rate_note: string | null
  role_within_project: string | null
  owner_manager_name: string | null
  owner_manager_email: string | null
  allocation_status: Allocation['allocationStatus']
}

function authHeaders(options?: ApiOptions): HeadersInit {
  if (!options?.idToken) return {}
  return {
    authorization: `Bearer ${options.idToken}`,
    'x-vertex-id-token': options.idToken,
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; details?: unknown }
      | null
    const details = typeof payload?.details === 'string' ? `: ${payload.details}` : ''
    throw new Error(payload?.error ? `${payload.error}${details}` : `Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

function mapFreelancer(row: ApiFreelancerRow): Freelancer {
  return {
    id: row.id,
    createdAt: row.created_at,
    freelancerName: row.freelancer_name,
    personalEmail: row.personal_email ?? '',
    phoneNumber: row.phone_number ?? '',
    address: row.address ?? '',
    country: row.country ?? '',
    freelancerStatus: row.freelancer_status,
    registrationNumber: row.registration_number,
    questionFlag: row.question_flag,
    comments: row.comments ?? '',
  }
}

function mapProject(row: ApiProjectRow): Project {
  return {
    id: row.id,
    projectName: row.project_name,
    entity: row.entity as Project['entity'],
    projectManagerName: row.project_manager_name,
    projectManagerEmail: row.project_manager_email,
    ...(row.status ? { status: row.status } : {}),
    ...(row.start_date !== undefined ? { startDate: row.start_date } : {}),
    ...(row.end_date !== undefined ? { endDate: row.end_date } : {}),
  } as Project
}

function mapAllocation(row: ApiAllocationRow): Allocation {
  return {
    id: row.id,
    createdAt: row.created_at,
    freelancerId: row.freelancer_id,
    projectId: row.project_id,
    contractStartDate: row.contract_start_date,
    contractEndDate: row.contract_end_date,
    numberOfDays: row.number_of_days ?? 0,
    dailyRate: row.daily_rate ?? 0,
    dailyRateCurrency: (row.daily_rate_currency ?? 'EUR') as Allocation['dailyRateCurrency'],
    dailyRateNote: row.daily_rate_note ?? '',
    roleWithinProject: row.role_within_project ?? '',
    ownerManagerName: row.owner_manager_name ?? '',
    ownerManagerEmail: row.owner_manager_email ?? '',
    allocationStatus: row.allocation_status,
  }
}

function freelancerPayload(input: NewFreelancerInput) {
  return {
    freelancerName: input.freelancerName,
    personalEmail: input.personalEmail,
    phoneNumber: input.phoneNumber,
    address: input.address,
    country: input.country,
    freelancerStatus: input.freelancerStatus,
    registrationNumber: input.registrationNumber,
    questionFlag: input.questionFlag,
    comments: input.comments,
  }
}

function projectPayload(input: NewProjectInput) {
  return {
    projectName: input.projectName,
    entity: input.entity,
    projectManagerName: input.projectManagerName,
    projectManagerEmail: input.projectManagerEmail,
  }
}

function allocationPayload(input: NewAllocationInput) {
  return {
    freelancerId: input.freelancerId,
    projectId: input.projectId,
    contractStartDate: input.contractStartDate,
    contractEndDate: input.contractEndDate,
    numberOfDays: input.numberOfDays,
    dailyRate: input.dailyRate,
    dailyRateCurrency: input.dailyRateCurrency,
    dailyRateNote: input.dailyRateNote,
    roleWithinProject: input.roleWithinProject,
    ownerManagerName: input.ownerManagerName,
    ownerManagerEmail: input.ownerManagerEmail,
    allocationStatus: input.allocationStatus,
  }
}

export async function fetchFreelancers(options?: ApiOptions): Promise<Freelancer[]> {
  const response = await fetch(`${API_BASE}/freelancers`, {
    headers: authHeaders(options),
  })
  const rows = await parseJson<ApiFreelancerRow[]>(response)
  return rows.map(mapFreelancer)
}

export async function createFreelancer(input: NewFreelancerInput, options?: ApiOptions): Promise<Freelancer> {
  const response = await fetch(`${API_BASE}/freelancers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(options) },
    body: JSON.stringify(freelancerPayload(input)),
  })
  const row = await parseJson<ApiFreelancerRow>(response)
  return mapFreelancer(row)
}

export async function updateFreelancer(id: string, input: NewFreelancerInput, options?: ApiOptions): Promise<Freelancer> {
  const response = await fetch(`${API_BASE}/freelancers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(options) },
    body: JSON.stringify(freelancerPayload(input)),
  })
  const row = await parseJson<ApiFreelancerRow>(response)
  return mapFreelancer(row)
}

export async function deleteFreelancer(id: string, options?: ApiOptions): Promise<void> {
  const response = await fetch(`${API_BASE}/freelancers/${id}`, {
    method: 'DELETE',
    headers: authHeaders(options),
  })
  if (!response.ok) {
    await parseJson<never>(response)
  }
}

export async function fetchProjects(options?: ApiOptions): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects`, {
    headers: authHeaders(options),
  })
  const rows = await parseJson<ApiProjectRow[]>(response)
  return rows.map(mapProject)
}

export async function createProject(input: NewProjectInput, options?: ApiOptions): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(options) },
    body: JSON.stringify(projectPayload(input)),
  })
  const row = await parseJson<ApiProjectRow>(response)
  return mapProject(row)
}

export async function updateProject(id: string, input: NewProjectInput, options?: ApiOptions): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(options) },
    body: JSON.stringify(projectPayload(input)),
  })
  const row = await parseJson<ApiProjectRow>(response)
  return mapProject(row)
}

export async function deleteProject(id: string, options?: ApiOptions): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(options),
  })
  if (!response.ok) {
    await parseJson<never>(response)
  }
}

export async function fetchAllocations(options?: ApiOptions): Promise<Allocation[]> {
  const response = await fetch(`${API_BASE}/allocations`, {
    headers: authHeaders(options),
  })
  const rows = await parseJson<ApiAllocationRow[]>(response)
  return rows.map(mapAllocation)
}

export async function createAllocation(input: NewAllocationInput, options?: ApiOptions): Promise<Allocation> {
  const response = await fetch(`${API_BASE}/allocations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(options) },
    body: JSON.stringify(allocationPayload(input)),
  })
  const row = await parseJson<ApiAllocationRow>(response)
  return mapAllocation(row)
}

export async function updateAllocation(id: string, input: NewAllocationInput, options?: ApiOptions): Promise<Allocation> {
  const response = await fetch(`${API_BASE}/allocations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(options) },
    body: JSON.stringify(allocationPayload(input)),
  })
  const row = await parseJson<ApiAllocationRow>(response)
  return mapAllocation(row)
}

export async function deleteAllocation(id: string, options?: ApiOptions): Promise<void> {
  const response = await fetch(`${API_BASE}/allocations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(options),
  })
  if (!response.ok) {
    await parseJson<never>(response)
  }
}

export async function importFormsFreelancersCsv(file: File, options?: ApiOptions): Promise<CsvImportSummary> {
  const bytes = await file.arrayBuffer()
  const base64 = btoa(
    Array.from(new Uint8Array(bytes))
      .map((byte) => String.fromCharCode(byte))
      .join(''),
  )

  const response = await fetch(`${API_BASE}/imports/forms-freelancers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(options) },
    body: JSON.stringify({
      fileName: file.name,
      csvBase64: base64,
    }),
  })

  return parseJson<CsvImportSummary>(response)
}
