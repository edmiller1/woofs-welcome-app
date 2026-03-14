import { protectedProcedure } from "@woofs/api";
import type { UpdateProfileSettingsInput } from "@woofs/types";

export const updateProfileSettings = async (
  data: UpdateProfileSettingsInput,
) => {
  const formData = new FormData();

  if (data.showAbout !== undefined)
    formData.append("showAbout", String(data.showAbout));
  if (data.showDogs !== undefined)
    formData.append("showDogs", String(data.showDogs));
  if (data.showCheckIns !== undefined)
    formData.append("showCheckIns", String(data.showCheckIns));
  if (data.showReviews !== undefined)
    formData.append("showReviews", String(data.showReviews));
  if (data.showCollections !== undefined)
    formData.append("showCollections", String(data.showCollections));

  const response = await protectedProcedure.patch<{
    result: { success: boolean };
  }>(`/profile/update/settings`, formData);
  return response.data.result;
};
