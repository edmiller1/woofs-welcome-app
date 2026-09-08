import { browser } from "$app/environment";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ url, parent }) => {
  const { user } = await parent();
  const searchParams = url.searchParams;
  const redirectTo = searchParams.get("redirect") || "/";

  if (browser) {
    if (!user) {
      throw redirect(303, "/sign-in");
    }

    if (user.name) {
      throw redirect(303, "/explore");
    }
  }

  return {
    redirectTo,
  };
};
