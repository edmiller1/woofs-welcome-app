import { protectedProcedure } from "@woofs/api";

export const deleteNotification = async (notificationId: string) => {
  const response = await protectedProcedure.delete(
    `/user/notifications/${notificationId}`,
  );

  return response.data;
};
