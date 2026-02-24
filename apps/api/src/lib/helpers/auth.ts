import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import { user } from "../../db/schema";

export const getContext = async (db: Db, userId: string) => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  return userRecord?.activeContext || "personal";
};

export const isUserAdmin = async (db: Db, userId: string) => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  return userRecord?.isAdmin ?? false;
};

export const getUserProvider = async (
  db: Db,
  userId: string,
): Promise<string | null> => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  return userRecord?.provider ?? null;
};

export const getUserProfileImageId = async (db: Db, userId: string) => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      profileImage: true,
    },
  });

  if (!userRecord) return null;

  return {
    profileImageId: userRecord.profileImageId,
    altText: userRecord.profileImage?.altText,
  };
};
