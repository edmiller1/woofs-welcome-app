import { browser } from "$app/environment";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ url, parent }) => {
  const { user } = await parent();
  const searchParams = url.searchParams;
  const redirectTo = searchParams.get("redirect") || "/";

  if (browser) {
    if (!user) {
      throw redirect(302, "/sign-in");
    }

    const needsOnboearding = !user.name;

    if (needsOnboearding) {
      throw redirect(302, `/welcome?redirect=${redirectTo}`);
    }

    if (redirectTo) {
      throw redirect(302, redirectTo);
    } else {
      throw redirect(302, "/explore");
    }
  }
};
