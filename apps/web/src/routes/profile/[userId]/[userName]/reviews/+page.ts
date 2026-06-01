import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
  const { userId, userName, initialProfileReviews, initialProfileReviewStats, initialProfile } = await parent();

  return {
    userId,
    userName,
    initialProfileReviews,
    initialProfileReviewStats,
    initialProfile,
  };
};
