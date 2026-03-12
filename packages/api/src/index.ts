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
  return "https://api.woofswelcome.app/api";
};

type RequestOptions = {
  params?: Record<
    string,
    string | number | boolean | null | undefined | (string | number | boolean)[]
  >;
  body?: unknown;
  headers?: Record<string, string>;
};

class ApiClient {
  private getHeaders: () => Promise<Record<string, string>>;

  constructor(getHeaders: () => Promise<Record<string, string>>) {
    this.getHeaders = getHeaders;
  }

  private buildUrl(path: string, params?: RequestOptions["params"]): string {
    const base = getBaseUrl();
    // Remove leading slash from path to prevent URL constructor from ignoring base path
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = new URL(`${base}/${cleanPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value == null) continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            url.searchParams.append(key, String(item));
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<{ data: T }> {
    const baseHeaders = await this.getHeaders();
    const url = this.buildUrl(path, options.params);

    const isFormData = options.body instanceof FormData;
    const response = await fetch(url, {
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...baseHeaders,
        ...options.headers,
      },
      body: options.body != null
        ? isFormData ? (options.body as FormData) : JSON.stringify(options.body)
        : undefined,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw Object.assign(new Error(error.message ?? response.statusText), {
        status: response.status,
        response: { data: error, status: response.status },
      });
    }

    const data = (await response.json()) as T;
    return { data };
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, { ...options, body });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, { ...options, body });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }
}

export const publicProcedure = new ApiClient(async () => ({
  "Content-Type": "application/json",
}));

export const protectedProcedure = new ApiClient(async () => {
  const token = await getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
});
