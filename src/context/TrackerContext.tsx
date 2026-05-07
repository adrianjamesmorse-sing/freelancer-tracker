import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { allocations as seedAllocations, freelancers as seedFreelancers, notifications as seedNotifications, projects as seedProjects } from '../data/mockData'
import { mapCsvRows, normalizeKey } from '../lib/csv'
import { daysUntil } from '../lib/format'
import type { Allocation, AppNotification, CsvImportSummary, Freelancer, NewAllocationInput, NewFreelancerInput, NewProjectInput, Project } from '../types'

interface TrackerContextValue {
  freelancers: Freelancer[]
  projects: Project[]
  allocations: Allocation[]
  notifications: AppNotification[]
  enrichedAllocations: Array<Allocation & { freelancer: Freelancer; project: Project; daysRemaining: number }>
  dashboard: {
    activeFreelancers: number
    endingIn3Days: number
    endingIn1Day: number
    openFollowUps: number
    recentlyJoined: number
  }
  lastImportSummary: CsvImportSummary | null
  addFreelancer: (input: NewFreelancerInput) => { success: boolean; message: string }
  removeFreelancer: (id: string) => void
  addProject: (input: NewProjectInput) => { success: boolean; message: string }
  removeProject: (id: string) => void
  addAllocation: (input: NewAllocationInput) => { success: boolean; message: string }
  removeAllocation: (id: string) => void
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
  lastImportSummary: CsvImportSummary | null
}

const STORAGE_KEY = 'freelancer-tracker-store-v2'

const TrackerContext = createContext<TrackerContextValue | null>(null)

export function TrackerProvider({ children }: PropsWithChildren) {
  const [store, setStore] = useState<TrackerStore>(() => {
    if (typeof window === 'undefined') {
      return getSeedStore()
    }

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return getSeedStore()
    }

    try {
      return JSON.parse(saved) as TrackerStore
    } catch {
      return getSeedStore()
    }
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const freelancerMap = useMemo(() => new Map(store.freelancers.map((item) => [item.id, item])), [store.freelancers])
  const projectMap = useMemo(() => new Map(store.projects.map((item) => [item.id, item])), [store.projects])

  const enrichedAllocations = useMemo(
    () => store.allocations
      .map((allocation) => {
        const freelancer = freelancerMap.get(allocation.freelancerId)
        const project = projectMap.get(allocation.projectId)
        if (!freelancer || !project) {
          return null
        }
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

  const dashboard = useMemo(() => ({
    activeFreelancers: store.freelancers.filter((item) => item.freelancerStatus !== 'Inactive').length,
    endingIn3Days: enrichedAllocations.filter((item) => item.daysRemaining <= 3 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed').length,
    endingIn1Day: enrichedAllocations.filter((item) => item.daysRemaining <= 1 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed').length,
    openFollowUps: store.freelancers.filter((item) => item.freelancerStatus === 'Open follow-up').length,
    recentlyJoined: store.freelancers.filter((item) => daysUntil(item.createdAt) >= -7).length,
  }), [enrichedAllocations, store.freelancers])

  const value: TrackerContextValue = {
    ...store,
    enrichedAllocations,
    dashboard,
    addFreelancer: (input) => {
      const key = normalizeFreelancerKey(input.freelancerName, input.personalEmail)
      const existing = store.freelancers.find((item) => normalizeFreelancerKey(item.freelancerName, item.personalEmail) === key)
      if (existing) {
        return { success: false, message: 'Freelancer already exists.' }
      }

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
      if (existing) {
        return { success: false, message: 'Project already exists.' }
      }

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

      const existing = store.allocations.find((item) =>
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

      const notification: AppNotification = {
        id: makeId('notification'),
        allocationId: allocation.id,
        notificationType: 'join',
        scheduledFor: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        status: 'sent',
        message: `${freelancer.freelancerName} joined ${project.projectName}.`,
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

          const freelancerKey = normalizeFreelancerKey(row.freelancerName, row.personalEmail)
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
            if (JSON.stringify(freelancer) !== before) {
              summary.updatedFreelancers += 1
            }
          }

          const projectKey = normalizeProjectKey(row.projectName, row.entity ?? 'Squadigital UK')
          let project = nextProjects.find((item) => normalizeProjectKey(item.projectName, item.entity) === projectKey)
          if (!project) {
            project = {
              id: makeId('project'),
              projectName: row.projectName,
              entity: row.entity ?? 'Squadigital UK',
              projectManagerName: row.projectManagerName ?? '',
              projectManagerEmail: row.projectManagerEmail ?? '',
            }
            nextProjects.push(project)
            summary.addedProjects += 1
          } else {
            const before = JSON.stringify(project)
            project.projectManagerName = row.projectManagerName || project.projectManagerName
            project.projectManagerEmail = row.projectManagerEmail || project.projectManagerEmail
            if (JSON.stringify(project) !== before) {
              summary.updatedProjects += 1
            }
          }

          const duplicate = nextAllocations.find((item) =>
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
  if (!context) {
    throw new Error('useTrackerData must be used within a TrackerProvider')
  }
  return context
}

function getSeedStore(): TrackerStore {
  return {
    freelancers: seedFreelancers,
    projects: seedProjects,
    allocations: seedAllocations,
    notifications: seedNotifications,
    lastImportSummary: null,
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