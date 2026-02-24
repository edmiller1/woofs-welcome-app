import axios from "axios";

type TokenGetter = () => Promise<string | null> | string | null;

let getToken: TokenGetter = () => null;

export function setTokenGetter(getter: TokenGetter) {
  getToken = getter;
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost"
      ? "http://localhost:9000/api"
      : "https://api.woofswelcome.app/api";
  }
  // SSR fallback
  return "https://api.woofswelcome.app/api";
};

const baseConfig = {
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null,
  },
};

export const publicProcedure = axios.create(baseConfig);

export const protectedProcedure = axios.create(baseConfig);

protectedProcedure.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Re-export axios types for convenience
export type { AxiosError, AxiosResponse } from "axios";
