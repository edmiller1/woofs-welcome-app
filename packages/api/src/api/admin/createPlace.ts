import { protectedProcedure } from "@woofs/api";

export type CreatePlaceInput = {
  name: string;
  slug: string;
  types: string[];
  description?: string;
  locationId: string;
  countryCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  hours?: Record<string, { open: string; close: string; closed: boolean }>;
  dogRules?: string[];
  dogAmenities?: string[];
  offLeadAllowed?: boolean;
  waterAvailable?: boolean;
  distanceKm?: number;
  durationMins?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  isVerified?: boolean;
  isFeatured?: boolean;
};

export const createPlace = async (input: CreatePlaceInput): Promise<{ id: string; name: string }> => {
  const response = await protectedProcedure.post<{ id: string; name: string }>("/admin/place", input);
  return response.data;
};
