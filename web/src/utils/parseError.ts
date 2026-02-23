import axios from "axios";
import type { ApiErrorPayload } from "../api/types";

type ParsedError = {
  message: string;
  fieldErrors: Record<string, string[]>;
};

export function parseApiError(err: unknown): ParsedError {
  const fallback: ParsedError = {
    message: "Something went wrong",
    fieldErrors: {},
  };

  // Axios error with typed response payload
  if (axios.isAxiosError<ApiErrorPayload>(err)) {
    const data = err.response?.data;
    const message = data?.error?.message;
    const fieldErrors = data?.error?.fieldErrors;

    if (message || fieldErrors) {
      return {
        message: message ?? "Request failed",
        fieldErrors: fieldErrors ?? {},
      };
    }

    if (typeof err.message === "string") {
      return { ...fallback, message: err.message };
    }
  }

  // Non-Axios Error instance
  if (err instanceof Error) {
    return { ...fallback, message: err.message };
  }

  return fallback;
}