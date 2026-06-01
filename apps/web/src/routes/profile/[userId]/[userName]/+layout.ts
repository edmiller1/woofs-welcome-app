import { api } from "$lib/api-helper";
import { getUser } from "$lib/auth/guard";
import { redirect, type Load } from "@sveltejs/kit";

export const ssr = false;

export const load: Load = async ({ params }) => {
  const { userId, userName } = params;

  if (!userId || !userName) {
    throw redirect(302, "/");
  }

  const user = await getUser();

  const [initialProfile, initialProfileReviews, initialProfileReviewStats, initialProfileCollections, initialProfilePhotos] =
    await Promise.all([
      api.profile.getProfile(userId),
      api.profile.getProfileReviews(userId, 12, "createdAt_desc"),
      api.profile.getProfileReviewStats(userId),
      api.collection.getProfileCollections(userId),
      api.profile.getProfilePhotos(userId),
    ]);

  const isOwner = userId === user?.id;

  return {
    user,
    userName,
    userId,
    initialProfile,
    initialProfileReviews,
    initialProfileReviewStats,
    initialProfileCollections,
    initialProfilePhotos,
    isOwner,
  };
};
