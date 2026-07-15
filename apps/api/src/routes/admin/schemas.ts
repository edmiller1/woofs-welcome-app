import { z } from "zod";

export const createPlaceSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  types: z.array(z.enum([
    "Park", "Restaurant", "Hotel", "Motel", "AirBnb", "Store", "Café", "Bar",
    "Dog Park", "Beach", "Walk", "Hike", "Service", "Activity", "Lake",
    "River", "Trail", "Winery", "Accomodation",
  ])).min(1),
  description: z.string().max(2000).optional(),
  locationId: z.string().uuid(),
  countryCode: z.string().default("NZ"),
  address: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  hours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  })).optional(),
  dogRules: z.array(z.string()).optional(),
  dogAmenities: z.array(z.string()).optional(),
  offLeadAllowed: z.boolean().optional(),
  waterAvailable: z.boolean().optional(),
  distanceKm: z.number().int().min(0).optional(),
  durationMins: z.number().int().min(0).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});
