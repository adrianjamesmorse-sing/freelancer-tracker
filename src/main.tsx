import React from 'react'
import ReactDOM from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import { isAuthDisabled, isEntraConfigured } from './lib/entraSettings'
import { getMsalInstance } from './lib/msal'

const useMsal = isEntraConfigured() && !isAuthDisabled()

const tree = (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {useMsal ? <MsalProvider instance={getMsalInstance()}>{tree}</MsalProvider> : tree}
  </React.StrictMode>,
)
