export type FreelancerStatus = 'Active' | 'Ending soon' | 'Open follow-up' | 'Inactive'

export type Entity =
  | 'Squadigital FR'
  | 'Squadigital UK'
  | 'Squadigital GE'
  | 'Squadigital DE'
  | 'JV'
  | 'Unspecified'

export type SupportedCurrency = 'EUR' | 'GBP' | 'USD' | 'CHF'

export type AllocationStatus = 'Active' | 'Extended pending close' | 'Closed'

export type NotificationStatus = 'queued' | 'sent'

export type NotificationType =
  | 'join'
  | 'end_3_days'
  | 'end_1_day'
  | 'still_open_weekly'

export type NotificationTrigger =
  | 'join'
  | 'end_3_days'
  | 'end_1_day'
  | 'still_open_weekly'
  | 'custom'

export type NotificationCadence =
  | 'Immediate'
  | 'Daily digest'
  | 'Weekly digest'
  | 'Manual review'

export type NotificationRecipient =
  | 'Owner manager'
  | 'Project manager'
  | 'Ops'
  | 'Finance'
  | 'Custom recipients'

export interface Freelancer {
  id: string
  createdAt: string
  freelancerName: string
  personalEmail: string
  phoneNumber: string
  address: string
  country: string
  freelancerStatus: FreelancerStatus
  registrationNumber: boolean
  questionFlag: boolean
  comments: string
}

export interface NewFreelancerInput {
  freelancerName: string
  personalEmail: string
  phoneNumber: string
  address: string
  country: string
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
  status?: string
  startDate?: string | null
  endDate?: string | null
}

export interface NewProjectInput {
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
  dailyRateCurrency: SupportedCurrency
  dailyRateNote: string
  roleWithinProject: string
  ownerManagerName: string
  ownerManagerEmail: string
  allocationStatus: AllocationStatus
  sourceRowId?: string
}

export interface NewAllocationInput {
  freelancerId: string
  projectId: string
  contractStartDate: string
  contractEndDate: string
  numberOfDays: number
  dailyRate: number
  dailyRateCurrency: SupportedCurrency
  dailyRateNote: string
  roleWithinProject: string
  ownerManagerName: string
  ownerManagerEmail: string
  allocationStatus: AllocationStatus
}

export interface AppNotification {
  id: string
  allocationId: string
  notificationType: NotificationType
  scheduledFor: string
  sentAt?: string
  status: NotificationStatus
  subject: string
  message: string
  recipientsPreview?: string[]
}

export interface NotificationRule {
  id: string
  name: string
  description: string
  triggerType: NotificationTrigger
  cadence: NotificationCadence
  recipientTypes: NotificationRecipient[]
  customRecipients: string
  subject: string
  body: string
  enabled: boolean
}

export interface NewNotificationRuleInput {
  name: string
  description: string
  triggerType: NotificationTrigger
  cadence: NotificationCadence
  recipientTypes: NotificationRecipient[]
  customRecipients: string
  subject: string
  body: string
  enabled: boolean
}

export interface CsvImportSummary {
  fileName: string | null
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

export interface MappedCsvRow {
  id?: string
  timestamp?: string
  projectManagerEmail?: string
  projectManagerName?: string
  freelancerName?: string
  projectName?: string
  entity?: Entity | string
  contractStartDate?: string
  contractEndDate?: string
  numberOfDays?: number
  dailyRate?: number
  dailyRateCurrency?: SupportedCurrency
  dailyRateNote?: string
  roleWithinProject?: string
  registrationNumber?: boolean
  personalEmail?: string
  phoneNumber?: string
  address?: string
  country?: string
  freelancerStatus?: FreelancerStatus
  questionFlag?: boolean
  comments?: string
}
