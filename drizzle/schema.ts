import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, datetime } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Updated for Lucia Auth integration.
 */
export const users = mysqlTable("users", {
  /** Primary key - string ID for Lucia compatibility */
  id: varchar("id", { length: 255 }).primaryKey(),
  /** User display name */
  name: text("name"),
  /** User email */
  email: varchar("email", { length: 320 }),
  /** Avatar URL */
  avatarUrl: text("avatarUrl"),
  /** User role */
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Remaining optimization credits */
  optimizationCredits: int("optimizationCredits").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Session table for Lucia Auth
 */
export const sessions = mysqlTable("sessions", {
  /** Session ID */
  id: varchar("id", { length: 255 }).primaryKey(),
  /** Reference to user */
  userId: varchar("userId", { length: 255 }).notNull().references(() => users.id),
  /** Session expiration */
  expiresAt: datetime("expiresAt").notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * OAuth Account table - links OAuth providers to users
 * Allows users to have multiple OAuth providers linked
 */
export const oauthAccounts = mysqlTable("oauth_accounts", {
  /** OAuth provider (google, wechat) */
  provider: varchar("provider", { length: 64 }).notNull(),
  /** Provider's user ID */
  providerUserId: varchar("providerUserId", { length: 255 }).notNull(),
  /** Reference to user */
  userId: varchar("userId", { length: 255 }).notNull().references(() => users.id),
  /** Access token (optional, for API calls) */
  accessToken: text("accessToken"),
  /** Refresh token (optional) */
  refreshToken: text("refreshToken"),
  /** Token expiration */
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type InsertOAuthAccount = typeof oauthAccounts.$inferInsert;

/**
 * DOE Design table - stores user's DOE designs
 */
export const doeDesigns = mysqlTable("doe_designs", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the user who owns this design */
  userId: varchar("userId", { length: 255 }).notNull(),
  /** Design name */
  name: varchar("name", { length: 255 }).notNull(),
  /** DOE mode: diffuser, 1d_splitter, 2d_spot_projector, lens, prism, custom */
  mode: varchar("mode", { length: 64 }).notNull(),
  /** Design status */
  status: mysqlEnum("status", ["draft", "optimized"]).default("draft").notNull(),
  /** DOE parameters stored as JSON */
  parameters: json("parameters"),
  /** Preview data stored as JSON */
  previewData: json("previewData"),
  /** Optimization result stored as JSON (references to S3 for large data) */
  optimizationResult: json("optimizationResult"),
  /** Phase map image URL (stored in S3) */
  phaseMapUrl: text("phaseMapUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DoeDesign = typeof doeDesigns.$inferSelect;
export type InsertDoeDesign = typeof doeDesigns.$inferInsert;

/**
 * DOE Templates table - stores pre-configured templates
 */
export const doeTemplates = mysqlTable("doe_templates", {
  id: int("id").autoincrement().primaryKey(),
  /** Template name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Template description */
  description: text("description"),
  /** DOE mode */
  mode: varchar("mode", { length: 64 }).notNull(),
  /** Category for grouping templates */
  category: varchar("category", { length: 64 }),
  /** Pre-configured parameters as JSON */
  parameters: json("parameters").notNull(),
  /** Thumbnail image URL */
  thumbnailUrl: text("thumbnailUrl"),
  /** Whether this template is active/visible */
  isActive: boolean("isActive").default(true).notNull(),
  /** Display order */
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DoeTemplate = typeof doeTemplates.$inferSelect;
export type InsertDoeTemplate = typeof doeTemplates.$inferInsert;
