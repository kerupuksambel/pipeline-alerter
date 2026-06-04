import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { ACL } from "@/core/db/schemas/acl";
import { config } from "@/config";

export type ACLRow = typeof ACL.$inferSelect;
export type NewACL = typeof ACL.$inferInsert;

type StatusState = ACLRow["status"];

/**
 * Add a user to the ACL, or update the existing entry. Idempotent on
 * userId: if the user is already listed, its status/reason are overwritten
 * and updatedAt is bumped. Returns the resulting row.
 */
export const upsertACL = async (
  userId: number,
  status: StatusState,
  reason?: string,
): Promise<ACLRow> => {
  const values: NewACL = { userId, status, updatedAt: new Date() };
  if (reason !== undefined) values.reason = reason;

  const [row] = await db
    .insert(ACL)
    .values(values)
    .onConflictDoUpdate({
      target: ACL.userId,
      set: {
        status: values.status,
        // Keep the existing reason when none is supplied on update.
        ...(reason !== undefined ? { reason } : {}),
        updatedAt: values.updatedAt,
      },
    })
    .returning();

  return row!;
};

export const getACL = async (userId: number): Promise<ACLRow | undefined> => {
  const [row] = await db
    .select()
    .from(ACL)
    .where(eq(ACL.userId, userId))
    .limit(1);

  return row;
};

export const listACLs = async (): Promise<ACLRow[]> => {
  return db.select().from(ACL);
};

/**
 * Remove a user from the ACL. Returns the deleted row, or undefined if the
 * user was not listed.
 */
export const deleteACL = async (
  userId: number,
): Promise<ACLRow | undefined> => {
  const [row] = await db.delete(ACL).where(eq(ACL.userId, userId)).returning();

  return row;
};

/**
 * Decide whether a user is allowed, honouring config.ACL_MODE:
 *
 * - whitelist: deny by default; allowed only when explicitly listed with
 *   status "allow".
 * - blacklist: allow by default; denied only when explicitly listed with
 *   status "deny".
 */
export const isAllowed = async (userId: number): Promise<boolean> => {
  const entry = await getACL(userId);

  if (config.ACL_MODE === "whitelist") {
    return entry?.status === "allow";
  }

  // blacklist
  return entry?.status !== "deny";
};
