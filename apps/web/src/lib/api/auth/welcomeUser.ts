import { protectedProcedure } from "@woofs/api";

export const welcomeUser = async (name: string, image?: string) => {
  const response = await protectedProcedure.post<{ success: boolean }>(
    "/user/welcome",
    {
      name,
      image,
    },
  );

  return response.data;
};
