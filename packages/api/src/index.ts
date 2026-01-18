import axios from "axios";

type TokenGetter = () => Promise<string | null> | string | null;

let getToken: TokenGetter = () => null;

export function setTokenGetter(getter: TokenGetter) {
  getToken = getter;
}

const baseConfig = {
  baseURL: "http://localhost:9000/api",
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
