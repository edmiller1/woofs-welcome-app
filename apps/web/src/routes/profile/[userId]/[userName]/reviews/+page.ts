import { api } from "$lib/api-helper";
import { redirect, type Load } from "@sveltejs/kit";

export const ssr = false;

export const load: Load = async ({ params }) => {
  const { userId, userName } = params;

  if (!userId || !userName) {
    throw redirect(302, "/");
  }

  const profileReviewStats = await api.profile.getProfileReviewStats(userId);

  return {
    userId,
    userName,
    initialProfileReviewStats: profileReviewStats,
  };
};
