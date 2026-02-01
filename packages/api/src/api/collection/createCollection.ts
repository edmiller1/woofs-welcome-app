import { protectedProcedure } from "@woofs/api";

export const createCollection = async (name: string, description?: string) => {
  const response = await protectedProcedure.post<{
    collectionId: string;
    isSuccessL: boolean;
  }>("/collection/create", {
    name,
    description,
  });

  return response.data;
};
