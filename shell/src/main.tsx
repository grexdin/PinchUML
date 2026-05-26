import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initCSP } from './csp'
import './index.css'
import App from './App.tsx'

initCSP()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
