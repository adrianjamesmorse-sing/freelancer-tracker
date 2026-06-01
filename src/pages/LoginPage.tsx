import { Navigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useAuth } from '../context/AuthContext'
import { mapRoleStrings } from '../lib/entraRoles'
import { getEntraClientSettings } from '../lib/entraSettings'
import { isAuthDisabled } from '../lib/entraSettings'

export function LoginPage() {
  const location = useLocation()
  const { ready, isAuthenticated, configured, authError, tokenRoles, signIn } = useAuth()
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/'
  const mappedRoles = mapRoleStrings(tokenRoles)
  const redirectUri = getEntraClientSettings().redirectUri

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
          Use your Singulier Microsoft Entra account.
        </p>

        {!configured ? (
          <div className="system-highlight mt-5">
            Entra is not configured. In <strong>Azure Static Web Apps → Configuration</strong>, set{' '}
            <code>ENTRA_TENANT_ID</code> and <code>ENTRA_CLIENT_ID</code>, then redeploy.
          </div>
        ) : null}

        {authError ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <div className="font-medium">Sign-in could not be completed</div>
            <div className="mt-1 leading-6">{authError}</div>
          </div>
        ) : null}

        {ready && tokenRoles.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-700">
            <div className="font-medium text-stone-900">Roles on your Microsoft token</div>
            <div className="mt-1">{tokenRoles.join(', ')}</div>
            {mappedRoles.length ? (
              <div className="mt-2 text-stone-600">Vertex recognises this as: {mappedRoles.join(', ')}</div>
            ) : (
              <div className="mt-2 text-amber-800">
                These values are not recognised. App role <strong>Value</strong> must be exactly{' '}
                <code>vertex.admin</code>, <code>vertex.editor</code>, or <code>vertex.viewer</code>.
              </div>
            )}
          </div>
        ) : ready && configured && !authError ? (
          <div className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            No <code>roles</code> claim on your token yet — that is normal. After you deploy the latest
            API, Vertex will read your <code>vertex.admin</code> assignment from Microsoft Graph
            instead. Ensure <code>ENTRA_CLIENT_SECRET</code> is set and Graph permission{' '}
            <code>AppRoleAssignment.Read.All</code> is granted with admin consent.
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
          Redirect URI: <code>{redirectUri}</code>. Assign app roles on the Vertex{' '}
          <strong>enterprise application</strong> (Users and groups), not only a security group in
          Entra ID.
        </p>
      </div>
    </div>
  )
}
