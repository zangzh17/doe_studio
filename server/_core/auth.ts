/**
 * Authentication Routes
 * Handles Google and WeChat OAuth flows with Lucia Auth
 */

import { Router, Request, Response } from "express";
import { generateState, generateCodeVerifier } from "arctic";
import { eq, and } from "drizzle-orm";
import { getLucia, generateUserId } from "./lucia";
import { googleAuth, wechatAuth } from "./oauth-providers";
import { getDb } from "../db";
import { users, oauthAccounts } from "../../drizzle/schema";
import { ENV } from "./env";

const router = Router();

// Cookie options for OAuth state
const stateCookieOptions = {
  httpOnly: true,
  secure: ENV.isProduction,
  sameSite: "lax" as const,
  maxAge: 60 * 10 * 1000, // 10 minutes
  path: "/",
};

// ==================== Google OAuth ====================

/**
 * Google OAuth - Initiate login
 */
router.get("/google", async (req: Request, res: Response) => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = googleAuth.createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"]);

    res.cookie("google_oauth_state", state, stateCookieOptions);
    res.cookie("google_code_verifier", codeVerifier, stateCookieOptions);
    res.redirect(url.toString());
  } catch (error) {
    console.error("[Google OAuth] Error initiating:", error);
    res.redirect("/?error=oauth_init_failed");
  }
});

/**
 * Google OAuth - Callback handler
 */
router.get("/google/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const storedState = req.cookies.google_oauth_state;
  const storedCodeVerifier = req.cookies.google_code_verifier;

  // Verify state
  if (!code || !state || state !== storedState || !storedCodeVerifier) {
    console.error("[Google OAuth] Invalid state or missing code");
    return res.redirect("/?error=oauth_state_invalid");
  }

  try {
    // Exchange code for tokens
    const tokens = await googleAuth.validateAuthorizationCode(code, storedCodeVerifier);

    // Get user info from Google
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    const googleUser = await response.json();

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Check if OAuth account already exists
    const existingAccount = await db
      .select()
      .from(oauthAccounts)
      .where(and(
        eq(oauthAccounts.provider, "google"),
        eq(oauthAccounts.providerUserId, googleUser.sub)
      ))
      .limit(1);

    let userId: string;

    if (existingAccount.length > 0) {
      // User exists, get their ID
      userId = existingAccount[0].userId;

      // Update last signed in
      await db.update(users).set({
        lastSignedIn: new Date(),
        name: googleUser.name,
        avatarUrl: googleUser.picture,
      }).where(eq(users.id, userId));
    } else {
      // Create new user
      userId = generateUserId();
      const isAdmin = googleUser.email === ENV.ADMIN_EMAIL;

      await db.insert(users).values({
        id: userId,
        name: googleUser.name,
        email: googleUser.email,
        avatarUrl: googleUser.picture,
        role: isAdmin ? "admin" : "user",
        optimizationCredits: 10,
        lastSignedIn: new Date(),
      });

      // Link OAuth account
      await db.insert(oauthAccounts).values({
        provider: "google",
        providerUserId: googleUser.sub,
        userId: userId,
        accessToken: tokens.accessToken(),
      });
    }

    // Create session
    const lucia = await getLucia();
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Clear OAuth cookies
    res.clearCookie("google_oauth_state");
    res.clearCookie("google_code_verifier");

    // Set session cookie and redirect
    res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    res.redirect("/studio");
  } catch (error) {
    console.error("[Google OAuth] Callback error:", error);
    res.redirect("/?error=oauth_callback_failed");
  }
});

// ==================== WeChat OAuth ====================

/**
 * WeChat OAuth - Initiate login
 */
router.get("/wechat", async (req: Request, res: Response) => {
  try {
    const state = generateState();
    const url = wechatAuth.createAuthorizationURL(state);

    res.cookie("wechat_oauth_state", state, stateCookieOptions);
    res.redirect(url.toString());
  } catch (error) {
    console.error("[WeChat OAuth] Error initiating:", error);
    res.redirect("/?error=oauth_init_failed");
  }
});

/**
 * WeChat OAuth - Callback handler
 */
router.get("/wechat/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const storedState = req.cookies.wechat_oauth_state;

  // Verify state
  if (!code || !state || state !== storedState) {
    console.error("[WeChat OAuth] Invalid state or missing code");
    return res.redirect("/?error=oauth_state_invalid");
  }

  try {
    // Exchange code for tokens
    const tokens = await wechatAuth.validateAuthorizationCode(code);

    // Get user info from WeChat
    const wechatUser = await wechatAuth.getUserInfo(tokens.accessToken, tokens.openId);

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Use unionId if available, otherwise openId
    const providerUserId = wechatUser.unionId || wechatUser.openId;

    // Check if OAuth account already exists
    const existingAccount = await db
      .select()
      .from(oauthAccounts)
      .where(and(
        eq(oauthAccounts.provider, "wechat"),
        eq(oauthAccounts.providerUserId, providerUserId)
      ))
      .limit(1);

    let userId: string;

    if (existingAccount.length > 0) {
      // User exists, get their ID
      userId = existingAccount[0].userId;

      // Update last signed in
      await db.update(users).set({
        lastSignedIn: new Date(),
        name: wechatUser.nickname,
        avatarUrl: wechatUser.headImgUrl,
      }).where(eq(users.id, userId));
    } else {
      // Create new user
      userId = generateUserId();

      await db.insert(users).values({
        id: userId,
        name: wechatUser.nickname,
        email: null, // WeChat doesn't provide email
        avatarUrl: wechatUser.headImgUrl,
        role: "user",
        optimizationCredits: 10,
        lastSignedIn: new Date(),
      });

      // Link OAuth account
      await db.insert(oauthAccounts).values({
        provider: "wechat",
        providerUserId: providerUserId,
        userId: userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    }

    // Create session
    const lucia = await getLucia();
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Clear OAuth cookies
    res.clearCookie("wechat_oauth_state");

    // Set session cookie and redirect
    res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    res.redirect("/studio");
  } catch (error) {
    console.error("[WeChat OAuth] Callback error:", error);
    res.redirect("/?error=oauth_callback_failed");
  }
});

// ==================== Logout ====================

/**
 * Logout - Invalidate session
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const lucia = await getLucia();
    const sessionId = req.cookies.doe_session;

    if (sessionId) {
      await lucia.invalidateSession(sessionId);
    }

    const blankCookie = lucia.createBlankSessionCookie();
    res.cookie(blankCookie.name, blankCookie.value, blankCookie.attributes);
    res.json({ success: true });
  } catch (error) {
    console.error("[Logout] Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

export function registerAuthRoutes(app: Router) {
  app.use("/api/auth", router);
}
