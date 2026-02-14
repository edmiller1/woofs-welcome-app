import { protectedProcedure } from "@woofs/api";
import type { CreateReviewInput } from "@woofs/types";

export const createReview = async (data: CreateReviewInput) => {
  const {
    placeId,
    rating,
    title,
    content,
    visitDate,
    numDogs,
    dogBreeds,
    images,
  } = data;

  const formData = new FormData();
  formData.append("placeId", placeId);
  formData.append("rating", rating.toString());
  formData.append("title", title);
  formData.append("content", content);
  formData.append("visitDate", visitDate.toISOString());
  formData.append("numDogs", numDogs.toString());
  dogBreeds.forEach((breed) => formData.append("dogBreeds", breed));
  images?.forEach((image) => formData.append("images", image));

  const response = await protectedProcedure.post<{ reviewId: string }>(
    "/review/create",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
