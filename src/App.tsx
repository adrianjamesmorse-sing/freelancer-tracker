import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TrackerProvider } from './context/TrackerContext'
import { AdminCredentialsPage } from './pages/AdminCredentialsPage'
import { AdminGraphPage } from './pages/AdminGraphPage'
import { AdminSSOPage } from './pages/AdminSSOPage'
import { DashboardPage } from './pages/DashboardPage'
import { FeedbackManagerPage } from './pages/FeedbackManagerPage'
import { FinancialsPage } from './pages/FinancialsPage'
import { FreelancerDetailPage } from './pages/FreelancerDetailPage'
import { FreelancerOnboardingPage } from './pages/FreelancerOnboardingPage'
import { FreelancersPage } from './pages/FreelancersPage'
import { ImportsPage } from './pages/ImportsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { RequestFreelancerPage } from './pages/RequestFreelancerPage'

function App() {
  return (
    <TrackerProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/freelancers/request" element={<RequestFreelancerPage />} />
          <Route path="/freelancers/onboarding" element={<FreelancerOnboardingPage />} />
          <Route path="/freelancers/:id" element={<FreelancerDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/financials" element={<FinancialsPage />} />
          <Route path="/imports" element={<ImportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/feedback" element={<FeedbackManagerPage />} />
          <Route path="/admin" element={<Navigate to="/admin/sso" replace />} />
          <Route path="/admin/sso" element={<AdminSSOPage />} />
          <Route path="/admin/graph" element={<AdminGraphPage />} />
          <Route path="/admin/credentials" element={<AdminCredentialsPage />} />
        </Routes>
      </Layout>
    </TrackerProvider>
  )
}

export default App
