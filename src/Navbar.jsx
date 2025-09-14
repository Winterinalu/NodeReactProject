import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar({ logo }) {
  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/">
          <img src={logo} alt="logo" className="nav-logo" />
          <span className="brand-name">Hekk Represents</span>
        </Link>
  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
    <Link className="btn btn-signin" to="/signin">Sign In</Link>
    <Link className="btn btn-signup" to="/signup">Sign Up</Link>
  </div>
      </div>
    </nav>
  )
}

export default Navbar
