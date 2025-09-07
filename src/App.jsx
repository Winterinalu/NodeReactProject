import React from 'react'
import Navbar from './Navbar'
import WinterLogo from './assets/Winter.png'
import HekkLogo from './assets/Hekk.svg'
import './App.css'

function App() {
  return (
    <div id="root" className="app">
      <Navbar logo={WinterLogo} />

      <main className="hero">
        <div className="hero-content">
          <h1 className="title">Creating Using React+Vite in Github Pages</h1>
          <p className="subtitle">I am a Student of UCC NORTH BSIT 3A trying to utlized modern and free Tools to create a expand my knowledge is web making.</p>
          <div className="hero-ctas">
            <a className="btn primary" href="https://github.com/C-D-Rking/NodeReactProject" target="_blank" rel="noopener noreferrer">Get Started</a>
            <a className="btn ghost" href='https://vite.dev/guide/static-deploy' target='_blank' rel='noopener noreferrer'>Learn More</a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden>
          <img src={HekkLogo} alt="brand visual" className="logo react" />
        </div>
      </main>

      <section className="features">
        <div className="feature">
          <h3>Fast</h3>
          <p>Optimized for performance and quick interactions.</p>
        </div>
        <div className="feature">
          <h3>Minimal</h3>
          <p>Only the essentials — clear hierarchy and thoughtful spacing.</p>
        </div>
        <div className="feature">
          <h3>Reliable</h3>
          <p>Simple architecture that scales with your needs.</p>
        </div>
      </section>

      <footer className="site-footer">
        <div>© {new Date().getFullYear()} UCC NORTH BSIT 3A Student</div>
        <div className="links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  )
}

export default App
