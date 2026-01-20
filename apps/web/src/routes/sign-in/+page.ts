import { browser } from "$app/environment";
import { getUser } from "$lib/auth/guard";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async () => {
  const user = await getUser();

  if (browser) {
    if (user) {
      throw redirect(302, "/");
    }
  }
};
