import { isAxiosError } from "axios";

export type FieldErrors = Record<string, string>;

export interface NormalizedApiError {
  code: string;
  message: string;
  fields?: FieldErrors;
  status?: number;
}

interface ApiErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    fields?: FieldErrors;
  };
}

const GENERIC_ERROR: NormalizedApiError = {
  code: "UNKNOWN_ERROR",
  message: "Something went wrong. Please try again.",
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as ApiErrorEnvelope | undefined;
    const envelope = payload?.error;

    if (envelope) {
      return {
        code: envelope.code ?? "HTTP_ERROR",
        message: envelope.message ?? GENERIC_ERROR.message,
        fields: envelope.fields,
        status,
      };
    }

    if (error.code === "ERR_NETWORK") {
      return {
        code: "NETWORK_ERROR",
        message: "Cannot reach the server. Make sure the backend is running.",
        status,
      };
    }

    if (status === 404) {
      return { code: "NOT_FOUND", message: "The requested resource was not found.", status };
    }

    if (status === 400) {
      return { code: "BAD_REQUEST", message: "The request could not be processed.", status };
    }

    if (status && status >= 500) {
      return { code: "SERVER_ERROR", message: "The server encountered an unexpected error.", status };
    }

    return {
      code: "HTTP_ERROR",
      message: error.message || GENERIC_ERROR.message,
      status,
    };
  }

  if (error instanceof Error) {
    return { code: "UNKNOWN_ERROR", message: error.message };
  }

  return GENERIC_ERROR;
}
