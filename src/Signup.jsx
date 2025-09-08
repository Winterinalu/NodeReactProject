import React, { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import { auth, db } from './firebase'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, reload, signOut } from 'firebase/auth'
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
  const [pendingUser, setPendingUser] = useState(null)

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
      // Send verification email and wait for the user to confirm before creating their Firestore profile
  await sendEmailVerification(user)
  setPendingUser(user)
  // waiting for the user to verify their email
      console.log('Verification email sent to', email)
    } catch (err) {
      console.error('Firebase signup error', err)
      setErrors((s) => ({ ...s, firebase: err.message || String(err) }))
    } finally {
      setLoading(false)
    }
  }

  // finalize: called when user has verified their email
  const finalizeAccount = useCallback(async (user) => {
    try {
      setLoading(true)
      await updateProfile(user, { displayName: username })
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        role: 'user',
        createdAt: serverTimestamp()
      })
  // stop waiting and navigate
      setPendingUser(null)
      console.log('Signup finalized', { uid: user.uid })
      navigate('/')
    } catch (error) {
      console.error('Finalize error', error)
      setErrors((s) => ({ ...s, firebase: error.message || String(error) }))
    } finally {
      setLoading(false)
    }
  }, [username, email, navigate])

  // resend verification email
  const resendVerification = async () => {
    if (!pendingUser) return
    try {
  await sendEmailVerification(pendingUser)
      setErrors((s) => ({ ...s, firebase: 'Verification email resent.' }))
    } catch (err) {
      setErrors((s) => ({ ...s, firebase: err.message || String(err) }))
    }
  }

  const cancelVerification = async () => {
    // sign out and clear pending state
    try {
      await signOut(auth)
    } catch (error) {
      console.warn('signOut error', error)
    }
    setPendingUser(null)
  }

  const checkVerification = async () => {
    if (!pendingUser) return
    try {
      await reload(pendingUser)
      const fresh = auth.currentUser || pendingUser
      if (fresh.emailVerified) {
        await finalizeAccount(fresh)
      } else {
        setErrors((s) => ({ ...s, firebase: 'Email not verified yet.' }))
      }
    } catch (err) {
      setErrors((s) => ({ ...s, firebase: err.message || String(err) }))
    }
  }

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

          {pendingUser ? (
            <div className="verification-container">
              <p>
                A verification email has been sent to <strong>{email}</strong>.
                Please confirm your email before your account is created.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn" onClick={checkVerification} disabled={loading}>I've confirmed</button>
                <button className="btn ghost" onClick={resendVerification} disabled={loading}>Resend email</button>
                <button className="btn ghost small" onClick={cancelVerification} disabled={loading}>Cancel</button>
              </div>
              {loading && <p style={{ marginTop: '0.5rem' }}>Processing...</p>}
              {errors.firebase && <p className="error">{errors.firebase}</p>}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return ReactDOM.createPortal(modal, document.body)
}
