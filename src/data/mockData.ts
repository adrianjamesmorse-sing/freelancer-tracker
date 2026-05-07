import type { Allocation, AppNotification, Freelancer, Project } from '../types'

export const freelancers: Freelancer[] = [
  {
    id: 'freelancer-1',
    createdAt: '2026-05-01T09:00:00Z',
    freelancerName: 'Sophie Martin',
    personalEmail: 'sophie.martin@example.com',
    phoneNumber: '+33 6 12 34 56 78',
    address: '12 Rue des Archives, Paris',
    freelancerStatus: 'Active',
    registrationNumber: true,
    questionFlag: false,
    comments: 'Strong frontend profile. Likely extension on current workstream.'
  },
  {
    id: 'freelancer-2',
    createdAt: '2026-04-14T08:30:00Z',
    freelancerName: 'James Carter',
    personalEmail: 'james.carter@example.com',
    phoneNumber: '+44 7700 900123',
    address: '21 Kingsway, London',
    freelancerStatus: 'Ending soon',
    registrationNumber: true,
    questionFlag: true,
    comments: 'Project likely closing this week; finance should check final dates.'
  },
  {
    id: 'freelancer-3',
    createdAt: '2026-03-20T12:00:00Z',
    freelancerName: 'Lena Vogel',
    personalEmail: 'lena.vogel@example.com',
    phoneNumber: '+49 1512 3456789',
    address: 'Potsdamer Platz 4, Berlin',
    freelancerStatus: 'Open follow-up',
    registrationNumber: false,
    questionFlag: true,
    comments: 'Extension verbally agreed but status not yet closed in source form.'
  }
]

export const projects: Project[] = [
  {
    id: 'project-1',
    projectName: 'Retail Transformation',
    entity: 'Squadigital FR',
    projectManagerName: 'Amelie Laurent',
    projectManagerEmail: 'amelie.laurent@squadigital.com'
  },
  {
    id: 'project-2',
    projectName: 'AI Operating Model',
    entity: 'Squadigital UK',
    projectManagerName: 'Tom Hughes',
    projectManagerEmail: 'tom.hughes@squadigital.com'
  },
  {
    id: 'project-3',
    projectName: 'Marketplace Redesign',
    entity: 'Squadigital GE',
    projectManagerName: 'Nina Becker',
    projectManagerEmail: 'nina.becker@squadigital.com'
  }
]

export const allocations: Allocation[] = [
  {
    id: 'allocation-1',
    createdAt: '2026-05-01T09:00:00Z',
    freelancerId: 'freelancer-1',
    projectId: 'project-1',
    contractStartDate: '2026-05-06',
    contractEndDate: '2026-06-14',
    numberOfDays: 20,
    dailyRate: 650,
    dailyRateCurrency: 'EUR',
    dailyRateNote: 'VAT excluded',
    roleWithinProject: 'Senior Product Designer',
    ownerManagerName: 'Amelie Laurent',
    ownerManagerEmail: 'amelie.laurent@squadigital.com',
    allocationStatus: 'Active'
  },
  {
    id: 'allocation-2',
    createdAt: '2026-04-14T08:30:00Z',
    freelancerId: 'freelancer-2',
    projectId: 'project-2',
    contractStartDate: '2026-04-15',
    contractEndDate: '2026-05-08',
    numberOfDays: 16,
    dailyRate: 700,
    dailyRateCurrency: 'GBP',
    dailyRateNote: 'Includes travel days',
    roleWithinProject: 'Data Architect',
    ownerManagerName: 'Tom Hughes',
    ownerManagerEmail: 'tom.hughes@squadigital.com',
    allocationStatus: 'Active'
  },
  {
    id: 'allocation-3',
    createdAt: '2026-03-20T12:00:00Z',
    freelancerId: 'freelancer-3',
    projectId: 'project-3',
    contractStartDate: '2026-03-24',
    contractEndDate: '2026-05-05',
    numberOfDays: 28,
    dailyRate: 620,
    dailyRateCurrency: 'EUR',
    dailyRateNote: 'Extension verbally agreed',
    roleWithinProject: 'UX Research Lead',
    ownerManagerName: 'Nina Becker',
    ownerManagerEmail: 'nina.becker@squadigital.com',
    allocationStatus: 'Extended pending close'
  },
  {
    id: 'allocation-4',
    createdAt: '2026-05-03T10:15:00Z',
    freelancerId: 'freelancer-1',
    projectId: 'project-2',
    contractStartDate: '2026-05-12',
    contractEndDate: '2026-05-30',
    numberOfDays: 8,
    dailyRate: 650,
    dailyRateCurrency: 'EUR',
    dailyRateNote: 'Shared across two workstreams',
    roleWithinProject: 'Design Sprint Support',
    ownerManagerName: 'Tom Hughes',
    ownerManagerEmail: 'tom.hughes@squadigital.com',
    allocationStatus: 'Active'
  }
]

export const notifications: AppNotification[] = [
  {
    id: 'notification-1',
    allocationId: 'allocation-1',
    notificationType: 'join',
    scheduledFor: '2026-05-01T09:01:00Z',
    sentAt: '2026-05-01T09:01:00Z',
    status: 'sent',
    message: 'Sophie Martin joined Retail Transformation.'
  },
  {
    id: 'notification-2',
    allocationId: 'allocation-2',
    notificationType: 'end_1_day',
    scheduledFor: '2026-05-07T08:00:00Z',
    status: 'queued',
    message: 'James Carter ends tomorrow on AI Operating Model.'
  },
  {
    id: 'notification-3',
    allocationId: 'allocation-3',
    notificationType: 'still_open_weekly',
    scheduledFor: '2026-05-07T08:00:00Z',
    status: 'queued',
    message: 'Lena Vogel remains open with an extension still not closed.'
  }
]