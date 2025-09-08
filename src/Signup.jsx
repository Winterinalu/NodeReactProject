import React, { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import { auth, db } from './firebase'
import { sendSignInLinkToEmail, signInWithEmailLink, updateProfile, signOut } from 'firebase/auth'
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
  const [pendingEmailSent, setPendingEmailSent] = useState(false)

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
      // Use email-link sign-in so the account is only created after the user clicks the emailed link.
      const actionCodeSettings = {
        // The URL the user will be redirected to after clicking the link.
        // Using hash router, send them back to the signup route so they can finish the flow.
        url: window.location.origin + '/#/signup',
        handleCodeInApp: true
      }
  await sendSignInLinkToEmail(auth, email, actionCodeSettings)
  // Persist the email so we can complete sign-in when the user returns (also helps if they open link on same device)
  window.localStorage.setItem('emailForSignIn', email)
  // Ensure we are signed out locally — some environments can surface a currentUser; explicitly sign out to be safe.
  try { await signOut(auth) } catch { /* non-fatal */ }
  setPendingEmailSent(true)
      console.log('Email sign-in link sent to', email)
    } catch (err) {
      console.error('Firebase signup error', err)
      setErrors((s) => ({ ...s, firebase: err.message || String(err) }))
    } finally {
      setLoading(false)
    }
  }

  // finalize: called after the user completed email-link sign-in and is authenticated
  const finalizeAccount = useCallback(async (user) => {
    try {
      setLoading(true)
      await updateProfile(user, { displayName: username })
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email: user.email,
        role: 'user',
        createdAt: serverTimestamp()
      })
      // stop waiting and navigate
      setPendingEmailSent(false)
      window.localStorage.removeItem('emailForSignIn')
      console.log('Signup finalized', { uid: user.uid })
      navigate('/')
    } catch (error) {
      console.error('Finalize error', error)
      setErrors((s) => ({ ...s, firebase: error.message || String(error) }))
    } finally {
      setLoading(false)
    }
  }, [username, navigate])

  // resend sign-in link
  const resendVerification = async () => {
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/#/signup',
        handleCodeInApp: true
      }
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      window.localStorage.setItem('emailForSignIn', email)
      setErrors((s) => ({ ...s, firebase: 'Sign-in link resent.' }))
    } catch (err) {
      setErrors((s) => ({ ...s, firebase: err.message || String(err) }))
    }
  }

  const cancelVerification = async () => {
    // clear pending state and stored email
    try {
      await signOut(auth)
    } catch (error) {
      console.warn('signOut error', error)
    }
    window.localStorage.removeItem('emailForSignIn')
    setPendingEmailSent(false)
  }

  const checkVerification = async () => {
    // Attempt to complete sign-in using the link the user clicked in their email.
    try {
      const url = window.location.href
      const storedEmail = window.localStorage.getItem('emailForSignIn')
      let emailForSignIn = storedEmail || email
      if (!emailForSignIn) {
        // If no email in storage or current field, ask the user to re-enter.
        // Keep this minimal: a prompt is acceptable for now.
        emailForSignIn = window.prompt('Please provide the email you used to sign up:')
      }
      if (!emailForSignIn) {
        setErrors((s) => ({ ...s, firebase: 'Email required to complete sign-in.' }))
        return
      }

      const result = await signInWithEmailLink(auth, emailForSignIn, url)
      const user = result.user || auth.currentUser
      if (user) {
        await finalizeAccount(user)
      } else {
        setErrors((s) => ({ ...s, firebase: 'Could not complete sign-in.' }))
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

      {pendingEmailSent ? (
            <div className="verification-container">
              <p>
        A sign-in link has been sent to <strong>{email}</strong>.
        Your account will be created only after you click the link in that email.
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
