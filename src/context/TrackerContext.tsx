import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  allocations as seedAllocations,
  freelancers as seedFreelancers,
  notificationRules as seedNotificationRules,
  notifications as seedNotifications,
  projects as seedProjects,
} from '../data/mockData'
import { useAuth } from './AuthContext'
import {
  createAllocation as createAllocationApi,
  createFreelancer as createFreelancerApi,
  createProject as createProjectApi,
  deleteAllocation as deleteAllocationApi,
  deleteFreelancer,
  deleteProject as deleteProjectApi,
  fetchAllocations,
  fetchFreelancers,
  fetchProjects,
  importFormsFreelancersCsv,
  updateFreelancer as updateFreelancerApi,
} from '../lib/api'
import { normalizeKey } from '../lib/csv'
import { inferCountryFromAddress } from '../lib/geo'
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

type MutationResult = { success: boolean; message: string }

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
  isFreelancersLoaded: boolean
  isProjectsLoaded: boolean
  isAllocationsLoaded: boolean
  addFreelancer: (input: NewFreelancerInput) => Promise<MutationResult>
  updateFreelancer: (id: string, input: NewFreelancerInput) => Promise<MutationResult>
  removeFreelancer: (id: string) => Promise<void>
  addProject: (input: NewProjectInput) => Promise<MutationResult>
  removeProject: (id: string) => Promise<void>
  addAllocation: (input: NewAllocationInput) => Promise<MutationResult>
  removeAllocation: (id: string) => Promise<void>
  addNotificationRule: (input: NewNotificationRuleInput) => MutationResult
  updateNotificationRule: (id: string, input: NewNotificationRuleInput) => MutationResult
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
  const { ready: authReady, devMode, isAuthenticated, idToken } = useAuth()
  const [store, setStore] = useState<TrackerStore>(() => {
    const seed = getSeedStore()
    if (typeof window === 'undefined') return seed

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return seed

    try {
      return ensureStoreShape(JSON.parse(saved) as Partial<TrackerStore>, seed)
    } catch {
      return seed
    }
  })

  const [isFreelancersLoaded, setIsFreelancersLoaded] = useState(false)
  const [isProjectsLoaded, setIsProjectsLoaded] = useState(false)
  const [isAllocationsLoaded, setIsAllocationsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const apiOptions = useMemo(() => ({ idToken }), [idToken])
  const canLoadRemoteData = devMode || (authReady && isAuthenticated)

  const refreshFreelancers = async () => {
    const freelancers = await fetchFreelancers(apiOptions)
    setStore((current) => ({
      ...current,
      freelancers: freelancers.map((item) => ({
        ...item,
        country: item.country || inferCountryFromAddress(item.address) || '',
      })),
    }))
  }

  const refreshProjects = async () => {
    const projects = await fetchProjects(apiOptions)
    setStore((current) => ({ ...current, projects }))
  }

  const refreshAllocations = async () => {
    const allocations = await fetchAllocations(apiOptions)
    setStore((current) => ({ ...current, allocations }))
  }

  useEffect(() => {
    if (!canLoadRemoteData) return

    let isCancelled = false

    fetchFreelancers(apiOptions)
      .then((freelancers: Freelancer[]) => {
        if (isCancelled) return
        setStore((current) => ({
          ...current,
          freelancers: freelancers.map((item) => ({
            ...item,
            country: item.country || inferCountryFromAddress(item.address) || '',
          })),
        }))
      })
      .catch((err: unknown) => {
        console.error('Failed to load freelancers from API', err)
      })
      .finally(() => {
        if (!isCancelled) setIsFreelancersLoaded(true)
      })

    fetchProjects(apiOptions)
      .then((projects: Project[]) => {
        if (isCancelled) return
        setStore((current) => ({ ...current, projects }))
      })
      .catch((err: unknown) => {
        console.error('Failed to load projects from API', err)
      })
      .finally(() => {
        if (!isCancelled) setIsProjectsLoaded(true)
      })

    fetchAllocations(apiOptions)
      .then((allocations: Allocation[]) => {
        if (isCancelled) return
        setStore((current) => ({ ...current, allocations }))
      })
      .catch((err: unknown) => {
        console.error('Failed to load allocations from API', err)
      })
      .finally(() => {
        if (!isCancelled) setIsAllocationsLoaded(true)
      })

    return () => {
      isCancelled = true
    }
  }, [apiOptions, canLoadRemoteData])

  const freelancerMap = useMemo(
    () => new Map(store.freelancers.map((item) => [item.id, item])),
    [store.freelancers],
  )
  const projectMap = useMemo(
    () => new Map(store.projects.map((item) => [item.id, item])),
    [store.projects],
  )

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
        .filter(
          (
            item,
          ): item is Allocation & {
            freelancer: Freelancer
            project: Project
            daysRemaining: number
          } => Boolean(item),
        ),
    [store.allocations, freelancerMap, projectMap],
  )

  const dashboard = useMemo(
    () => ({
      activeFreelancers: store.freelancers.filter((item) => item.freelancerStatus !== 'Inactive').length,
      endingIn3Days: enrichedAllocations.filter(
        (item) => item.daysRemaining <= 3 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed',
      ).length,
      endingIn1Day: enrichedAllocations.filter(
        (item) => item.daysRemaining <= 1 && item.daysRemaining >= 0 && item.allocationStatus !== 'Closed',
      ).length,
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
    isFreelancersLoaded,
    isProjectsLoaded,
    isAllocationsLoaded,
    addFreelancer: async (input) => {
      try {
        const preparedInput = {
          ...input,
          country: input.country || inferCountryFromAddress(input.address) || '',
        }

        const key = normalizeFreelancerKey(preparedInput.freelancerName, preparedInput.personalEmail)
        const existing = store.freelancers.find(
          (item) => normalizeFreelancerKey(item.freelancerName, item.personalEmail) === key,
        )
        if (existing) {
          return { success: false, message: 'Freelancer already exists.' }
        }

        const freelancer = await createFreelancerApi(preparedInput, apiOptions)

        setStore((current) => ({
          ...current,
          freelancers: [
            {
              ...freelancer,
              country: freelancer.country || inferCountryFromAddress(freelancer.address) || '',
            },
            ...current.freelancers,
          ],
        }))

        return { success: true, message: 'Freelancer added.' }
      } catch (err) {
        console.error('Failed to create freelancer', err)
        return { success: false, message: 'Failed to add freelancer.' }
      }
    },
    updateFreelancer: async (id, input) => {
      try {
        const preparedInput = {
          ...input,
          country: input.country || inferCountryFromAddress(input.address) || '',
        }

        const key = normalizeFreelancerKey(preparedInput.freelancerName, preparedInput.personalEmail)
        const duplicate = store.freelancers.find(
          (item) =>
            item.id !== id &&
            normalizeFreelancerKey(item.freelancerName, item.personalEmail) === key,
        )
        if (duplicate) {
          return {
            success: false,
            message: 'Another freelancer already uses that name/email combination.',
          }
        }

        const saved = await updateFreelancerApi(id, preparedInput, apiOptions)

        setStore((current) => ({
          ...current,
          freelancers: current.freelancers.map((item) =>
            item.id === id
              ? {
                  ...saved,
                  country: saved.country || inferCountryFromAddress(saved.address) || '',
                }
              : item,
          ),
        }))

        return { success: true, message: 'Freelancer updated.' }
      } catch (err) {
        console.error('Failed to update freelancer', err)
        return { success: false, message: 'Failed to update freelancer.' }
      }
    },
    removeFreelancer: async (id) => {
      try {
        await deleteFreelancer(id, apiOptions)

        setStore((current) => {
          const allocationIds = current.allocations
            .filter((item) => item.freelancerId === id)
            .map((item) => item.id)

          return {
            ...current,
            freelancers: current.freelancers.filter((item) => item.id !== id),
            allocations: current.allocations.filter((item) => item.freelancerId !== id),
            notifications: current.notifications.filter(
              (item) => !allocationIds.includes(item.allocationId),
            ),
          }
        })
      } catch (err) {
        console.error('Failed to remove freelancer', err)
        throw err
      }
    },
    addProject: async (input) => {
      try {
        const key = normalizeProjectKey(input.projectName, input.entity)
        const existing = store.projects.find(
          (item) => normalizeProjectKey(item.projectName, item.entity) === key,
        )
        if (existing) return { success: false, message: 'Project already exists.' }

        const project = await createProjectApi(input, apiOptions)
        setStore((current) => ({ ...current, projects: [project, ...current.projects] }))
        return { success: true, message: 'Project added.' }
      } catch (err) {
        console.error('Failed to create project', err)
        return {
          success: false,
          message: err instanceof Error ? `Failed to add project: ${err.message}` : 'Failed to add project.',
        }
      }
    },
    removeProject: async (id) => {
      try {
        await deleteProjectApi(id, apiOptions)
        setStore((current) => {
          const allocationIds = current.allocations
            .filter((item) => item.projectId === id)
            .map((item) => item.id)

          return {
            ...current,
            projects: current.projects.filter((item) => item.id !== id),
            allocations: current.allocations.filter((item) => item.projectId !== id),
            notifications: current.notifications.filter(
              (item) => !allocationIds.includes(item.allocationId),
            ),
          }
        })
      } catch (err) {
        console.error('Failed to remove project', err)
        throw err
      }
    },
    addAllocation: async (input) => {
      try {
        const project = store.projects.find((item) => item.id === input.projectId)
        const freelancer = store.freelancers.find((item) => item.id === input.freelancerId)
        if (!project || !freelancer) {
          return { success: false, message: 'Project or freelancer not found.' }
        }

        const existing = store.allocations.find(
          (item) =>
            normalizeAllocationKey(
              item.freelancerId,
              item.projectId,
              item.contractStartDate,
              item.contractEndDate,
              item.roleWithinProject,
            ) ===
            normalizeAllocationKey(
              input.freelancerId,
              input.projectId,
              input.contractStartDate,
              input.contractEndDate,
              input.roleWithinProject,
            ),
        )
        if (existing) {
          return {
            success: false,
            message: 'That freelancer is already assigned to this project for the same dates and role.',
          }
        }

        const allocation = await createAllocationApi(input, apiOptions)

        const joinRule = store.notificationRules.find(
          (rule) => rule.triggerType === 'join' && rule.enabled,
        )
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
      } catch (err) {
        console.error('Failed to add allocation', err)
        return { success: false, message: 'Failed to add freelancer to project.' }
      }
    },
    removeAllocation: async (id) => {
      try {
        await deleteAllocationApi(id, apiOptions)
        setStore((current) => ({
          ...current,
          allocations: current.allocations.filter((item) => item.id !== id),
          notifications: current.notifications.filter((item) => item.allocationId !== id),
        }))
      } catch (err) {
        console.error('Failed to remove allocation', err)
        throw err
      }
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
        notificationRules: current.notificationRules.map((item) =>
          item.id === id ? { ...item, ...input } : item,
        ),
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
      const summary = await importFormsFreelancersCsv(file, apiOptions)

      await Promise.all([
        refreshFreelancers(),
        refreshProjects(),
        refreshAllocations(),
      ])

      setStore((current) => ({
        ...current,
        lastImportSummary: summary,
      }))

      return summary
    },
    getFreelancerById: (id) => freelancerMap.get(id),
    getProjectById: (id) => projectMap.get(id),
    getAllocationsForFreelancer: (freelancerId) =>
      store.allocations.filter((item) => item.freelancerId === freelancerId),
    getAllocationsForProject: (projectId) =>
      store.allocations.filter((item) => item.projectId === projectId),
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
    freelancers: (value.freelancers ?? seed.freelancers).map((item) => ({
      ...item,
      country: item.country ?? inferCountryFromAddress(item.address) ?? '',
    })),
    projects: value.projects ?? seed.projects,
    allocations: value.allocations ?? seed.allocations,
    notifications: value.notifications ?? seed.notifications,
    notificationRules: value.notificationRules ?? seed.notificationRules,
    lastImportSummary: value.lastImportSummary ?? null,
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
  return normalizeKey(
    freelancerId,
    projectId,
    contractStartDate,
    contractEndDate,
    roleWithinProject,
  )
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
    if (recipient === 'Owner manager' && allocation.ownerManagerEmail) {
      recipients.add(allocation.ownerManagerEmail)
    }
    if (recipient === 'Project manager' && project.projectManagerEmail) {
      recipients.add(project.projectManagerEmail)
    }
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
