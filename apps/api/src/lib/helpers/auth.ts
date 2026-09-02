import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import { user } from "../../db/schema";

export interface UserAuthContext {
  provider: string | null;
  activeContext: string;
  isAdmin: boolean;
  profileImageId: string | null;
  altText: string | null | undefined;
}

/**
 * Loads everything customSession needs to enrich a session in a single
 * query, instead of four separate lookups of the same user row.
 */
export const getUserAuthContext = async (
  db: Db,
  userId: string,
): Promise<UserAuthContext | null> => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      profileImage: true,
    },
  });

  if (!userRecord) return null;

  return {
    provider: userRecord.provider ?? null,
    activeContext: userRecord.activeContext || "personal",
    isAdmin: userRecord.isAdmin ?? false,
    profileImageId: userRecord.profileImageId,
    altText: userRecord.profileImage?.altText,
  };
};
