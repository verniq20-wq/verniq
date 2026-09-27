import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled with the app so text looks right offline and inside the Android app
import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/noto-sans-devanagari'
// Santali is written in Ol Chiki
import '@fontsource/noto-sans-ol-chiki/ol-chiki-400.css'
import '@fontsource/noto-sans-ol-chiki/ol-chiki-700.css'
import './index.css'
import App from './App.tsx'
import { initPwa } from './platform/pwa'

void initPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
