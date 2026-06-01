import {
  EventType,
  PublicClientApplication,
  type AuthenticationResult,
  type Configuration,
  type IPublicClientApplication,
} from '@azure/msal-browser'
import { getEntraClientSettings } from './entraSettings'

let msalInstance: PublicClientApplication | undefined
let redirectPromise: Promise<AuthenticationResult | null> | null = null

export function getLoginScopes() {
  return ['openid', 'profile', 'email']
}

export function createMsalInstance() {
  const settings = getEntraClientSettings()

  const config: Configuration = {
    auth: {
      clientId: settings.clientId,
      authority: `https://login.microsoftonline.com/${settings.tenantId || 'organizations'}`,
      redirectUri: settings.redirectUri,
      knownAuthorities: settings.tenantId
        ? [`login.microsoftonline.com`]
        : undefined,
    },
    cache: {
      cacheLocation: 'sessionStorage',
    },
  }

  const instance = new PublicClientApplication(config)

  instance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult
      instance.setActiveAccount(payload.account)
    }
  })

  return instance
}

export function getMsalInstance() {
  if (!msalInstance) {
    msalInstance = createMsalInstance()
  }
  return msalInstance
}

/** MSAL redirect handling must only run once per page load (avoids losing the auth code). */
export function handleRedirectOnce(instance: IPublicClientApplication) {
  if (!redirectPromise) {
    redirectPromise = instance.handleRedirectPromise()
  }
  return redirectPromise
}

export function clearRedirectPromise() {
  redirectPromise = null
}
