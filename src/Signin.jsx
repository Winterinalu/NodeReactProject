import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import { auth } from './firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export default function Signin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u))
    return () => unsub()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      console.error('Sign in error', err)
      setErrors({ firebase: err.message || String(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      navigate('/')
    } catch (err) {
      setErrors({ firebase: err.message || String(err) })
    }
  }

  const modal = (
    <div className="signup-modal-overlay" onClick={() => navigate('/') }>
      <div className="signup-card" onClick={(e) => e.stopPropagation()}>
        <div className="signup-container">
          <button className="btn ghost small" onClick={() => navigate('/')}>← Back</button>
          <h2 style={{ marginTop: '1rem' }}>{user ? 'Account' : 'Sign In'}</h2>

          {user ? (
            <div style={{ marginTop: '1rem' }}>
              <p>Signed in as <strong>{user.email}</strong></p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn" onClick={() => navigate('/')}>Close</button>
                <button className="btn ghost" onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <button type="submit" className="btn">Sign In</button>
              {loading && <p style={{ marginTop: '0.5rem' }}>Signing in...</p>}
              {errors.firebase && <p className="error">{errors.firebase}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modal, document.body)
}
