import type { Load } from "@sveltejs/kit";
import { getUser } from "$lib/auth/guard";
import { api } from "$lib/api-helper";

export const load: Load = async ({ params }) => {
  const user = await getUser();

  const initialLocation = await api.location.getLocation(
    params.location?.toString()!,
  );

  return {
    user,
    pathname: params.location,
    initialLocation,
  };
};
