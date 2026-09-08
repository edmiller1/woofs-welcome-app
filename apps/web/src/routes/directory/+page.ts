import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
  const { user } = await parent();
  return { user };
};
