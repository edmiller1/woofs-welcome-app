import { protectedProcedure } from "@woofs/api";
import type { CommunityStats } from "@woofs/types";

export const getCommunityStats = async () => {
  const response = await protectedProcedure.get<{ result: CommunityStats }>(
    `/place/community-stats`,
  );

  return response.data.result;
};
