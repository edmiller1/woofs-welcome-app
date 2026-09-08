import { publicProcedure } from "@woofs/api";
import type { PopularPlace } from "@woofs/types";

export const getPopularPlaces = async () => {
  const response = await publicProcedure.get<PopularPlace[]>("/place/popular");
  return response.data;
};
