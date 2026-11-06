import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorResponse, ApiSuccess } from "@/lib/http/errors";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function jsonSuccess<T, M = Record<string, unknown>>(
  data: T,
  options?: { status?: number; meta?: M; headers?: Record<string, string> },
): NextResponse<ApiSuccess<T, M>> {
  const payload: ApiSuccess<T, M> = {
    data,
    ...(options?.meta !== undefined ? { meta: options.meta } : {}),
  };
  return NextResponse.json(payload, {
    status: options?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
      ...options?.headers,
    },
  });
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>,
  headers?: Record<string, string>,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...headers,
      },
    },
  );
}

export function handleRouteError(err: unknown): NextResponse<ApiErrorResponse> {
  if (err instanceof ApiError) {
    return jsonError(err.status, err.code, err.message, err.fieldErrors);
  }
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(err.flatten().fieldErrors)) {
      if (value) fieldErrors[key] = value;
    }
    return jsonError(400, "VALIDATION_ERROR", "Please check the highlighted form fields.", fieldErrors);
  }
  console.error("[Server Route Error]", err instanceof Error ? err.message : "Unknown error");
  return jsonError(500, "INTERNAL_SERVER_ERROR", "An unexpected server error occurred.");
}
