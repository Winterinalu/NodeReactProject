import React from 'react'

function Navbar({ logo }) {
  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <a className="brand" href="#">
          <img src={logo} alt="logo" className="nav-logo" />
          <span className="brand-name">Hekk Represents</span>
        </a>
      </div>
    </nav>
  )
}

export default Navbar
