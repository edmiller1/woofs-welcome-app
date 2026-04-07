import { protectedProcedure } from "@woofs/api";
import type { CollectionWithPlaces } from "@woofs/types";

export const getCollectionWithPlaces = async (
  profileId: string,
  collectionId: string,
  params?: { page?: number; limit?: number; search?: string },
) => {
  const response = await protectedProcedure.get<CollectionWithPlaces>(
    `/collection/${profileId}/${collectionId}`,
    { params },
  );

  return response.data;
};
