import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  allocations as seedAllocations,
  freelancers as seedFreelancers,
  notificationRules as seedNotificationRules,
  notifications as seedNotifications,
  projects as seedProjects,
} from '../data/mockData'
import { mapCsvRows, normalizeKey } from '../lib/csv'
import { daysUntil } from '../lib/format'
import type {
  Allocation,
  AppNotification,
  CsvImportSummary,
  Freelancer,
  NewAllocationInput,
  NewFreelancerInput,
  NewNotificationRuleInput,
  NewProjectInput,
  NotificationRule,
  Project,
} from '../types'

interface TrackerContextValue {
  freelancers: Freelancer[]
  projects: Project[]
  allocations: Allocation[]
  notifications: AppNotification[]
  notificationRules: NotificationRule[]
  enrichedAllocations: Array<Allocation & { freelancer: Freelancer; project: Project; daysRemaining: number }>
  dashboard: {
    activeFreelancers: number
    endingIn3Days: number
    endingIn1Day: number
    openFollowUps: number
    recentlyJoined: number
    enabledNotificationRules: number
  }
  lastImportSummary: CsvImportSummary | null
  addFreelancer: (input: NewFreelancerInput) => { success: boolean; message: string }
  removeFreelancer: (id: string) => void
  addProject: (input: NewProjectInput) => { success: boolean; message: string }
  removeProject: (id: string) => void
  addAllocation: (input: NewAllocationInput) => { success: boolean; message: string }
  removeAllocation: (id: string) => void
  addNotificationRule: (input: NewNotificationRuleInput) => { success: boolean; message: string }
  updateNotificationRule: (id: string, input: NewNotificationRuleInput) => { success: boolean; message: string }
  removeNotificationRule: (id: string) => void
  toggleNotificationRule: (id: string) => void
  importCsvFile: (file: File) => Promise<CsvImportSummary>
  getFreelancerById: (id: string) => Freelancer | undefined
  getProjectById: (id: string) => Project | undefined
  getAllocationsForFreelancer: (freelancerId: string) => Allocation[]
  getAllocationsForProject: (projectId: string) => Allocation[]
}

interface TrackerStore {
  freelancers: Freelancer[]
  projects: Project[]
  allocations: Allocation[]
  notifications: AppNotification[]
  notificationRules: NotificationRule[]
  lastImportSummary: CsvImportSummary | null
}

const STORAGE_KEY = 'freelancer-tracker-store-v2'
const TrackerContext = createContext<TrackerContextValue | null>(null)

export function TrackerProvider({ children }: PropsWithChildren) {
  const [store, setStore] = useState<TrackerStore>(() => {
    const seed = getSeedStore()
    if (typeof window === 'undefined') return seed

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return seed

    try {
      return ensureStoreShape(JSON.parse(saved), seed)
    } catch {
      return seed
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const freelancerMap = useMemo(() => new Map(store.freelancers.map((item) => [item.id, item])), [store.freelancers])
  const projectMap = useMemo(() => new Map(store.projects.map((item) => [item.id, item])), [store.projects])

  const enrichedAllocations = useMemo(
    () =>
      store.allocations
        .map((allocation) => {
          const freelancer = freelancerMap.get(allocation.freelancerId)
          const project = projectMap.get(allocation.projectId)
          if (!freelancer || !project) return null
          return {
            ...allocation,
            freelancer,
            project,
            daysRemaining: daysUntil(allocation.contractEndDate),
          }
        })
        .filter((item): item is Allocation & { freelancer: Freelancer; project: Project; daysRemaining: number } => Boolean(item)),
    [store.allocations, freelancerMap, projectMap],
  )

  const dashboard = useMemo(
    () => ({
      activeFreelancers: store.freelancers.filter((item) => item.freelancerStatus !== 'Inactive').length,
      endingIn3Days: enrichedAllocations.filter((item) => item.daysRemaining <= 3 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed').length,
      endingIn1Day: enrichedAllocations.filter((item) => item.daysRemaining <= 1 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed').length,
      openFollowUps: store.freelancers.filter((item) => item.freelancerStatus === 'Open follow-up').length,
      recentlyJoined: store.freelancers.filter((item) => daysUntil(item.createdAt) >= -7).length,
      enabledNotificationRules: store.notificationRules.filter((item) => item.enabled).length,
    }),
    [enrichedAllocations, store.freelancers, store.notificationRules],
  )

  const value: TrackerContextValue = {
    ...store,
    enrichedAllocations,
    dashboard,
    addFreelancer: (input) => {
      const key = normalizeFreelancerKey(input.freelancerName, input.personalEmail)
      const existing = store.freelancers.find((item) => normalizeFreelancerKey(item.freelancerName, item.personalEmail) === key)
      if (existing) return { success: false, message: 'Freelancer already exists.' }

      const freelancer: Freelancer = {
        id: makeId('freelancer'),
        createdAt: new Date().toISOString(),
        ...input,
      }

      setStore((current) => ({ ...current, freelancers: [freelancer, ...current.freelancers] }))
      return { success: true, message: 'Freelancer added.' }
    },
    removeFreelancer: (id) => {
      setStore((current) => {
        const allocationIds = current.allocations.filter((item) => item.freelancerId === id).map((item) => item.id)
        return {
          ...current,
          freelancers: current.freelancers.filter((item) => item.id !== id),
          allocations: current.allocations.filter((item) => item.freelancerId !== id),
          notifications: current.notifications.filter((item) => !allocationIds.includes(item.allocationId)),
        }
      })
    },
    addProject: (input) => {
      const key = normalizeProjectKey(input.projectName, input.entity)
      const existing = store.projects.find((item) => normalizeProjectKey(item.projectName, item.entity) === key)
      if (existing) return { success: false, message: 'Project already exists.' }

      const project: Project = {
        id: makeId('project'),
        ...input,
      }

      setStore((current) => ({ ...current, projects: [project, ...current.projects] }))
      return { success: true, message: 'Project added.' }
    },
    removeProject: (id) => {
      setStore((current) => {
        const allocationIds = current.allocations.filter((item) => item.projectId === id).map((item) => item.id)
        return {
          ...current,
          projects: current.projects.filter((item) => item.id !== id),
          allocations: current.allocations.filter((item) => item.projectId !== id),
          notifications: current.notifications.filter((item) => !allocationIds.includes(item.allocationId)),
        }
      })
    },
    addAllocation: (input) => {
      const project = store.projects.find((item) => item.id === input.projectId)
      const freelancer = store.freelancers.find((item) => item.id === input.freelancerId)
      if (!project || !freelancer) {
        return { success: false, message: 'Project or freelancer not found.' }
      }

      const existing = store.allocations.find(
        (item) =>
          normalizeAllocationKey(item.freelancerId, item.projectId, item.contractStartDate, item.contractEndDate, item.roleWithinProject) ===
          normalizeAllocationKey(input.freelancerId, input.projectId, input.contractStartDate, input.contractEndDate, input.roleWithinProject),
      )
      if (existing) {
        return { success: false, message: 'That freelancer is already assigned to this project for the same dates and role.' }
      }

      const allocation: Allocation = {
        id: makeId('allocation'),
        createdAt: new Date().toISOString(),
        ...input,
      }

      const joinRule = store.notificationRules.find((rule) => rule.triggerType === 'join' && rule.enabled)
      const rendered = joinRule
        ? renderNotificationRule(joinRule, { freelancer, project, allocation })
        : {
            subject: `Freelancer joined ${project.projectName}`,
            body: `${freelancer.freelancerName} joined ${project.projectName}.`,
            recipientsPreview: resolveRecipientPreview(
              {
                recipientTypes: ['Owner manager', 'Ops'],
                customRecipients: '',
              },
              project,
              allocation,
            ),
          }

      const notification: AppNotification = {
        id: makeId('notification'),
        allocationId: allocation.id,
        notificationType: 'join',
        scheduledFor: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        status: 'sent',
        subject: rendered.subject,
        message: rendered.body,
        recipientsPreview: rendered.recipientsPreview,
      }

      setStore((current) => ({
        ...current,
        allocations: [allocation, ...current.allocations],
        notifications: [notification, ...current.notifications],
      }))

      return { success: true, message: 'Freelancer added to project.' }
    },
    removeAllocation: (id) => {
      setStore((current) => ({
        ...current,
        allocations: current.allocations.filter((item) => item.id !== id),
        notifications: current.notifications.filter((item) => item.allocationId !== id),
      }))
    },
    addNotificationRule: (input) => {
      const rule: NotificationRule = { id: makeId('rule'), ...input }
      setStore((current) => ({
        ...current,
        notificationRules: [rule, ...current.notificationRules],
      }))
      return { success: true, message: 'Notification rule created.' }
    },
    updateNotificationRule: (id, input) => {
      setStore((current) => ({
        ...current,
        notificationRules: current.notificationRules.map((item) => (item.id === id ? { ...item, ...input } : item)),
      }))
      return { success: true, message: 'Notification rule updated.' }
    },
    removeNotificationRule: (id) => {
      setStore((current) => ({
        ...current,
        notificationRules: current.notificationRules.filter((item) => item.id !== id),
      }))
    },
    toggleNotificationRule: (id) => {
      setStore((current) => ({
        ...current,
        notificationRules: current.notificationRules.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item,
        ),
      }))
    },
    importCsvFile: async (file) => {
      const buffer = await file.arrayBuffer()
      const text = decodeCsvBuffer(buffer)
      const rows = mapCsvRows(text)
      const summary: CsvImportSummary = {
        fileName: file.name,
        processedRows: rows.length,
        addedFreelancers: 0,
        updatedFreelancers: 0,
        addedProjects: 0,
        updatedProjects: 0,
        addedAllocations: 0,
        skippedAllocations: 0,
        errors: [],
        importedAt: new Date().toISOString(),
      }

      setStore((current) => {
        const nextFreelancers = [...current.freelancers]
        const nextProjects = [...current.projects]
        const nextAllocations = [...current.allocations]

        for (const row of rows) {
          if (!row.freelancerName || !row.projectName) {
            summary.errors.push('Skipped a row without freelancer name or project name.')
            continue
          }

          const freelancerKey = normalizeFreelancerKey(row.freelancerName, row.personalEmail ?? '')
          let freelancer = nextFreelancers.find((item) => normalizeFreelancerKey(item.freelancerName, item.personalEmail) === freelancerKey)
          if (!freelancer) {
            freelancer = {
              id: makeId('freelancer'),
              createdAt: row.timestamp || new Date().toISOString(),
              freelancerName: row.freelancerName,
              personalEmail: row.personalEmail ?? '',
              phoneNumber: row.phoneNumber ?? '',
              address: row.address ?? '',
              freelancerStatus: row.freelancerStatus ?? 'Active',
              registrationNumber: row.registrationNumber ?? false,
              questionFlag: row.questionFlag ?? false,
              comments: row.comments ?? '',
            }
            nextFreelancers.push(freelancer)
            summary.addedFreelancers += 1
          } else {
            const before = JSON.stringify(freelancer)
            freelancer.personalEmail = row.personalEmail || freelancer.personalEmail
            freelancer.phoneNumber = row.phoneNumber || freelancer.phoneNumber
            freelancer.address = row.address || freelancer.address
            freelancer.freelancerStatus = row.freelancerStatus || freelancer.freelancerStatus
            freelancer.registrationNumber = row.registrationNumber ?? freelancer.registrationNumber
            freelancer.questionFlag = row.questionFlag ?? freelancer.questionFlag
            freelancer.comments = row.comments || freelancer.comments
            if (JSON.stringify(freelancer) !== before) summary.updatedFreelancers += 1
          }

          const projectKey = normalizeProjectKey(row.projectName, row.entity ?? 'Unspecified')
          let project = nextProjects.find((item) => normalizeProjectKey(item.projectName, item.entity) === projectKey)
          if (!project) {
            project = {
              id: makeId('project'),
              projectName: row.projectName,
              entity: row.entity ?? 'Unspecified',
              projectManagerName: row.projectManagerName ?? '',
              projectManagerEmail: row.projectManagerEmail ?? '',
            }
            nextProjects.push(project)
            summary.addedProjects += 1
          } else {
            const before = JSON.stringify(project)
            project.projectManagerName = row.projectManagerName || project.projectManagerName
            project.projectManagerEmail = row.projectManagerEmail || project.projectManagerEmail
            if (JSON.stringify(project) !== before) summary.updatedProjects += 1
          }

          const duplicate = nextAllocations.find(
            (item) =>
              (row.id && item.sourceRowId === row.id) ||
              normalizeAllocationKey(item.freelancerId, item.projectId, item.contractStartDate, item.contractEndDate, item.roleWithinProject) ===
                normalizeAllocationKey(freelancer.id, project.id, row.contractStartDate, row.contractEndDate, row.roleWithinProject),
          )
          if (duplicate) {
            summary.skippedAllocations += 1
            continue
          }

          nextAllocations.push({
            id: makeId('allocation'),
            createdAt: row.timestamp || new Date().toISOString(),
            freelancerId: freelancer.id,
            projectId: project.id,
            contractStartDate: row.contractStartDate || new Date().toISOString().slice(0, 10),
            contractEndDate: row.contractEndDate || new Date().toISOString().slice(0, 10),
            numberOfDays: row.numberOfDays ?? 0,
            dailyRate: row.dailyRate ?? 0,
            dailyRateCurrency: row.dailyRateCurrency ?? 'EUR',
            dailyRateNote: row.dailyRateNote ?? '',
            roleWithinProject: row.roleWithinProject ?? '',
            ownerManagerName: row.projectManagerName ?? project.projectManagerName,
            ownerManagerEmail: row.projectManagerEmail ?? project.projectManagerEmail,
            allocationStatus: row.contractEndDate && daysUntil(row.contractEndDate) < 0 ? 'Closed' : 'Active',
            sourceRowId: row.id,
          })
          summary.addedAllocations += 1
        }

        return {
          ...current,
          freelancers: nextFreelancers,
          projects: nextProjects,
          allocations: nextAllocations,
          lastImportSummary: summary,
        }
      })

      return summary
    },
    getFreelancerById: (id) => freelancerMap.get(id),
    getProjectById: (id) => projectMap.get(id),
    getAllocationsForFreelancer: (freelancerId) => store.allocations.filter((item) => item.freelancerId === freelancerId),
    getAllocationsForProject: (projectId) => store.allocations.filter((item) => item.projectId === projectId),
  }

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
}

export function useTrackerData() {
  const context = useContext(TrackerContext)
  if (!context) throw new Error('useTrackerData must be used within a TrackerProvider')
  return context
}

function getSeedStore(): TrackerStore {
  return {
    freelancers: seedFreelancers,
    projects: seedProjects,
    allocations: seedAllocations,
    notifications: seedNotifications,
    notificationRules: seedNotificationRules,
    lastImportSummary: null,
  }
}

function ensureStoreShape(value: Partial<TrackerStore>, seed: TrackerStore): TrackerStore {
  return {
    freelancers: value.freelancers ?? seed.freelancers,
    projects: value.projects ?? seed.projects,
    allocations: value.allocations ?? seed.allocations,
    notifications: value.notifications ?? seed.notifications,
    notificationRules: value.notificationRules ?? seed.notificationRules,
    lastImportSummary: value.lastImportSummary ?? null,
  }
}

function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  try {
    return new TextDecoder('windows-1252').decode(bytes)
  } catch {
    return new TextDecoder().decode(bytes)
  }
}

function normalizeFreelancerKey(name: string, email: string): string {
  return normalizeKey(name, email)
}

function normalizeProjectKey(name: string, entity: string): string {
  return normalizeKey(name, entity)
}

function normalizeAllocationKey(
  freelancerId: string,
  projectId: string,
  contractStartDate?: string,
  contractEndDate?: string,
  roleWithinProject?: string,
): string {
  return normalizeKey(freelancerId, projectId, contractStartDate, contractEndDate, roleWithinProject)
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function resolveRecipientPreview(
  rule: Pick<NotificationRule, 'recipientTypes' | 'customRecipients'>,
  project: Project,
  allocation: Allocation,
): string[] {
  const recipients = new Set<string>()
  for (const recipient of rule.recipientTypes) {
    if (recipient === 'Owner manager' && allocation.ownerManagerEmail) recipients.add(allocation.ownerManagerEmail)
    if (recipient === 'Project manager' && project.projectManagerEmail) recipients.add(project.projectManagerEmail)
    if (recipient === 'Ops') recipients.add('ops@squadigital.com')
    if (recipient === 'Finance') recipients.add('finance@squadigital.com')
    if (recipient === 'Custom recipients') {
      splitRecipients(rule.customRecipients).forEach((item) => recipients.add(item))
    }
  }
  return Array.from(recipients)
}

function renderNotificationRule(
  rule: NotificationRule,
  params: { freelancer: Freelancer; project: Project; allocation: Allocation },
): { subject: string; body: string; recipientsPreview: string[] } {
  const tokens: Record<string, string> = {
    freelancerName: params.freelancer.freelancerName,
    projectName: params.project.projectName,
    entity: params.project.entity,
    managerName: params.allocation.ownerManagerName || params.project.projectManagerName,
    startDate: params.allocation.contractStartDate,
    endDate: params.allocation.contractEndDate,
    role: params.allocation.roleWithinProject,
  }
  return {
    subject: renderTemplate(rule.subject, tokens),
    body: renderTemplate(rule.body, tokens),
    recipientsPreview: resolveRecipientPreview(rule, params.project, params.allocation),
  }
}

function renderTemplate(value: string, tokens: Record<string, string>): string {
  return value.replace(/{{\s*([a-zA-Z0-9]+)\s*}}/g, (_, key: string) => tokens[key] ?? '')
}

function splitRecipients(value: string): string[] {
  return value
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}
