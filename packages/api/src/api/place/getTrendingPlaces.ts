import { protectedProcedure } from "@woofs/api";
import type { TrendingPlace } from "@woofs/types";

export const getTrendingPlaces = async () => {
  const response =
    await protectedProcedure.get<TrendingPlace[]>("/place/trending");

  return response.data;
};
