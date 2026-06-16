import { Navigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useAuth } from '../context/AuthContext'
import { mapRoleStrings } from '../lib/entraRoles'
import {
  canUseLocalAuthBypass,
  enableLocalAuthBypass,
  getEntraClientSettings,
  isAuthDisabled,
} from '../lib/entraSettings'

export function LoginPage() {
  const location = useLocation()
  const { ready, isAuthenticated, configured, authError, authErrorDetails, tokenRoles, signIn, devMode, canAccessPath } = useAuth()
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/'
  const authenticatedDestination = canAccessPath(returnTo) ? returnTo : '/freelancers'
  const mappedRoles = mapRoleStrings(tokenRoles)
  const localBypassAvailable = canUseLocalAuthBypass()
  const redirectUri = typeof window !== 'undefined' ? getEntraClientSettings().redirectUri : ''

  const continueAsLocalAdmin = () => {
    if (!enableLocalAuthBypass()) return
    window.location.assign(authenticatedDestination)
  }

  if (isAuthDisabled()) {
    return <Navigate to={returnTo} replace />
  }

  if (ready && isAuthenticated) {
    return <Navigate to={authenticatedDestination} replace />
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
            {authErrorDetails && (typeof window !== 'undefined') && (devMode || window.location.hostname.includes('localhost') || new URLSearchParams(location.search).has('debugAuth')) ? (
              <details className="mt-3 rounded-md border border-stone-100 bg-white/60 p-3 text-xs text-stone-700">
                <summary className="cursor-pointer font-medium">Developer details</summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px]">{authErrorDetails}</pre>
              </details>
            ) : null}
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
        ) : null}

        {!ready ? (
          <div className="mt-6 text-sm text-stone-600">Completing Microsoft sign-in…</div>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="btn-primary w-full justify-center"
              disabled={!configured}
              onClick={() => void signIn()}
            >
              <Icon name="shield" className="h-4 w-4" />
              Continue with Microsoft
            </button>

            {localBypassAvailable ? (
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
                onClick={continueAsLocalAdmin}
              >
                <Icon name="settings" className="h-4 w-4" />
                Continue as local admin
              </button>
            ) : null}
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-stone-500">
          Assign app roles on the Vertex <strong>enterprise application</strong> (Users and groups).<br />
          Redirect URI: <strong>{redirectUri || 'Not configured'}</strong>
        </p>

        {localBypassAvailable ? (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            Local admin bypass is available only on the Vite dev server at localhost. It skips
            Microsoft redirect for UI testing and stores a browser-local flag until you sign out.
          </p>
        ) : null}
      </div>
    </div>
  )
}
