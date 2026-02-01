import { protectedProcedure } from "@woofs/api";
import type { Collection, CollectionWithItems } from "@woofs/types";

export const getCollections = async () => {
  const response = await protectedProcedure.get<CollectionWithItems[]>(
    "/collection/collections",
  );

  return response.data;
};
