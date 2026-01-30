import { protectedProcedure } from "@woofs/api";

export const resetUserPreferences = async () => {
  const response = await protectedProcedure.delete(
    "/notification/user/preferences",
  );

  return response.data;
};
