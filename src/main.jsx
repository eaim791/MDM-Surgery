import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/400-italic.css'
import '@fontsource/playfair-display/500.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
// Cursiva de mano alzada para el slogan (ver .handwritten-fill en index.css,
// usada por HandwrittenText/Slogan — el loading ya no la usa, ver
// LoaderWordmark en App.jsx).
import '@fontsource/mrs-saint-delafield'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
