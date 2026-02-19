import { api } from "$lib/api-helper";
import { getUser } from "$lib/auth/guard";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
  const { userId, userName } = params;

  if (!userId || !userName) {
    throw redirect(302, "/");
  }

  const user = await getUser();

  const initialProfile = await api.profile.getProfile(userId);

  return {
    user,
    userName,
    userId,
    initialProfile,
  };
};
