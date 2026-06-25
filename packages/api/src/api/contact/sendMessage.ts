import { publicProcedure } from "@woofs/api";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendMessage = async (payload: ContactPayload) => {
  const response = await publicProcedure.post<{ success: boolean }>(
    "/contact",
    payload,
  );
  return response.data;
};
