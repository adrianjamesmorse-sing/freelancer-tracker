import type { Freelancer, Project } from '../types'

export const REQUEST_STAGES = [
  'New',
  'Contract Pending',
  'Assigned to Project',
  'IT Setup',
  'Onboarding',
  'Complete',
] as const

export type RequestStage = (typeof REQUEST_STAGES)[number]
export type RequestCurrency = 'EUR' | 'GBP' | 'USD' | 'CHF'

export interface FreelancerRequestRecord {
  id: string
  submittedAt: string
  requesterName: string
  requesterEmail: string
  projectId: string
  projectName: string
  projectEntity: string
  projectStartDate?: string | null
  projectEndDate?: string | null
  hasWorkedWithUsBefore: boolean
  existingFreelancerId?: string
  freelancerName: string
  personalEmail: string
  phoneNumber: string
  country: string
  address: string
  registrationNumber: boolean
  freelancerStatus: 'Pending' | 'Complete'
  roleWithinProject: string
  contractStartDate: string
  contractEndDate: string
  numberOfDays: number
  dailyRate: number
  dailyRateCurrency: RequestCurrency
  comments: string
  stage: RequestStage
}

export interface NewFreelancerRequestInput {
  requesterName: string
  requesterEmail: string
  projectId: string
  hasWorkedWithUsBefore: boolean
  existingFreelancerId?: string
  freelancerName: string
  personalEmail: string
  phoneNumber: string
  country: string
  address: string
  registrationNumber: boolean
  roleWithinProject: string
  contractStartDate: string
  contractEndDate: string
  numberOfDays: number
  dailyRate: number
  dailyRateCurrency: RequestCurrency
  comments: string
}

const STORAGE_KEY = 'vertex-freelancer-requests-v2'

export function loadFreelancerRequests(): FreelancerRequestRecord[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as FreelancerRequestRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveFreelancerRequests(records: FreelancerRequestRecord[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function createFreelancerRequest(
  input: NewFreelancerRequestInput,
  project: Project,
  existingFreelancer?: Freelancer,
): FreelancerRequestRecord {
  const freelancerName = existingFreelancer?.freelancerName || input.freelancerName
  const personalEmail = existingFreelancer?.personalEmail || input.personalEmail
  const phoneNumber = existingFreelancer?.phoneNumber || input.phoneNumber
  const country = existingFreelancer?.country || input.country
  const address = existingFreelancer?.address || input.address

  const projectWithDates = project as Project & {
    startDate?: string | null
    endDate?: string | null
  }

  return {
    id: generateId(),
    submittedAt: new Date().toISOString(),
    requesterName: input.requesterName.trim(),
    requesterEmail: input.requesterEmail.trim(),
    projectId: project.id,
    projectName: project.projectName,
    projectEntity: project.entity,
    projectStartDate: projectWithDates.startDate ?? null,
    projectEndDate: projectWithDates.endDate ?? null,
    hasWorkedWithUsBefore: input.hasWorkedWithUsBefore,
    existingFreelancerId: existingFreelancer?.id || input.existingFreelancerId,
    freelancerName,
    personalEmail,
    phoneNumber,
    country,
    address,
    registrationNumber: input.registrationNumber,
    freelancerStatus: 'Pending',
    roleWithinProject: input.roleWithinProject.trim(),
    contractStartDate: input.contractStartDate,
    contractEndDate: input.contractEndDate,
    numberOfDays: input.numberOfDays,
    dailyRate: input.dailyRate,
    dailyRateCurrency: input.dailyRateCurrency,
    comments: input.comments.trim(),
    stage: 'New',
  }
}

export function moveRequestForward(
  records: FreelancerRequestRecord[],
  id: string,
): FreelancerRequestRecord[] {
  return records.map((record) => {
    if (record.id !== id) return record
    const currentIndex = REQUEST_STAGES.indexOf(record.stage)
    const nextStage = REQUEST_STAGES[Math.min(currentIndex + 1, REQUEST_STAGES.length - 1)]
    return {
      ...record,
      stage: nextStage,
      freelancerStatus: nextStage === 'Complete' ? 'Complete' : 'Pending',
    }
  })
}

export function moveRequestBackward(
  records: FreelancerRequestRecord[],
  id: string,
): FreelancerRequestRecord[] {
  return records.map((record) => {
    if (record.id !== id) return record
    const currentIndex = REQUEST_STAGES.indexOf(record.stage)
    const nextStage = REQUEST_STAGES[Math.max(currentIndex - 1, 0)]
    return {
      ...record,
      stage: nextStage,
      freelancerStatus: nextStage === 'Complete' ? 'Complete' : 'Pending',
    }
  })
}

export function deleteRequest(
  records: FreelancerRequestRecord[],
  id: string,
): FreelancerRequestRecord[] {
  return records.filter((record) => record.id !== id)
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `request-${Math.random().toString(36).slice(2, 10)}`
}
