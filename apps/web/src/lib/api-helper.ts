import {
  setTokenGetter,
  protectedProcedure,
  publicProcedure,
} from "@woofs/api";
import { api } from "@woofs/api/api";
import { authClient } from "./auth/auth-client";

setTokenGetter(async () => {
  if (typeof window === "undefined") return null;
  const { data } = await authClient.getSession();
  return data?.session?.token ?? null;
});

export { protectedProcedure, publicProcedure, api };
