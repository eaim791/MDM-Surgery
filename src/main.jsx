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
// Cursiva de mano alzada para el loading y el slogan (ver .font-handwritten
// en index.css) — Cormorant Garamond, aun en su peso mas liviano, tiene
// trazo de letra con area: trazar (stroke, sin relleno) su contorno se ve
// como una letra hueca de molde en vez de una linea de pluma. Esta
// tipografia es un script genuinamente monolineal: se puede rellenar
// normal (sin relleno hueco) y el propio trazo YA es fino como una linea.
import '@fontsource/mrs-saint-delafield'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
