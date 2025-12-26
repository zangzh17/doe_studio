/**
 * Lucia Auth Configuration
 * Handles session management and authentication
 */

import { Lucia } from "lucia";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users } from "../../drizzle/schema";
import type { User } from "../../drizzle/schema";
import { getDb } from "../db";

// Create Lucia adapter lazily (database may not be available immediately)
let _adapter: DrizzleMySQLAdapter | null = null;
let _lucia: Lucia | null = null;

async function getAdapter() {
  if (!_adapter) {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    _adapter = new DrizzleMySQLAdapter(db, sessions, users);
  }
  return _adapter;
}

export async function getLucia(): Promise<Lucia> {
  if (!_lucia) {
    const adapter = await getAdapter();
    _lucia = new Lucia(adapter, {
      sessionCookie: {
        name: "doe_session",
        expires: false, // Session cookies
        attributes: {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      },
      getUserAttributes: (attributes) => {
        return {
          id: attributes.id,
          name: attributes.name,
          email: attributes.email,
          avatarUrl: attributes.avatarUrl,
          role: attributes.role,
          optimizationCredits: attributes.optimizationCredits,
        };
      },
    });
  }
  return _lucia;
}

// Type augmentation for Lucia
declare module "lucia" {
  interface Register {
    Lucia: Lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
  optimizationCredits: number;
}

// Helper function to generate user IDs
export function generateUserId(): string {
  // Generate a random ID using crypto
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
