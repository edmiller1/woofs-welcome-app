import { publicProcedure } from "@woofs/api";

export type AppStats = {
  monthlyActiveUsers: number;
  totalPlaces: number;
  totalReviews: number;
  totalCollections: number;
  totalLocations: number;
};

export const getAppStats = async () => {
  const response = await publicProcedure.get<AppStats>(`/app/stats`);
  return response.data;
};
