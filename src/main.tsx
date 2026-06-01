import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import { ensureEntraSettingsLoaded, isAuthDisabled, isEntraConfigured } from './lib/entraSettings'
import { getMsalInstance } from './lib/msal'

function Root() {
  const [booted, setBooted] = useState(false)
  const [msalEnabled, setMsalEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!isAuthDisabled()) {
        await ensureEntraSettingsLoaded()
        if (!cancelled) {
          setMsalEnabled(isEntraConfigured())
        }
      }

      if (!cancelled) {
        setBooted(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (!booted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf8f2] text-sm text-stone-600">
        Loading Vertex…
      </div>
    )
  }

  const tree = (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )

  if (msalEnabled) {
    return <MsalProvider instance={getMsalInstance()}>{tree}</MsalProvider>
  }

  return tree
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
