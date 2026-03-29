import { protectedProcedure } from "@woofs/api";
import type { ExploreResult } from "@woofs/types";

export const getExplorePlaces = async (
  path: string,
  filters: { types?: string[]; page?: number },
) => {
  const response = await protectedProcedure.get<ExploreResult>(
    `${path}/explore`,
    {
      params: {
        types: filters.types?.join(","),
        page: filters.page,
      },
    },
  );

  return response.data;
};
