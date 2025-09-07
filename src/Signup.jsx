import React from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

export default function Signup() {
  const navigate = useNavigate()
  return (
    <div id="root" className="app">
      <div className="container">
        <div style={{ padding: '2rem', textAlign: 'left' }} className="card">
          <button className="btn ghost small" onClick={() => navigate('/')}>← Back</button>
          <h2 style={{ marginTop: '1rem' }}>Sign Up</h2>
          {/* Signup form will go here later */}
        </div>
      </div>
    </div>
  )
}
