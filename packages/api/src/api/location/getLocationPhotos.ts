import { protectedProcedure } from "@woofs/api";
import type { LocationPhotosResult } from "@woofs/types";

export const getLocationPhotos = async (
  path: string,
  page = 1,
  limit = 12,
) => {
  const response = await protectedProcedure.get<LocationPhotosResult>(
    `${path}/photos`,
    { params: { page, limit } },
  );
  return response.data;
};
