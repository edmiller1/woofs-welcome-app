import { protectedProcedure } from "@woofs/api";

export const updateProfile = async (data: { name?: string; image?: File }) => {
  const formData = new FormData();

  if (data.name) {
    formData.append("name", data.name);
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await protectedProcedure.patch<{
    result: { success: boolean };
  }>(`/user/update`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.result;
};
