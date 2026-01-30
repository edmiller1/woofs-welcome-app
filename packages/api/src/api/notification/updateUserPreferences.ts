import { protectedProcedure } from "@woofs/api";
import type {
  UserNotificationPreferences,
  UserNotificationPreferencesInput,
} from "@woofs/types";

export const updateUserPreferences = async (
  updates: UserNotificationPreferencesInput,
) => {
  const response = await protectedProcedure.patch<UserNotificationPreferences>(
    "/notification/user/preferences",
    updates,
  );

  return response.data;
};
