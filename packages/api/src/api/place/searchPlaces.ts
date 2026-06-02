import { protectedProcedure } from "@woofs/api";
import type { SearchResults } from "@woofs/types";

export const searchPlaces = async (q: string) => {
  const response = await protectedProcedure.get<SearchResults>("/place/search", {
    params: { q },
  });

  return response.data;
};
