import { protectedProcedure } from "@woofs/api";

export const getDogBreeds = async () => {
  const response = await protectedProcedure.get<string[]>("/review/dog-breeds");

  return response.data;
};
