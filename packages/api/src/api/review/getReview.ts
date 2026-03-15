import { protectedProcedure } from "@woofs/api";
import type { PlaceReview } from "@woofs/types";

export const getReview = async (reviewId: string) => {
  const response = await protectedProcedure.get<PlaceReview>(
    `/review/${reviewId}`,
  );

  return response.data;
};
