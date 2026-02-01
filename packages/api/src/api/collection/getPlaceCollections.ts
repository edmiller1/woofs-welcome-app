import { protectedProcedure } from "@woofs/api";
import type { PlaceCollection } from "@woofs/types";

export const getPlaceCollections = async (placeId: string) => {
  const response = await protectedProcedure.get<PlaceCollection[]>(
    `/collection/place-collections/${placeId}`,
  );

  return response.data;
};
