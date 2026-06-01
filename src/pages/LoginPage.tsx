import { Navigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useAuth } from '../context/AuthContext'
import { isAuthDisabled } from '../lib/entraSettings'

export function LoginPage() {
  const location = useLocation()
  const { ready, isAuthenticated, configured, authError, signIn } = useAuth()
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/'

  if (isAuthDisabled()) {
    return <Navigate to={returnTo} replace />
  }

  if (ready && isAuthenticated) {
    return <Navigate to={returnTo} replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(159,135,104,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(127,142,108,0.10),transparent_22%),linear-gradient(180deg,#fbf8f2_0%,#f4efe6_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,#f6f0e6)] p-8 shadow-panel">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-brand-700">
          <Icon name="vertex" className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-900">Sign in to Vertex</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Use your Singulier Microsoft Entra account. Access is granted through application roles on
          the Vertex enterprise app.
        </p>

        {!configured ? (
          <div className="system-highlight mt-5">
            Entra is not configured. In <strong>Azure Static Web Apps → Configuration</strong>, set{' '}
            <code>ENTRA_TENANT_ID</code> and <code>ENTRA_CLIENT_ID</code>, then restart the app.
            For local dev, use <code>.env</code> or Admin → Credentials.
          </div>
        ) : null}

        {authError ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <div className="font-medium">Sign-in could not be completed</div>
            <div className="mt-1 leading-6">{authError}</div>
          </div>
        ) : null}

        {!ready ? (
          <div className="mt-6 text-sm text-stone-600">Completing Microsoft sign-in…</div>
        ) : (
          <button
            type="button"
            className="btn-primary mt-6 w-full justify-center"
            disabled={!configured}
            onClick={() => void signIn()}
          >
            <Icon name="shield" className="h-4 w-4" />
            Continue with Microsoft
          </button>
        )}

        <p className="mt-5 text-xs leading-5 text-stone-500">
          App role <strong>Value</strong> must be one of: <code>vertex.viewer</code>,{' '}
          <code>vertex.editor</code>, or <code>vertex.admin</code>. Assign your user (or group) to
          that role under the Vertex <strong>Enterprise application</strong> → Users and groups.
        </p>
      </div>
    </div>
  )
}
