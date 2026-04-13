import { protectedProcedure } from "@woofs/api";
import type { CommunityReview } from "@woofs/types";

export const getCommunityReviews = async (params: {
  page: number;
  limit: number;
}) => {
  const response = await protectedProcedure.get<CommunityReview>(
    `/review/community`,
    {
      params,
    },
  );

  return response.data;
};
