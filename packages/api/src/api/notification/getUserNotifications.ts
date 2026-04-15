import { protectedProcedure } from "@woofs/api";
import type { Notification } from "@woofs/types";

export const getUserNotifications = async () => {
  const response = await protectedProcedure.get<Notification[]>(
    `/notification/user/notifications`,
  );

  return response.data;
};
