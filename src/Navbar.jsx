import React from 'react'
import { Link } from 'react-router-dom'

function Navbar({ logo }) {
  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/">
          <img src={logo} alt="logo" className="nav-logo" />
          <span className="brand-name">Hekk Represents</span>
        </Link>
  <Link className="btn btn-signup" to="/signup">Sign Up</Link>
      </div>
    </nav>
  )
}

export default Navbar
