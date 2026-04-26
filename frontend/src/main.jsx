import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/design-system.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = '757745989563-gtfdp78m4u1nocd7a348lu50cr3f5fsm.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
