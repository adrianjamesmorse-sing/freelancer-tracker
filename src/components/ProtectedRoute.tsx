import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isAuthDisabled } from '../lib/entraSettings'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { ready, isAuthenticated, canAccessPath } = useAuth()

  if (isAuthDisabled()) {
    return <>{children}</>
  }

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-stone-600">
        Checking your Vertex session…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!canAccessPath(location.pathname)) {
    if (location.pathname === '/') {
      return <Navigate to="/freelancers" replace />
    }

    return (
      <div className="rounded-3xl border border-stone-200 bg-white/85 p-8 text-center shadow-panel">
        <h2 className="text-xl font-semibold text-stone-900">Access restricted</h2>
        <p className="mt-2 text-sm text-stone-600">
          Your Entra profile does not include permission for this area of Vertex. Contact an
          administrator if you need access.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
