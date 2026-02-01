import { protectedProcedure } from "@woofs/api";

export const addPlaceToCollection = async (
  placeId: string,
  collectionId?: string,
) => {
  const response = await protectedProcedure.post<{
    collectionId: string;
    isSucess: boolean;
  }>("/collection/save-place", {
    placeId,
    collectionId,
  });

  return response.data;
};
