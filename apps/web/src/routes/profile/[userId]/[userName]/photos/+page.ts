import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
  const { userId, userName, initialProfilePhotos } = await parent();

  return {
    userId,
    userName,
    initialProfilePhotos,
  };
};
