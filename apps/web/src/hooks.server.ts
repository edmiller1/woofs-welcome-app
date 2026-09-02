import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";

const allowResponseHeaders: Handle = ({ event, resolve }) =>
  resolve(event, {
    filterSerializedResponseHeaders: (name) => name === "content-type",
  });

export const handle = sequence(allowResponseHeaders);
