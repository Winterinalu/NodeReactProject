import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Signup from './Signup.jsx'
import Signin from './Signin.jsx'
import './firebase'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
  </HashRouter>
  </StrictMode>,
)
