import type {
  Allocation,
  Freelancer,
  NewAllocationInput,
  NewFreelancerInput,
  NewProjectInput,
  Project,
} from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

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

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
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

// Freelancers

export async function fetchFreelancers(): Promise<Freelancer[]> {
  const response = await fetch(`${API_BASE}/freelancers`)
  const rows = await parseJson<ApiFreelancerRow[]>(response)
  return rows.map(mapFreelancer)
}

export async function createFreelancer(input: NewFreelancerInput): Promise<Freelancer> {
  const response = await fetch(`${API_BASE}/freelancers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(freelancerPayload(input)),
  })
  const row = await parseJson<ApiFreelancerRow>(response)
  return mapFreelancer(row)
}

export async function updateFreelancer(
  id: string,
  input: NewFreelancerInput,
): Promise<Freelancer> {
  const response = await fetch(`${API_BASE}/freelancers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(freelancerPayload(input)),
  })
  const row = await parseJson<ApiFreelancerRow>(response)
  return mapFreelancer(row)
}

export async function deleteFreelancer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/freelancers/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Delete freelancer failed with status ${response.status}`)
  }
}

// Projects

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects`)
  const rows = await parseJson<ApiProjectRow[]>(response)
  return rows.map(mapProject)
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectPayload(input)),
  })
  const row = await parseJson<ApiProjectRow>(response)
  return mapProject(row)
}

export async function updateProject(id: string, input: NewProjectInput): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectPayload(input)),
  })
  const row = await parseJson<ApiProjectRow>(response)
  return mapProject(row)
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Delete project failed with status ${response.status}`)
  }
}

// Allocations

export async function fetchAllocations(): Promise<Allocation[]> {
  const response = await fetch(`${API_BASE}/allocations`)
  const rows = await parseJson<ApiAllocationRow[]>(response)
  return rows.map(mapAllocation)
}

export async function createAllocation(input: NewAllocationInput): Promise<Allocation> {
  const response = await fetch(`${API_BASE}/allocations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allocationPayload(input)),
  })
  const row = await parseJson<ApiAllocationRow>(response)
  return mapAllocation(row)
}

export async function updateAllocation(
  id: string,
  input: NewAllocationInput,
): Promise<Allocation> {
  const response = await fetch(`${API_BASE}/allocations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allocationPayload(input)),
  })
  const row = await parseJson<ApiAllocationRow>(response)
  return mapAllocation(row)
}

export async function deleteAllocation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/allocations/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Delete allocation failed with status ${response.status}`)
  }
}
