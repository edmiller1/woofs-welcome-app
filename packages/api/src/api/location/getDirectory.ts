import { publicProcedure } from "@woofs/api";

export interface DirectoryLocation {
  name: string;
  path: string;
  countryCode: string;
}

export interface DirectoryResult {
  locations: DirectoryLocation[];
  total: number;
  page: number;
  limit: number;
}

export const getDirectory = async (params: {
  type: "country" | "island" | "region" | "city";
  letter?: string;
  page?: number;
  limit?: number;
}): Promise<DirectoryResult> => {
  const searchParams = new URLSearchParams({ type: params.type });
  if (params.letter) searchParams.set("letter", params.letter);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const response = await publicProcedure.get<DirectoryResult>(
    `/location/directory?${searchParams.toString()}`,
  );
  return response.data;
};
