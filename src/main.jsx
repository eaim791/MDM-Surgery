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
// Cursiva de mano alzada para el loading y el slogan (ver .handwritten-fill
// en index.css): Sacramento es una script monolineal (trazo fino de
// boligrafo, se puede rellenar normal) y, a diferencia de la anterior
// (Mrs Saint Delafield), se lee claramente letra por letra.
import '@fontsource/sacramento'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
