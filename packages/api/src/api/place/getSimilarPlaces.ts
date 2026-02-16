import { protectedProcedure } from "@woofs/api";
import type { PlaceWithDetails } from "@woofs/types";

export const getSimilarPlaces = async (placeId: string, limit: number) => {
  const response = await protectedProcedure.get<PlaceWithDetails[]>(
    `/place/similar/${placeId}`,
    {
      params: {
        limit,
      },
    },
  );

  return response.data;
};
