import axios, { type AxiosError } from "axios";
import { ApiClientError, type ApiErrorResponse } from "./errors";

export const http = axios.create({
  baseURL: "/api",
  timeout: 20_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 500;
    const payload = error.response?.data?.error;
    const code = payload?.code ?? (status === 401 ? "UNAUTHORIZED" : "NETWORK_ERROR");
    const message =
      payload?.message ?? error.message ?? "An unexpected network error occurred.";
    const fieldErrors = payload?.fieldErrors;

    return Promise.reject(
      new ApiClientError({
        status,
        code,
        message,
        fieldErrors,
      }),
    );
  },
);
