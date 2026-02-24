import { protectedProcedure } from "@woofs/api";
import { UpdateProfileData } from "@woofs/types";

export const updateProfile = async (data: UpdateProfileData) => {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.image) formData.append("image", data.image);
  if (data.currentCity !== undefined)
    formData.append(
      "currentCity",
      data.currentCity ? JSON.stringify(data.currentCity) : "",
    );
  if (data.instagram !== undefined)
    formData.append("instagram", data.instagram);
  if (data.facebook !== undefined) formData.append("facebook", data.facebook);
  if (data.x !== undefined) formData.append("x", data.x);
  if (data.tiktok !== undefined) formData.append("tiktok", data.tiktok);

  if (data.dogs) formData.append("dogs", JSON.stringify(data.dogs));
  if (data.removeDogIds)
    formData.append("removeDogIds", JSON.stringify(data.removeDogIds));

  if (data.dogImages) {
    for (const file of data.dogImages) {
      formData.append("dogImages", file);
    }
  }

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
  }>(`/profile/update`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.result;
};
