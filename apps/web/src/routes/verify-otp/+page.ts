import { browser } from "$app/environment";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ url, parent }) => {
  const searchParams = url.searchParams;
  const { user } = await parent();

  if (browser) {
    if (user) {
      throw redirect(303, "/");
    }

    if (!searchParams.has("email")) {
      throw redirect(303, "/sign-in");
    }
  }

  return {
    searchParams: Object.fromEntries(searchParams.entries()),
  };
};
