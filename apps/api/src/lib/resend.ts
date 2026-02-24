import { Resend } from "resend";
import type { Env } from "../config/env";

let cachedResend: Resend | null = null;

export function getResend(env: Env) {
  if (cachedResend) return cachedResend;
  cachedResend = new Resend(env.RESEND_API_KEY);
  return cachedResend;
}
