import { protectedProcedure } from "@woofs/api";

export interface SuggestEditPayload {
  placeId: string;
  field: string;
  suggestedValue: string | boolean | string[] | Record<string, unknown>;
  notes?: string;
}

export const suggestEdit = async (payload: SuggestEditPayload) => {
  const response = await protectedProcedure.post<{ id: string }>(
    "/place/suggest-edit",
    payload,
  );
  return response.data;
};
