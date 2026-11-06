export interface ApiSuccess<T, M = Record<string, unknown>> {
  data: T;
  meta?: M;
}

export interface ApiErrorShape {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: ApiErrorShape;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(params.message);
    this.name = "ApiClientError";
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
  }
}
