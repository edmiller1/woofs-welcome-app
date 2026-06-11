import { protectedProcedure } from "@woofs/api";
import type { Dog } from "@woofs/types";

export const getProfileDogs = async () => {
  const response = await protectedProcedure.get<Dog[]>(`/profile/dogs`);

  return response.data;
};
