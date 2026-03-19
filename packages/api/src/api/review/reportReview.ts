import { protectedProcedure } from "@woofs/api";
import type { ReportReviewInput } from "@woofs/types";

export const reportReview = async (
  reviewId: string,
  data: ReportReviewInput,
) => {
  const response = await protectedProcedure.post<{ success: boolean }>(
    `/review/${reviewId}/report`,
    data,
  );

  return response.data;
};
