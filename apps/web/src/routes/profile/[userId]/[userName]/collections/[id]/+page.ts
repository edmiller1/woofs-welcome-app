import { api } from "$lib/api-helper";
import { getUser } from "$lib/auth/guard";
import { redirect, type Load } from "@sveltejs/kit";

export const ssr = false;

export const load: Load = async ({ params }) => {
  const { userId, userName, id } = params;

  if (!userId || !userName || !id) {
    redirect(302, "/");
  }

  const user = await getUser();

  const collectionWithPlaces = await api.collection.getCollectionWithPlaces(
    userId,
    id,
  );

  return {
    initialCollectionWithPlaces: collectionWithPlaces,
    userId,
    userName,
    id,
    user,
  };
};
