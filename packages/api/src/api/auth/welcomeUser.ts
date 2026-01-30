import { protectedProcedure } from "@woofs/api";

export const welcomeUser = async (data: { name: string; image?: File }) => {
  const { name, image } = data;

  const formData = new FormData();
  formData.append("name", name);
  if (image) {
    formData.append("image", image);
  }

  const response = await protectedProcedure.post<{ success: boolean }>(
    "/user/welcome",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
