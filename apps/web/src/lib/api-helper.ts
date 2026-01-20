import {
  setTokenGetter,
  protectedProcedure,
  publicProcedure,
} from "@woofs/api";
import { authClient } from "./auth/auth-client";

setTokenGetter(async () => {
  const { data } = await authClient.getSession();
  return data?.session?.token ?? null;
});

export { protectedProcedure, publicProcedure };
