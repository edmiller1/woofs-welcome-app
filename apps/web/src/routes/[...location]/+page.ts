import type { Load } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { getUser } from "$lib/auth/guard";
import { api } from "$lib/api-helper";

export const load: Load = async ({ params }) => {
  const path = params.location?.toString() ?? "";

  if (path.includes(".")) {
    error(404, "Not found");
  }

  const user = await getUser();

  let initialLocation;
  try {
    initialLocation = await api.location.getLocation(path);
  } catch {
    error(404, "Not found");
  }

  return {
    user,
    pathname: path,
    initialLocation,
  };
};
