import { protectedProcedure } from "@woofs/api";
import type { UserCollection } from "@woofs/types";

export const getProfileCollections = async (profileId: string) => {
  const response = await protectedProcedure.get<UserCollection>(
    `collection/profile/${profileId}`,
  );

  return response.data;
};
