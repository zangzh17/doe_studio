import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, doeDesigns, InsertDoeDesign, DoeDesign, doeTemplates, DoeTemplate, InsertDoeTemplate } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== DOE Designs ====================

export async function createDoeDesign(design: InsertDoeDesign): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(doeDesigns).values(design);
  return result[0].insertId;
}

export async function getDoeDesignsByUserId(userId: string): Promise<DoeDesign[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(doeDesigns)
    .where(eq(doeDesigns.userId, userId))
    .orderBy(desc(doeDesigns.updatedAt));
}

export async function getDoeDesignById(id: number, userId: string): Promise<DoeDesign | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(doeDesigns)
    .where(and(eq(doeDesigns.id, id), eq(doeDesigns.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateDoeDesign(
  id: number,
  userId: string,
  updates: Partial<Omit<InsertDoeDesign, "id" | "userId" | "createdAt">>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .update(doeDesigns)
    .set(updates)
    .where(and(eq(doeDesigns.id, id), eq(doeDesigns.userId, userId)));

  return result[0].affectedRows > 0;
}

export async function deleteDoeDesign(id: number, userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .delete(doeDesigns)
    .where(and(eq(doeDesigns.id, id), eq(doeDesigns.userId, userId)));

  return result[0].affectedRows > 0;
}

// ==================== DOE Templates ====================

export async function getActiveTemplates(): Promise<DoeTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(doeTemplates)
    .where(eq(doeTemplates.isActive, true))
    .orderBy(doeTemplates.displayOrder);
}

export async function getTemplateById(id: number): Promise<DoeTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(doeTemplates)
    .where(eq(doeTemplates.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createTemplate(template: InsertDoeTemplate): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(doeTemplates).values(template);
  return result[0].insertId;
}

export async function updateTemplate(
  id: number,
  updates: Partial<Omit<InsertDoeTemplate, "id" | "createdAt">>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .update(doeTemplates)
    .set(updates)
    .where(eq(doeTemplates.id, id));

  return result[0].affectedRows > 0;
}

export async function deleteTemplate(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .delete(doeTemplates)
    .where(eq(doeTemplates.id, id));

  return result[0].affectedRows > 0;
}


// User Credits
export async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 10; // Default free credits

  const result = await db
    .select({ credits: users.optimizationCredits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0]?.credits ?? 10;
}

export async function updateUserCredits(userId: string, credits: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .update(users)
    .set({ optimizationCredits: credits })
    .where(eq(users.id, userId));

  return result[0].affectedRows > 0;
}

export async function decrementUserCredits(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .update(users)
    .set({ optimizationCredits: sql`${users.optimizationCredits} - 1` })
    .where(and(eq(users.id, userId), sql`${users.optimizationCredits} > 0`));

  return result[0].affectedRows > 0;
}
