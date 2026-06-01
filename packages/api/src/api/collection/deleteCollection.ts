import { protectedProcedure } from "@woofs/api";

export const deleteCollection = async (collectionId: string) => {
  const response = await protectedProcedure.delete<{ isSuccess: boolean }>(
    `/collection/delete/${collectionId}`,
  );

  return response.data;
};
