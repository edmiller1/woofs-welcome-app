import { browser } from "$app/environment";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
  const { user } = await parent();

  if (browser) {
    if (user) {
      throw redirect(302, "/");
    }
  }
};
