import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

const clerkFrontendApi = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; // Set this in your .env

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkFrontendApi}>
          <App />
    </ClerkProvider>

  </React.StrictMode>,
)