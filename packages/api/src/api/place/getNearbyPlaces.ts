import { protectedProcedure } from "@woofs/api";
import type { NearbyPlace } from "@woofs/types";

export const getNearbyPlaces = async (data: {
  placeId: string;
  lat: number;
  lng: number;
  radius: number;
  limit: number;
}) => {
  const { placeId, lat, lng, radius, limit } = data;

  const response = await protectedProcedure.get<{
    places: NearbyPlace[];
    center: { lat: number; lng: number };
    radius: number;
  }>(`/place/nearby/${placeId}`, {
    params: {
      lat,
      lng,
      radius,
      limit,
    },
  });

  return response.data;
};
