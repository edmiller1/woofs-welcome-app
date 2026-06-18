import { protectedProcedure } from "@woofs/api";
import type { ChildLocation } from "@woofs/types";

export const getChildLocations = async (path: string, depth?: number) => {
  const response = await protectedProcedure.get<ChildLocation[]>(
    `${path}/children`,
    { params: depth && depth > 1 ? { depth } : undefined },
  );
  return response.data;
};
