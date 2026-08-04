import { protectedProcedure } from "@woofs/api";

export const deleteAccount = async () => {
  const response = await protectedProcedure.post<{ success: boolean }>(
    "/user/delete",
  );

  return response.data;
};
