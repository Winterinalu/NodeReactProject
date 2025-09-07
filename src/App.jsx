import React from 'react'
import Navbar from './Navbar'
import WinterLogo from './assets/Winter.png'
import HekkLogo from './assets/Hekk.svg'
import GithubPic from './assets/Github.png'
import ReactPic from './assets/React.png'
import VitePic from './assets/Vite.jpg'
import './App.css'

function App() {
  return (
    <div id="root" className="app">
      <Navbar logo={WinterLogo} />

      <main className="hero">
        <div className="hero-content">
          <h1 className="title">Creating Using React+Vite in Github Pages</h1>
          <p className="subtitle">I am a Student of UCC NORTH BSIT 3A trying to utilized modern and free Tools to create a expand my knowledge is web making.</p>
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
          <a href="https://github.com/" target='_blank' className="feature-link">
            <img className="feature-img" src={GithubPic} alt="Fast feature" />
          </a>
          <h3>Github</h3>
          <p>It leverages Git, a distributed version control system, to allow multiple individuals to work on the same codebase simultaneously without overwriting each other's changes. It tracks every modification, enabling users to revert to previous versions, compare changes, and merge contributions seamlessly.</p>
        </div>
        <div className="feature">
          <a href="https://nodejs.org/en/" target='_blank' className="feature-link">
            <img className="feature-img" src={ReactPic} alt="Minimal feature" />
          </a>
          <h3>React</h3>
          <p>React is a JavaScript library primarily used for building user interfaces (UIs), particularly for single-page applications. Its core purpose is to facilitate the creation of interactive and dynamic web experiences by allowing developers to build UIs using a component-based architecture.</p>
        </div>
        <div className="feature">
          <a href="https://vite.dev/" target='_blank' className="feature-link">
            <img className="feature-img" src={VitePic} alt="Reliable feature" />
          </a>
          <h3>Vite</h3>
          <p>Vite is a build tool used in web development to provide a faster and leaner development experience by offering an instant dev server with hot module replacement and a production build command that uses Rollup to output optimized static assets.</p>
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
