import { protectedProcedure } from "@woofs/api";

export const removePlaceFromCollection = async (
  placeId: string,
  collectionId: string,
) => {
  const response = await protectedProcedure.post<{ isSuccess: boolean }>(
    "/collection/remove-place",
    {
      placeId,
      collectionId,
    },
  );

  return response.data;
};
