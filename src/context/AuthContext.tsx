import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { useMsal } from '@azure/msal-react'
import type { VertexRole } from '../lib/accessControl'
import { canAccessPath, canAccessSection } from '../lib/accessControl'
import { fetchAuthMe } from '../lib/authApi'
import type { AuthUser } from '../lib/authApi'
import { extractRoleStrings, mapRoleStrings } from '../lib/entraRoles'
import {
  getEntraClientSettings,
  isAuthDisabled,
  isEntraConfigured,
} from '../lib/entraSettings'
import { getLoginScopes, getMsalInstance, handleRedirectOnce } from '../lib/msal'

type AuthContextValue = {
  ready: boolean
  devMode: boolean
  configured: boolean
  isAuthenticated: boolean
  user: AuthUser | null
  roles: VertexRole[]
  idToken: string | null
  authError: string | null
  authErrorDetails: string | null
  tokenRoles: string[]
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  canAccessPath: (pathname: string) => boolean
  canAccessSection: (section: 'freelancers' | 'feedback' | 'projects' | 'admin') => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const devUser: AuthUser = {
  email: 'dev@vertex.local',
  fullName: 'Development User',
  roles: ['admin'],
}

function hasAuthResponseInUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.has('code') || params.has('error') || window.location.hash.includes('code=')
}

function useAuthContextValue(
  msal?: {
    instance: ReturnType<typeof useMsal>['instance']
    accounts: ReturnType<typeof useMsal>['accounts']
  },
): AuthContextValue {
  const [ready, setReady] = useState(false)
  const [devMode, setDevMode] = useState(isAuthDisabled())
  const [user, setUser] = useState<AuthUser | null>(isAuthDisabled() ? devUser : null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authErrorDetails, setAuthErrorDetails] = useState<string | null>(null)
  const [tokenRoles, setTokenRoles] = useState<string[]>([])

  const configured = isEntraConfigured()

  const refreshProfile = useCallback(
    async (preferredToken?: string, preferredAccessToken?: string) => {
      if (isAuthDisabled()) {
        setDevMode(true)
        setUser(devUser)
        setIdToken(null)
        setAuthError(null)
        setAuthErrorDetails(null)
        setTokenRoles([])
        return
      }

      if (!msal) {
        setUser(null)
        setIdToken(null)
        return
      }

      const { instance, accounts } = msal
      const account = instance.getActiveAccount() ?? accounts[0]
      if (!account) {
        setUser(null)
        setIdToken(null)
        setTokenRoles([])
        if (hasAuthResponseInUrl()) {
          setAuthError(
            'Microsoft redirected back to Vertex, but no sign-in session was stored. Confirm the Entra redirect URI exactly matches ' +
              getEntraClientSettings().redirectUri,
          )
          try {
            const details = [
              `Location: ${window.location.href}`,
              `Search: ${window.location.search}`,
              `Hash: ${window.location.hash}`,
              '',
              'Session storage snapshot:',
              JSON.stringify(Object.fromEntries(Object.keys(sessionStorage).map((k) => [k, sessionStorage.getItem(k)])), null, 2),
            ].join('\n\n')
            setAuthErrorDetails(details)
          } catch (e) {
            setAuthErrorDetails(String(e))
          }
        }
        return
      }

      instance.setActiveAccount(account)
      setAuthError(null)
      setAuthErrorDetails(null)

      const claimRoles = extractRoleStrings(account.idTokenClaims ?? undefined)
      setTokenRoles(claimRoles)

      try {
        let token = preferredToken
        let accessToken = preferredAccessToken

        if (!token || !accessToken) {
          const tokenResult = await instance.acquireTokenSilent({
            account,
            scopes: getLoginScopes(),
          })
          token = token ?? tokenResult.idToken
          accessToken = accessToken ?? tokenResult.accessToken
        }

        if (!token) {
          throw new Error('Microsoft sign-in did not return an ID token.')
        }

        setIdToken(token)

        const profile = await fetchAuthMe(token, accessToken)
        if (profile.devMode) {
          setDevMode(true)
          setUser(profile.user)
          return
        }

        setDevMode(false)
        setUser(profile.user)

        if (hasAuthResponseInUrl()) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch (err) {
        setUser(null)
        setIdToken(null)

        const mapped = mapRoleStrings(claimRoles)
        const baseMessage = err instanceof Error ? err.message : 'Sign-in failed'

        let details: string | null = null
        try {
          if (err instanceof Error) {
            details = err.stack ?? err.message
          } else {
            details = JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2)
          }
        } catch (e) {
          details = String(err)
        }

        if (mapped.length && baseMessage.includes('not authorized')) {
          setAuthError(
            `${baseMessage} Your token includes: ${claimRoles.join(', ')}. Vertex mapped that to: ${mapped.join(', ')}. If this persists, redeploy the latest API build.`,
          )
          setAuthErrorDetails(details)
        } else {
          setAuthError(baseMessage)
          setAuthErrorDetails(details)
        }
      }
    },
    [msal],
  )

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      try {
        let redirectToken: string | undefined
        let redirectAccessToken: string | undefined

        if (msal) {
          await getMsalInstance().initialize()
          try {
            const redirectResult = await handleRedirectOnce(msal.instance)
            if (redirectResult?.account) {
              msal.instance.setActiveAccount(redirectResult.account)
              redirectToken = redirectResult.idToken
              redirectAccessToken = redirectResult.accessToken
            }
          } catch (redirectErr) {
            // Surface redirect errors for developer debugging
            try {
              const details = redirectErr instanceof Error ? redirectErr.stack ?? redirectErr.message : JSON.stringify(redirectErr, Object.getOwnPropertyNames(redirectErr as object), 2)
              setAuthError('Error handling Microsoft redirect')
              setAuthErrorDetails([
                `Redirect error: ${String(redirectErr)}`,
                `Location: ${window.location.href}`,
                `Search: ${window.location.search}`,
                `Hash: ${window.location.hash}`,
                '',
                details,
              ].join('\n\n'))
            } catch (e) {
              setAuthError('Error handling Microsoft redirect')
              setAuthErrorDetails(String(redirectErr))
            }
          }
        }

        if (!cancelled) {
          await refreshProfile(redirectToken, redirectAccessToken)
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    void boot()

    return () => {
      cancelled = true
    }
  }, [msal, refreshProfile])

  useEffect(() => {
    if (!msal || !ready) return
    if (msal.accounts.length > 0 && !user && !authError) {
      void refreshProfile()
    }
  }, [msal, ready, user, authError, refreshProfile])

  const signIn = useCallback(async () => {
    if (!msal) return
    setAuthError(null)
    setAuthErrorDetails(null)
    await msal.instance.loginRedirect({
      scopes: getLoginScopes(),
      prompt: 'select_account',
      redirectUri: getEntraClientSettings().redirectUri,
    })
  }, [msal])

  const signOut = useCallback(async () => {
    setUser(null)
    setIdToken(null)
    setAuthError(null)
    setAuthErrorDetails(null)
    setTokenRoles([])
    if (!msal) return
    await msal.instance.logoutRedirect({
      postLogoutRedirectUri: `${window.location.origin}/login`,
    })
  }, [msal])

  const roles = user?.roles ?? []
  const isAuthenticated = Boolean(user)

  return useMemo<AuthContextValue>(
    () => ({
      ready,
      devMode,
      configured,
      isAuthenticated,
      user,
      roles,
      idToken,
      authError,
        authErrorDetails,
      tokenRoles,
      signIn,
      signOut,
      refreshProfile: () => refreshProfile(),
      canAccessPath: (pathname) => canAccessPath(roles, pathname),
      canAccessSection: (section) => canAccessSection(roles, section),
    }),
    [
      ready,
      devMode,
      configured,
      isAuthenticated,
      user,
      roles,
      idToken,
      authError,
      authErrorDetails,
      tokenRoles,
      signIn,
      signOut,
      refreshProfile,
    ],
  )
}

function AuthProviderMsal({ children }: PropsWithChildren) {
  const { instance, accounts } = useMsal()
  const value = useAuthContextValue({ instance, accounts })
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function AuthProviderLite({ children }: PropsWithChildren) {
  const value = useAuthContextValue()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: PropsWithChildren) {
  if (isAuthDisabled() || !isEntraConfigured()) {
    return <AuthProviderLite>{children}</AuthProviderLite>
  }
  return <AuthProviderMsal>{children}</AuthProviderMsal>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
