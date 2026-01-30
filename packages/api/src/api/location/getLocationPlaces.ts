import type { LocationPlacesSort, PlaceFilter } from "@woofs/types";
import { protectedProcedure } from "@woofs/api";

export const getLocationPlaces = async (
  path: string,
  filters: { placeSort?: PlaceFilter },
) => {
  const response = await protectedProcedure.get<LocationPlacesSort>(
    `${path}/places`,
    {
      params: filters,
    },
  );

  return response.data;
};
