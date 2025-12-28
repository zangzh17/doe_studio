/**
 * Session management utilities
 * Works with Lucia Auth
 */

import { Lucia } from 'lucia'
import { generateUserId } from './lucia'

/**
 * Generate a random session token
 */
export function generateSessionToken(): string {
  return generateUserId()
}

/**
 * Create a new session
 */
export async function createSession(lucia: Lucia, sessionToken: string, userId: string) {
  return await lucia.createSession(sessionToken, {
    userId,
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  })
}

/**
 * Get session from token
 */
export async function getSession(lucia: Lucia, sessionToken: string) {
  return await lucia.validateSession(sessionToken)
}

/**
 * Invalidate a session
 */
export async function invalidateSession(lucia: Lucia, sessionId: string) {
  await lucia.invalidateSession(sessionId)
}