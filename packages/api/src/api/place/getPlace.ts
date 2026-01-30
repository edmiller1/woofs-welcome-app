import { protectedProcedure } from "@woofs/api";
import type { PlaceWithDetails } from "@woofs/types";

export const getPlace = async (path: string) => {
  const response = await protectedProcedure.get<PlaceWithDetails>(path);

  return response.data;
};
