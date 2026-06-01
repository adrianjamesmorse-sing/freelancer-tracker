import {
  EventType,
  PublicClientApplication,
  type AuthenticationResult,
  type Configuration,
} from '@azure/msal-browser'
import { getEntraClientSettings } from './entraSettings'

let msalInstance: PublicClientApplication | undefined

export function getLoginScopes() {
  return ['openid', 'profile', 'email', 'User.Read']
}

export function createMsalInstance() {
  const settings = getEntraClientSettings()

  const config: Configuration = {
    auth: {
      clientId: settings.clientId,
      authority: `https://login.microsoftonline.com/${settings.tenantId || 'organizations'}`,
      redirectUri: settings.redirectUri,
    },
    cache: {
      cacheLocation: 'localStorage',
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
