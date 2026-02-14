import { protectedProcedure } from "@woofs/api";

export const getTypes = async () => {
  const response = await protectedProcedure.get<string[]>("/place/types");

  return response.data;
};
