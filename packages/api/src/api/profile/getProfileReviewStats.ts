import { protectedProcedure } from "@woofs/api";
import type { ProfileReviewStats } from "@woofs/types";

export const getProfileReviewStats = async (profileId: string) => {
  const response = await protectedProcedure.get<ProfileReviewStats>(
    `/profile/${profileId}/reviews/stats`,
  );

  return response.data;
};
