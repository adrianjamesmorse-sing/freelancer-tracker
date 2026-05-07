import { useMemo, useState } from "react";

type FreelancerStatus = "Active" | "Ending soon" | "Open follow-up" | "Inactive";
type AllocationStatus = "Active" | "Extended pending close" | "Closed";

type Freelancer = {
  id: string;
  freelancerName: string;
  personalEmail: string;
  phoneNumber: string;
  address: string;
  freelancerStatus: FreelancerStatus;
  registrationNumber: boolean;
  questionFlag: boolean;
  comments: string;
};

type Project = {
  id: string;
  projectName: string;
  entity: "Squadigital FR" | "Squadigital UK" | "Squadigital GE";
  projectManagerName: string;
  projectManagerEmail: string;
};

type Allocation = {
  id: string;
  freelancerId: string;
  projectId: string;
  contractStartDate: string;
  contractEndDate: string;
  numberOfDays: number;
  dailyRate: number;
  dailyRateCurrency: "EUR" | "GBP";
  dailyRateNote: string;
  roleWithinProject: string;
  ownerManagerName: string;
  ownerManagerEmail: string;
  allocationStatus: AllocationStatus;
};

type AppNotification = {
  id: string;
  allocationId: string;
  notificationType: "join" | "end_3_days" | "end_1_day" | "still_open_weekly";
  scheduledFor: string;
  sentAt?: string;
  status: "queued" | "sent";
  message: string;
};

const freelancers: Freelancer[] = [
  {
    id: "freelancer-1",
    freelancerName: "Sophie Martin",
    personalEmail: "sophie.martin@example.com",
    phoneNumber: "+33 6 12 34 56 78",
    address: "12 Rue des Archives, Paris",
    freelancerStatus: "Active",
    registrationNumber: true,
    questionFlag: false,
    comments: "Strong frontend profile. Likely extension on current workstream."
  },
  {
    id: "freelancer-2",
    freelancerName: "James Carter",
    personalEmail: "james.carter@example.com",
    phoneNumber: "+44 7700 900123",
    address: "21 Kingsway, London",
    freelancerStatus: "Ending soon",
    registrationNumber: true,
    questionFlag: true,
    comments: "Project likely closing this week; finance should check final dates."
  },
  {
    id: "freelancer-3",
    freelancerName: "Lena Vogel",
    personalEmail: "lena.vogel@example.com",
    phoneNumber: "+49 1512 3456789",
    address: "Potsdamer Platz 4, Berlin",
    freelancerStatus: "Open follow-up",
    registrationNumber: false,
    questionFlag: true,
    comments: "Extension verbally agreed but status not yet closed in source form."
  }
];

const projects: Project[] = [
  {
    id: "project-1",
    projectName: "Retail Transformation",
    entity: "Squadigital FR",
    projectManagerName: "Amelie Laurent",
    projectManagerEmail: "amelie.laurent@squadigital.com"
  },
  {
    id: "project-2",
    projectName: "AI Operating Model",
    entity: "Squadigital UK",
    projectManagerName: "Tom Hughes",
    projectManagerEmail: "tom.hughes@squadigital.com"
  },
  {
    id: "project-3",
    projectName: "Marketplace Redesign",
    entity: "Squadigital GE",
    projectManagerName: "Nina Becker",
    projectManagerEmail: "nina.becker@squadigital.com"
  }
];

const allocations: Allocation[] = [
  {
    id: "allocation-1",
    freelancerId: "freelancer-1",
    projectId: "project-1",
    contractStartDate: "2026-05-06",
    contractEndDate: "2026-06-14",
    numberOfDays: 20,
    dailyRate: 650,
    dailyRateCurrency: "EUR",
    dailyRateNote: "VAT excluded",
    roleWithinProject: "Senior Product Designer",
    ownerManagerName: "Amelie Laurent",
    ownerManagerEmail: "amelie.laurent@squadigital.com",
    allocationStatus: "Active"
  },
  {
    id: "allocation-2",
    freelancerId: "freelancer-2",
    projectId: "project-2",
    contractStartDate: "2026-04-15",
    contractEndDate: "2026-05-08",
    numberOfDays: 16,
    dailyRate: 700,
    dailyRateCurrency: "GBP",
    dailyRateNote: "Includes travel days",
    roleWithinProject: "Data Architect",
    ownerManagerName: "Tom Hughes",
    ownerManagerEmail: "tom.hughes@squadigital.com",
    allocationStatus: "Active"
  },
  {
    id: "allocation-3",
    freelancerId: "freelancer-3",
    projectId: "project-3",
    contractStartDate: "2026-03-24",
    contractEndDate: "2026-05-05",
    numberOfDays: 28,
    dailyRate: 620,
    dailyRateCurrency: "EUR",
    dailyRateNote: "Extension verbally agreed",
    roleWithinProject: "UX Research Lead",
    ownerManagerName: "Nina Becker",
    ownerManagerEmail: "nina.becker@squadigital.com",
    allocationStatus: "Extended pending close"
  },
  {
    id: "allocation-4",
    freelancerId: "freelancer-1",
    projectId: "project-2",
    contractStartDate: "2026-05-12",
    contractEndDate: "2026-05-30",
    numberOfDays: 8,
    dailyRate: 650,
    dailyRateCurrency: "EUR",
    dailyRateNote: "Shared across two workstreams",
    roleWithinProject: "Design Sprint Support",
    ownerManagerName: "Tom Hughes",
    ownerManagerEmail: "tom.hughes@squadigital.com",
    allocationStatus: "Active"
  }
];

const notifications: AppNotification[] = [
  {
    id: "notification-1",
    allocationId: "allocation-1",
    notificationType: "join",
    scheduledFor: "2026-05-01T09:01:00Z",
    sentAt: "2026-05-01T09:01:00Z",
    status: "sent",
    message: "Sophie Martin joined Retail Transformation."
  },
  {
    id: "notification-2",
    allocationId: "allocation-2",
    notificationType: "end_1_day",
    scheduledFor: "2026-05-07T08:00:00Z",
    status: "queued",
    message: "James Carter ends tomorrow on AI Operating Model."
  },
  {
    id: "notification-3",
    allocationId: "allocation-3",
    notificationType: "still_open_weekly",
    scheduledFor: "2026-05-07T08:00:00Z",
    status: "queued",
    message: "Lena Vogel remains open with an extension still not closed."
  }
];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

function formatDate(value: string) {
  return dateFormat.format(new Date(value));
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function daysUntil(date: string) {
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function badgeClass(value: string) {
  if (value === "Active" || value === "sent") return "bg-emerald-100 text-emerald-700";
  if (value === "Ending soon" || value === "queued") return "bg-amber-100 text-amber-700";
  if (value === "Open follow-up" || value === "Extended pending close") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function StatusBadge({ value }: { value: string }) {
  return <span className={"inline-flex rounded-full px-2.5 py-1 text-xs font-medium " + badgeClass(value)}>{value}</span>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}

type Tab = "dashboard" | "freelancers" | "projects";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string>("freelancer-1");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("project-1");

  const enrichedAllocations = useMemo(() => {
    return allocations.map((allocation) => ({
      ...allocation,
      freelancer: freelancers.find((f) => f.id === allocation.freelancerId)!,
      project: projects.find((p) => p.id === allocation.projectId)!,
      daysRemaining: daysUntil(allocation.contractEndDate)
    }));
  }, []);

  const dashboard = {
    activeFreelancers: freelancers.filter((item) => item.freelancerStatus !== "Inactive").length,
    endingIn3Days: enrichedAllocations.filter((item) => item.daysRemaining <= 3 && item.daysRemaining >= 0 && item.allocationStatus !== "Closed").length,
    endingIn1Day: enrichedAllocations.filter((item) => item.daysRemaining <= 1 && item.daysRemaining >= 0 && item.allocationStatus !== "Closed").length,
    openFollowUps: freelancers.filter((item) => item.freelancerStatus === "Open follow-up").length
  };

  const selectedFreelancer = freelancers.find((item) => item.id === selectedFreelancerId) ?? freelancers[0];
  const selectedProject = projects.find((item) => item.id === selectedProjectId) ?? projects[0];
  const freelancerAllocations = allocations.filter((item) => item.freelancerId === selectedFreelancer.id);
  const projectAllocations = allocations.filter((item) => item.projectId === selectedProject.id);
  const endingSoon = enrichedAllocations.filter((item) => item.daysRemaining <= 7 && item.daysRemaining >= 0 && item.allocationStatus !== "Closed").sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">MVP preview</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Freelancer Tracker</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Resource visibility, roll-off alerts, and manager follow-up in one place.</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {[
                { key: "dashboard", label: "Dashboard" },
                { key: "freelancers", label: "Freelancers" },
                { key: "projects", label: "Projects" }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key as Tab)}
                  className={"rounded-full px-4 py-2 text-sm font-medium transition " + (tab === item.key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {tab === "dashboard" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Active freelancers" value={dashboard.activeFreelancers} />
              <StatCard label="Ending in 3 days" value={dashboard.endingIn3Days} />
              <StatCard label="Ending in 1 day" value={dashboard.endingIn1Day} />
              <StatCard label="Open follow-up" value={dashboard.openFollowUps} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <Panel title="Ending soon" subtitle="Freelancers and allocations that need attention in the next 7 days.">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="pb-3 pr-4 font-medium">Freelancer</th>
                        <th className="pb-3 pr-4 font-medium">Project</th>
                        <th className="pb-3 pr-4 font-medium">Owner</th>
                        <th className="pb-3 pr-4 font-medium">End date</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endingSoon.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 pr-4 font-medium text-slate-900">{item.freelancer.freelancerName}</td>
                          <td className="py-3 pr-4 text-slate-600">{item.project.projectName}</td>
                          <td className="py-3 pr-4 text-slate-600">{item.ownerManagerName}</td>
                          <td className="py-3 pr-4 text-slate-600">{formatDate(item.contractEndDate)} ({item.daysRemaining}d)</td>
                          <td className="py-3 pr-4"><StatusBadge value={item.freelancer.freelancerStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Notification queue" subtitle="Stubbed in-app reminders before wiring real jobs.">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm text-slate-700">{notification.message}</div>
                        <StatusBadge value={notification.status} />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Scheduled for {formatDate(notification.scheduledFor)}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        ) : null}

        {tab === "freelancers" ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Panel title="All freelancers" subtitle="Ops and finance can see every freelancer, current owner, and next end date.">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Freelancer</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Project owner</th>
                      <th className="pb-3 pr-4 font-medium">Projects</th>
                      <th className="pb-3 pr-4 font-medium">Next end</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freelancers.map((freelancer) => {
                      const items = allocations.filter((item) => item.freelancerId === freelancer.id);
                      const next = [...items].sort((a, b) => a.contractEndDate.localeCompare(b.contractEndDate))[0];
                      return (
                        <tr
                          key={freelancer.id}
                          className={"cursor-pointer border-b border-slate-100 last:border-0 " + (selectedFreelancerId === freelancer.id ? "bg-brand-50/50" : "")}
                          onClick={() => setSelectedFreelancerId(freelancer.id)}
                        >
                          <td className="py-3 pr-4 font-medium text-slate-900">{freelancer.freelancerName}</td>
                          <td className="py-3 pr-4"><StatusBadge value={freelancer.freelancerStatus} /></td>
                          <td className="py-3 pr-4 text-slate-600">{next?.ownerManagerName ?? "â€”"}</td>
                          <td className="py-3 pr-4 text-slate-600">{items.length}</td>
                          <td className="py-3 pr-4 text-slate-600">{next ? formatDate(next.contractEndDate) : "â€”"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title={selectedFreelancer.freelancerName} subtitle="Profile and current allocations.">
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Email" value={selectedFreelancer.personalEmail} />
                  <Info label="Phone" value={selectedFreelancer.phoneNumber} />
                  <Info label="Address" value={selectedFreelancer.address} />
                  <Info label="Status" value={selectedFreelancer.freelancerStatus} />
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium text-slate-800">Allocations</div>
                  <div className="space-y-3">
                    {freelancerAllocations.map((allocation) => {
                      const project = projects.find((item) => item.id === allocation.projectId)!;
                      return (
                        <div key={allocation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-slate-900">{project.projectName}</div>
                              <div className="mt-1 text-sm text-slate-500">{allocation.roleWithinProject} Â· {formatDate(allocation.contractStartDate)} â†’ {formatDate(allocation.contractEndDate)}</div>
                            </div>
                            <StatusBadge value={allocation.allocationStatus} />
                          </div>
                          <div className="mt-2 text-sm text-slate-600">{formatMoney(allocation.dailyRate, allocation.dailyRateCurrency)} Â· {allocation.ownerManagerName}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <strong className="text-slate-900">Comments:</strong> {selectedFreelancer.comments}
                </div>
              </div>
            </Panel>
          </div>
        ) : null}

        {tab === "projects" ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel title="All projects" subtitle="Grouped resource visibility at project level.">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Project</th>
                      <th className="pb-3 pr-4 font-medium">Entity</th>
                      <th className="pb-3 pr-4 font-medium">Manager</th>
                      <th className="pb-3 pr-4 font-medium">Freelancers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => {
                      const items = allocations.filter((item) => item.projectId === project.id);
                      return (
                        <tr
                          key={project.id}
                          className={"cursor-pointer border-b border-slate-100 last:border-0 " + (selectedProjectId === project.id ? "bg-brand-50/50" : "")}
                          onClick={() => setSelectedProjectId(project.id)}
                        >
                          <td className="py-3 pr-4 font-medium text-slate-900">{project.projectName}</td>
                          <td className="py-3 pr-4 text-slate-600">{project.entity}</td>
                          <td className="py-3 pr-4 text-slate-600">{project.projectManagerName}</td>
                          <td className="py-3 pr-4 text-slate-600">{items.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title={selectedProject.projectName} subtitle={selectedProject.entity + " Â· " + selectedProject.projectManagerName}>
              <div className="space-y-3">
                {projectAllocations.map((allocation) => {
                  const freelancer = freelancers.find((item) => item.id === allocation.freelancerId)!;
                  return (
                    <div key={allocation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{freelancer.freelancerName}</div>
                          <div className="mt-1 text-sm text-slate-500">{allocation.roleWithinProject} Â· {formatDate(allocation.contractStartDate)} â†’ {formatDate(allocation.contractEndDate)}</div>
                        </div>
                        <StatusBadge value={allocation.allocationStatus} />
                      </div>
                      <div className="mt-2 text-sm text-slate-600">{formatMoney(allocation.dailyRate, allocation.dailyRateCurrency)} Â· {allocation.ownerManagerEmail}</div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        ) : null}
      </div>
    </div>
  );
}