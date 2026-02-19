import { protectedProcedure } from "@woofs/api";
import type { Profile } from "@woofs/types";

export const getProfile = async (profileId: string) => {
  const response = await protectedProcedure.get<Profile>(
    `/profile/${profileId}`,
  );

  return response.data;
};
