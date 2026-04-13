import { protectedProcedure } from "@woofs/api";
import type { UpcomingEvent } from "@woofs/types";

export const getUpcomingEvents = async (params?: { limit?: number }) => {
  const response = await protectedProcedure.get<UpcomingEvent[]>(
    `/event/upcoming`,
    { params },
  );

  return response.data;
};
