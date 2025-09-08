import React, { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import { auth, db } from './firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export default function Signup() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = useCallback(() => {
    const newErrors = {}

    if (!/^[A-Za-z0-9]{5,}$/.test(username)) {
      newErrors.username = 'Username must be at least 5 characters (letters and numbers only).'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password)) {
      newErrors.password = 'Password must be at least 6 chars, with uppercase, number, and special char.'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0)
  }, [username, email, password, confirmPassword])

  useEffect(() => {
    validate()
  }, [validate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setErrors((s) => ({ ...s, firebase: undefined }))
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCred.user
      // finalize immediately: set displayName and create Firestore profile
      await updateProfile(user, { displayName: username })
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        role: 'user',
        createdAt: serverTimestamp()
      })
      console.log('User created', user.uid)
      navigate('/')
    } catch (err) {
      console.error('Firebase signup error', err)
      setErrors((s) => ({ ...s, firebase: err.message || String(err) }))
    } finally {
      setLoading(false)
    }
  }

  // (no-op here) account is finalized immediately after creation in handleSubmit

  // No email-link flow anymore; immediate registration is used.

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // No automatic polling: finalization only happens when the user clicks "I've confirmed"

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true); return () => setMounted(false) }, [])

  const handleEmailChange = (e) => {
    const value = e.target.value
    const parts = value.split('@')
    if (parts.length > 1) {
      setEmail(parts[0] + '@' + parts[1].toLowerCase())
    } else {
      setEmail(value)
    }
  }

  const modal = (
    <div className="signup-modal-overlay" onClick={() => navigate('/') }>
      <div className="signup-card" onClick={(e) => e.stopPropagation()}>
        <div className="signup-container">
          <button className="btn ghost small" onClick={() => navigate('/')}>← Back</button>
          <h2 style={{ marginTop: '1rem' }}>Sign Up</h2>

            <form className="signup-form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>

          {/* Floating Show/Hide Button */}
          <div className="floating-container">
            <button
              type="button"
              className="btn ghost small"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide Passwords' : 'Show Passwords'}
            </button>
          </div>

            <button type="submit" className="btn" disabled={!isValid}>
              Sign Up
            </button>
            {loading && <p style={{ marginTop: '0.5rem' }}>Creating account...</p>}
            {errors.firebase && <p className="error">{errors.firebase}</p>}
            </form>
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return ReactDOM.createPortal(modal, document.body)
}
