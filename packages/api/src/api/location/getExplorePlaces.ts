import { protectedProcedure } from "@woofs/api";
import type { ExploreResult } from "@woofs/types";

export const getExplorePlaces = async (
  path: string,
  filters: {
    types?: string[];
    page?: number;
    bbox?: { swLat: number; swLng: number; neLat: number; neLng: number };
  },
) => {
  const response = await protectedProcedure.get<ExploreResult>(
    `${path}/explore`,
    {
      params: {
        types: filters.types?.join(","),
        page: filters.page,
        ...(filters.bbox && {
          swLat: filters.bbox.swLat,
          swLng: filters.bbox.swLng,
          neLat: filters.bbox.neLat,
          neLng: filters.bbox.neLng,
        }),
      },
    },
  );

  return response.data;
};
