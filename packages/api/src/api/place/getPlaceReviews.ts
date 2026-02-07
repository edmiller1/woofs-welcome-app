import { protectedProcedure } from "@woofs/api";
import type { PlaceReview } from "@woofs/types";

export const getPlaceReviews = async (
  placeId: string,
  page: number,
  limit: number,
) => {
  const response = await protectedProcedure.get<PlaceReview[]>(
    `/place/reviews?placeId=${placeId}&page=${page}&limit=${limit}`,
  );

  return response.data;
};
