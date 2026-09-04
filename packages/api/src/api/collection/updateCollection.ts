import { protectedProcedure } from "@woofs/api";

export const updateCollection = async (
  collectionId: string,
  data: { name?: string; description?: string },
) => {
  const response = await protectedProcedure.patch<{ isSuccess: boolean }>(
    `/collection/update/${collectionId}`,
    data,
  );

  return response.data;
};
