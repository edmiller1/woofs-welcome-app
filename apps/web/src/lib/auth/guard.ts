import { redirect } from "@sveltejs/kit";
import { sessionCache } from "./session-cache";
import { authClient } from "./auth-client";
import type { Session } from "./auth-client";
import type { BAUser } from "@woofs/types";

/**
 * Resolves the session for the current request.
 *
 * In a SvelteKit `load` function, pass the load event's `fetch` so the
 * incoming request's cookies are forwarded when calling the (cross-subdomain)
 * auth API during SSR — the ambient global `fetch` used by `authClient` has
 * no cookie jar on the server, so without this every SSR session check
 * silently resolves to "logged out". When `fetch` is omitted (client-side
 * calls outside a load function), falls back to the shared browser cache.
 */
async function resolveSession(
  fetch?: typeof globalThis.fetch,
): Promise<{ data: Session | null }> {
  if (!fetch) {
    return sessionCache.getSession();
  }

  const result = await authClient.getSession({
    fetchOptions: { customFetchImpl: fetch },
  });
  return { data: result.data };
}

export async function requireAuth(fetch?: typeof globalThis.fetch) {
  const { data } = await resolveSession(fetch);
  if (!data?.session) {
    throw redirect(302, "/sign-in");
  }
  return {
    session: data.session,
    user: data.user,
  };
}

export async function requireGuest(
  fetch?: typeof globalThis.fetch,
): Promise<void> {
  const { data } = await resolveSession(fetch);
  if (data?.session) {
    throw redirect(302, "/");
  }
}

export async function getUser(fetch?: typeof globalThis.fetch) {
  const session = await resolveSession(fetch);
  if (!session.data) {
    return null;
  }
  return session.data.user as unknown as BAUser;
}

// export async function getBusinessUser() {
//   const session = await sessionCache.getSession();

//   if (!session.data) {
//     return null;
//   }

//   const user = session.data.user as unknown as BAUser;

//   if (!user.isBusinessAccount) {
//     redirect(302, "/");
//   }

//   return user;
// }

export async function getAdminUser(fetch?: typeof globalThis.fetch) {
  const session = await resolveSession(fetch);

  if (!session.data) {
    return null;
  }

  const user = session.data.user as unknown as BAUser;

  if (!user.isAdmin) {
    return null;
  }

  return user;
}
