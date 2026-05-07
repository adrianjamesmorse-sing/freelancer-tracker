export type FreelancerStatus = 'Active' | 'Ending soon' | 'Open follow-up' | 'Inactive'

export type Entity = 'Squadigital FR' | 'Squadigital UK' | 'Squadigital GE' | 'JV' | 'Unspecified'

export type AllocationStatus = 'Active' | 'Extended pending close' | 'Closed'

export interface Freelancer {
  id: string
  createdAt: string
  freelancerName: string
  personalEmail: string
  phoneNumber: string
  address: string
  freelancerStatus: FreelancerStatus
  registrationNumber: boolean
  questionFlag: boolean
  comments: string
}

export interface Project {
  id: string
  projectName: string
  entity: Entity
  projectManagerName: string
  projectManagerEmail: string
}

export interface Allocation {
  id: string
  createdAt: string
  freelancerId: string
  projectId: string
  contractStartDate: string
  contractEndDate: string
  numberOfDays: number
  dailyRate: number
  dailyRateCurrency: 'EUR' | 'GBP'
  dailyRateNote: string
  roleWithinProject: string
  ownerManagerName: string
  ownerManagerEmail: string
  allocationStatus: AllocationStatus
  sourceRowId?: string
}

export interface AppNotification {
  id: string
  allocationId: string
  notificationType: 'join' | 'end_3_days' | 'end_1_day' | 'still_open_weekly'
  scheduledFor: string
  sentAt?: string
  status: 'queued' | 'sent'
  message: string
}

export interface CsvImportSummary {
  fileName: string
  processedRows: number
  addedFreelancers: number
  updatedFreelancers: number
  addedProjects: number
  updatedProjects: number
  addedAllocations: number
  skippedAllocations: number
  errors: string[]
  importedAt: string
}

export interface NewFreelancerInput {
  freelancerName: string
  personalEmail: string
  phoneNumber: string
  address: string
  freelancerStatus: FreelancerStatus
  registrationNumber: boolean
  questionFlag: boolean
  comments: string
}

export interface NewProjectInput {
  projectName: string
  entity: Entity
  projectManagerName: string
  projectManagerEmail: string
}

export interface NewAllocationInput {
  freelancerId: string
  projectId: string
  contractStartDate: string
  contractEndDate: string
  numberOfDays: number
  dailyRate: number
  dailyRateCurrency: 'EUR' | 'GBP'
  dailyRateNote: string
  roleWithinProject: string
  ownerManagerName: string
  ownerManagerEmail: string
  allocationStatus: AllocationStatus
}