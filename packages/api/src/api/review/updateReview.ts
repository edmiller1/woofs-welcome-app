import { protectedProcedure } from "@woofs/api";
import type { UpdateReviewInput } from "@woofs/types";

export const updateReview = async (
  reviewId: string,
  data: UpdateReviewInput,
) => {
  const formData = new FormData();

  // Append scalar fields
  if (data.title) formData.append("title", data.title);
  if (data.content) formData.append("content", data.content);
  if (data.rating) formData.append("rating", String(data.rating));
  if (data.numDogs) formData.append("numDogs", String(data.numDogs));
  if (data.visitDate)
    formData.append("visitDate", data.visitDate.toISOString());

  // Arrays
  data.dogBreeds?.forEach((breed) => formData.append("dogBreeds", breed));
  data.deletedImages?.forEach((id) => formData.append("deletedImages", id));

  // Files
  data.newImages?.forEach((file) => formData.append("images", file));

  const response = await protectedProcedure.patch<{ reviewId: string }>(
    `/review/${reviewId}/update`,
    formData,
  );

  return response.data;
};
