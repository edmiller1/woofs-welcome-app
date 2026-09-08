import { publicProcedure } from "@woofs/api";
import type { FeaturedLocation } from "@woofs/types";

export const getFeaturedLocations = async () => {
  const response = await publicProcedure.get<FeaturedLocation[]>(
    "/location/featured",
  );
  return response.data;
};
