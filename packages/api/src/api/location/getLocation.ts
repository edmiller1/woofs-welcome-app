import { protectedProcedure } from "@woofs/api";
import type { LocationWithDetails } from "@woofs/types";

export const getLocation = async (path: string) => {
  const response = await protectedProcedure.get<LocationWithDetails>(path);

  return response.data;
};
