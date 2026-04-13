import { z } from "zod";

export const upcomingEventsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});
