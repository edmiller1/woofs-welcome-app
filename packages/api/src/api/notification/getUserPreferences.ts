import { protectedProcedure } from "@woofs/api";

export const getUserPreferences = async () => {
  const response = await protectedProcedure.get(
    "/notification/user/preferences",
  );

  return response.data;
};
