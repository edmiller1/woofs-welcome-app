import { protectedProcedure } from "@woofs/api";
import type { UserNotificationPreferences } from "@woofs/types";

export const getUserPreferences = async () => {
  const response = await protectedProcedure.get<UserNotificationPreferences>(
    "/notification/user/preferences",
  );

  return response.data;
};
