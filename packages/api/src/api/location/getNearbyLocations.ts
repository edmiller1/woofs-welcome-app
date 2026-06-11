import { protectedProcedure } from "@woofs/api";
import type { ChildLocation } from "@woofs/types";

export const getNearbyLocations = async (path: string) => {
  const response = await protectedProcedure.get<ChildLocation[]>(
    `${path}/nearby`,
  );
  return response.data;
};
