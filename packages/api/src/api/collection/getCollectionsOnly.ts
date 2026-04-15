import { protectedProcedure } from "@woofs/api";
import type { LimitedCollection } from "@woofs/types";

export const getCollectionsOnly = async () => {
  const response = await protectedProcedure.get<LimitedCollection[]>(
    `/collection/collections/limit`,
  );

  return response.data;
};
