/**
 * Supabase Authentication Service
 * Handles email-based authentication using Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { ENV } from './env'
import { getDb, createUser, getUserByEmail, updateUser } from '../db'
import { generateUserId } from './lucia'
import type { User } from '../../drizzle/schema'

// Supabase client
let _supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_supabaseClient) {
    const url = ENV.SUPABASE_URL || ''
    const anonKey = ENV.SUPABASE_ANON_KEY || ''

    if (!url || !anonKey) {
      throw new Error('Supabase configuration missing')
    }

    _supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false, // We'll handle sessions ourselves
        autoRefreshToken: false,
      }
    })
  }
  return _supabaseClient
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, name?: string) {
  const client = getSupabaseClient()

  // Check if user already exists in our database
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  // Sign up with Supabase
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      }
    }
  })

  if (error) {
    throw error
  }

  if (data.user) {
    // Create user in our database
    const userId = generateUserId()
    const newUser: User = await createUser({
      id: userId,
      name: name || email.split('@')[0],
      email,
      emailVerified: data.user.email_confirmed_at ? true : false,
      supabaseUserId: data.user.id,
      role: 'user',
      optimizationCredits: 10,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    })

    return {
      user: newUser,
      emailConfirmed: !!data.user.email_confirmed_at,
    }
  }

  throw new Error('Failed to create user')
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient()

  // Sign in with Supabase
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  if (data.user) {
    // Get or create user in our database
    let user = await getUserByEmail(email)

    if (!user) {
      // User exists in MemFire but not in our DB - create it
      const userId = generateUserId()
      user = await createUser({
        id: userId,
        name: data.user.user_metadata?.name || email.split('@')[0],
        email,
        emailVerified: data.user.email_confirmed_at ? true : false,
        supabaseUserId: data.user.id,
        role: 'user',
        optimizationCredits: 10,
        avatarUrl: data.user.user_metadata?.avatar_url || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      })
    } else {
      // Update last signed in
      await updateUser(user.id, {
        lastSignedIn: new Date(),
        emailVerified: data.user.email_confirmed_at ? true : user.emailVerified,
      })
    }

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
    }
  }

  throw new Error('Failed to sign in')
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  const client = getSupabaseClient()

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${ENV.BASE_URL}/auth/reset-password`,
  })

  if (error) {
    throw error
  }

  return { success: true }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
  const client = getSupabaseClient()

  const { error } = await client.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  })

  if (error) {
    throw error
  }

  return { success: true }
}

/**
 * Update password with reset token
 */
export async function updatePasswordWithToken(token: string, newPassword: string) {
  const client = getSupabaseClient()

  // First verify the token
  const { error: verifyError } = await client.auth.verifyOtp({
    token_hash: token,
    type: 'recovery',
  })

  if (verifyError) {
    throw verifyError
  }

  // Then update the password
  const { error } = await client.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }

  return { success: true }
}

/**
 * Get user info from Supabase by ID
 */
export async function getSupabaseUser(userId: string) {
  const client = getSupabaseClient()

  const { data, error } = await client.auth.admin.getUserById(userId)

  if (error) {
    throw error
  }

  return data.user
}