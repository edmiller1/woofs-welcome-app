import { eq } from "drizzle-orm";
import { db } from "../../db";
import { user } from "../../db/schema";

export const getContext = async (userId: string) => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!userRecord) {
    return null;
  }

  return userRecord.activeContext || "personal";
};

export const isUserAdmin = async (userId: string) => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!userRecord) {
    return false;
  }

  return userRecord.isAdmin;
};

export const getUserProvider = async (
  userId: string,
): Promise<string | null> => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!userRecord) {
    return null;
  }

  return userRecord.provider;
};

export const getUserProfileImageId = async (userId: string) => {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      profileImage: true,
    },
  });

  if (!userRecord) {
    return null;
  }

  return {
    profileImageId: userRecord.profileImageId,
    altText: userRecord.profileImage?.altText,
  };
};
