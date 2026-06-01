import { protectedProcedure } from "@woofs/api";
import type { ProfilePhotos } from "@woofs/types";

export const getProfilePhotos = async (
  profileId: string,
  limit: number = 24,
  cursor?: string,
) => {
  const response = await protectedProcedure.get<ProfilePhotos>(
    `/profile/${profileId}/photos`,
    {
      params: {
        limit,
        ...(cursor && { cursor }),
      },
    },
  );

  return response.data;
};
