import type { Load } from "@sveltejs/kit";

const ssr = false;

export const load: Load = async ({ params, parent }) => {
  const { user } = await parent();

  return {
    user,
    pathname: params.location,
  };
};
