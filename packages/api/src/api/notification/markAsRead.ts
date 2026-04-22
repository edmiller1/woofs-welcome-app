import { protectedProcedure } from "@woofs/api";

export const maerkAsRead = async (notificationId: string) => {
  const response = await protectedProcedure.delete(
    `/user/notifications/${notificationId}/read`,
  );

  return response.data;
};
