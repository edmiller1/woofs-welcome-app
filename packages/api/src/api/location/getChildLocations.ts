import { protectedProcedure } from "@woofs/api";
import type { ChildLocation } from "@woofs/types";

export const getChildLocations = async (path: string) => {
  const response = await protectedProcedure.get<ChildLocation[]>(
    `${path}/children`,
  );
  return response.data;
};
