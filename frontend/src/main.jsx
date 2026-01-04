import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { FingerprintProvider } from './contexts/FingerprintContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FingerprintProvider>
        <App />
      </FingerprintProvider>
    </BrowserRouter>
  </StrictMode>,
)
