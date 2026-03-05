import { protectedProcedure } from "@woofs/api";
import type { CollectionWithPlaces } from "@woofs/types";

export const getCollectionWithPlaces = async (
  profileId: string,
  collectionId: string,
) => {
  const response = await protectedProcedure.get<CollectionWithPlaces>(
    `/collection/${profileId}/${collectionId}`,
  );

  return response.data;
};
