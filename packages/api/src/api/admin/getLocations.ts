import { protectedProcedure } from "@woofs/api";

export type AdminLocation = {
  id: string;
  name: string;
  type: string;
  path: string;
  countryCode: string;
};

export const getLocations = async (): Promise<AdminLocation[]> => {
  const response = await protectedProcedure.get<AdminLocation[]>("/admin/locations");
  return response.data;
};
