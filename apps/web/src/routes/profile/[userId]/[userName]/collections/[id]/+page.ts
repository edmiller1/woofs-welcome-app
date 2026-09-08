import { api } from "$lib/api-helper";
import { redirect, type Load } from "@sveltejs/kit";

export const ssr = false;

export const load: Load = async ({ params, parent }) => {
  const { userId, userName, id } = params;

  if (!userId || !userName || !id) {
    redirect(302, "/");
  }

  const { user } = await parent();

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
