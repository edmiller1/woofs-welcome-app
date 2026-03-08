import { protectedProcedure } from "@woofs/api";
import type { UserReview } from "@woofs/types";

export const getProfileReviews = async (
  profileId: string,
  limit: number,
  sortBy: string,
  rating?: number,
  cursor?: string,
) => {
  const response = await protectedProcedure.get<UserReview>(
    `/profile/${profileId}/reviews`,
    {
      params: {
        limit,
        sortBy,
        ...(rating && { rating }),
        ...(cursor && { cursor }),
      },
    },
  );

  return response.data;
};
