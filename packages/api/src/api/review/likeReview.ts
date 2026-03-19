import { protectedProcedure } from "@woofs/api";

export const likeReview = async (reviewId: string) => {
  const response = await protectedProcedure.post<{
    success: boolean;
    action: "like" | "unlike";
  }>(`/review/${reviewId}/like`);

  return response.data;
};
