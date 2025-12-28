/**
 * Email Authentication Routes
 * Handles email-based authentication with Supabase
 */

import { Router } from 'express'
import { z } from 'zod'
import { getLucia } from './lucia'
import { signUpWithEmail, signInWithEmail, sendPasswordResetEmail, verifyEmail, updatePasswordWithToken, getSupabaseClient } from './supabase-auth'
import { generateSessionToken, createSession } from './session'
import { ENV } from './env'

const router = Router()

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
})

const updatePasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
})

/**
 * Email registration endpoint
 */
router.post('/register', async (req, res) => {
  try {
    const validated = signUpSchema.parse(req.body)

    // Sign up with MemFire
    const result = await signUpWithEmail(validated.email, validated.password, validated.name)

    if (result.emailConfirmed) {
      // Email is already confirmed, create session
      const { user } = await signInWithEmail(validated.email, validated.password)
      const lucia = await getLucia()
      const sessionToken = generateSessionToken()
      const session = await createSession(lucia, sessionToken, user.id)

      // Set session cookie
      const cookie = lucia.createSessionCookie(session.id)
      res.cookie(cookie.name, cookie.value, cookie.attributes)

      return res.json({
        success: true,
        user,
        emailConfirmed: true,
      })
    } else {
      // Email confirmation required
      return res.json({
        success: true,
        message: 'Registration successful. Please check your email to confirm your account.',
        emailConfirmed: false,
      })
    }
  } catch (error) {
    console.error('Registration error:', error)
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Registration failed',
    })
  }
})

/**
 * Email login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const validated = signInSchema.parse(req.body)

    // Sign in with MemFire
    const result = await signInWithEmail(validated.email, validated.password)

    // Create session
    const lucia = await getLucia()
    const sessionToken = generateSessionToken()
    const session = await createSession(lucia, sessionToken, result.user.id)

    // Set session cookie
    const cookie = lucia.createSessionCookie(session.id)
    res.cookie(cookie.name, cookie.value, cookie.attributes)

    return res.json({
      success: true,
      user: result.user,
      emailConfirmed: result.user.emailVerified,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Login failed',
    })
  }
})

/**
 * Password reset request endpoint
 */
router.post('/reset-password', async (req, res) => {
  try {
    const validated = resetPasswordSchema.parse(req.body)

    await sendPasswordResetEmail(validated.email)

    return res.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to send reset email',
    })
  }
})

/**
 * Update password with token endpoint
 */
router.post('/update-password', async (req, res) => {
  try {
    const validated = updatePasswordSchema.parse(req.body)

    await updatePasswordWithToken(validated.token, validated.password)

    return res.json({
      success: true,
      message: 'Password updated successfully. You can now log in with your new password.',
    })
  } catch (error) {
    console.error('Update password error:', error)
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to update password',
    })
  }
})

/**
 * Email verification endpoint
 */
router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token as string

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' })
    }

    await verifyEmail(token)

    // Redirect to login page with success message
    res.redirect(`${ENV.BASE_URL}/login?verified=true`)
  } catch (error) {
    console.error('Email verification error:', error)
    res.redirect(`${ENV.BASE_URL}/login?verified=false&error=${encodeURIComponent(error instanceof Error ? error.message : 'Verification failed')}`)
  }
})

/**
 * Resend verification email endpoint
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body)

    const client = getSupabaseClient()

    const { error } = await client.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      throw error
    }

    return res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to resend verification email',
    })
  }
})

export default router