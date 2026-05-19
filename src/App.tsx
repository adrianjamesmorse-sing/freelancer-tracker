import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TrackerProvider } from './context/TrackerContext'
import { AdminPage } from './pages/AdminPage'
import { DashboardPage } from './pages/DashboardPage'
import { FeedbackManagerPage } from './pages/FeedbackManagerPage'
import { FinancialsPage } from './pages/FinancialsPage'
import { FreelancerDetailPage } from './pages/FreelancerDetailPage'
import { FreelancersPage } from './pages/FreelancersPage'
import { ImportsPage } from './pages/ImportsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectsPage } from './pages/ProjectsPage'

function App() {
  return (
    <TrackerProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/freelancers/:id" element={<FreelancerDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/financials" element={<FinancialsPage />} />
          <Route path="/imports" element={<ImportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/feedback" element={<FeedbackManagerPage />} />
        </Routes>
      </Layout>
    </TrackerProvider>
  )
}

export default App
