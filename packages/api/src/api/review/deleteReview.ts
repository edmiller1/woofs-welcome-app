import { protectedProcedure } from "@woofs/api";

export const deleteReview = async (reviewId: string) => {
  const response = await protectedProcedure.delete<{ isSuccess: boolean }>(
    `/review/${reviewId}`,
  );

  return response.data;
};
