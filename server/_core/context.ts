import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getLucia } from "./lucia";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const sessionId = opts.req.cookies?.doe_session;
    if (sessionId) {
      const lucia = await getLucia();
      const { session, user: luciaUser } = await lucia.validateSession(sessionId);

      if (session && luciaUser) {
        // Convert Lucia user to our User type
        // Cast to access custom attributes defined in lucia.ts
        const attrs = luciaUser as unknown as {
          id: string;
          name: string | null;
          email: string | null;
          avatarUrl: string | null;
          role: "user" | "admin";
          optimizationCredits: number;
        };
        user = {
          id: attrs.id,
          name: attrs.name,
          email: attrs.email,
          avatarUrl: attrs.avatarUrl,
          role: attrs.role,
          optimizationCredits: attrs.optimizationCredits,
          createdAt: new Date(), // These will be fetched if needed
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };

        // Refresh session if needed
        if (session.fresh) {
          const sessionCookie = lucia.createSessionCookie(session.id);
          opts.res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error("[Auth] Session validation error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
