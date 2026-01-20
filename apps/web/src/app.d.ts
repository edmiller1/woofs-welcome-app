// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare module "$env/static/public" {
  export const PUBLIC_SENTRY_DSN: string;
  export const PUBLIC_NODE_ENV: string;
  export const PUBLIC_BETTER_AUTH_SECRET: string;
  export const PUBLIC_BETTER_AUTH_URL: string;
  export const PUBLIC_GOOGLE_CLIENT_ID: string;
  export const PUBLIC_MAPBOX_API_KEY: string;
}

export {};
