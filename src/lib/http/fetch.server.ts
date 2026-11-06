import "server-only";
import { getEnv } from "@/lib/env";
import { ApiClientError, type ApiErrorResponse, type ApiSuccess } from "./errors";

export interface ServerFetchOptions {
  revalidate?: number | false;
  tags?: string[];
  cache?: RequestCache;
  headers?: Record<string, string>;
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const env = getEnv();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}/api${normalizedPath}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    cache: options.cache,
    next:
      options.revalidate !== undefined || options.tags
        ? {
            revalidate: options.revalidate,
            tags: options.tags,
          }
        : undefined,
  });

  if (!res.ok) {
    let payload: ApiErrorResponse | null = null;
    try {
      payload = (await res.json()) as ApiErrorResponse;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiClientError({
      status: res.status,
      code: payload?.error?.code ?? "SERVER_FETCH_ERROR",
      message: payload?.error?.message ?? `Request failed with status ${res.status}`,
      fieldErrors: payload?.error?.fieldErrors,
    });
  }

  const body = (await res.json()) as ApiSuccess<T>;
  return body.data;
}
