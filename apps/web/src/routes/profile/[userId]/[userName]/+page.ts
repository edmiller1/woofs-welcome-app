import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
  const { userId, userName } = params;
  throw redirect(302, `/profile/${userId}/${userName}/reviews`);
};
