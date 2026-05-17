import { protectedProcedure } from "@woofs/api";
import type { ExplorePlacesResult, ExplorePlacesParams } from "@woofs/types";

export const explorePlaces = async (data: ExplorePlacesParams) => {
  const response = await protectedProcedure.get<ExplorePlacesResult>("/place/explore", {
    params: {
      swLat: data.swLat,
      swLng: data.swLng,
      neLat: data.neLat,
      neLng: data.neLng,
      types: data.types?.join(","),
      rating: data.rating,
      distance: data.distance,
      minLength: data.minLength,
      maxLength: data.maxLength,
      difficulty: data.difficulty,
    },
  });

  return response.data;
};
