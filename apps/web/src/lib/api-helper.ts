import {
  setTokenGetter,
  protectedProcedure,
  publicProcedure,
} from "@woofs/api";
import { api } from "@woofs/api/api";
import { authClient } from "./auth/auth-client";

let sessionPromise: Promise<string | null> | null = null;

setTokenGetter(() => {
  if (typeof window === "undefined") return null;
  if (!sessionPromise) {
    sessionPromise = authClient.getSession().then(({ data }) => {
      sessionPromise = null;
      return data?.session?.token ?? null;
    });
  }
  return sessionPromise;
});

export { protectedProcedure, publicProcedure, api };
