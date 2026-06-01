import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
  const { userId, userName, initialProfileCollections, isOwner } = await parent();

  return {
    userId,
    userName,
    initialProfileCollections,
    isOwner,
  };
};
