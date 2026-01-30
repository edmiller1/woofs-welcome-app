import { browser } from "$app/environment";
import { getUser } from "$lib/auth/guard";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ url }) => {
  const user = await getUser();
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
