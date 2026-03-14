import { protectedProcedure } from "@woofs/api";
import { UserNotificationPreferences } from "@woofs/types";

export const getUserPreferences = async () => {
  const response = await protectedProcedure.get<UserNotificationPreferences>(
    "/notification/user/preferences",
  );

  return response.data;
};
