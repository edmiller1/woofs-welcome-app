import { protectedProcedure } from "@woofs/api";

export const markAllAsRead = async () => {
  const response = await protectedProcedure.put(`/user/notifications/read`);

  return response.data;
};
