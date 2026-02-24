import { protectedProcedure } from "@woofs/api";
import { Dog } from "@woofs/types";

export const getProfileDogs = async () => {
  const response = await protectedProcedure.get<{
    dogs: Dog[];
  }>(`/profile/dogs`);

  return response.data.dogs;
};
