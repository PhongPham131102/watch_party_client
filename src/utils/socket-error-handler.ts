import { toast } from "./toast";
import { ErrorCodeMessage } from "../types/error.types";

/**
 * Handle socket error - show toast and redirect if needed
 */
export function handleSocketError(error: {
  error: string;
  errorCode: string;
}): void {
  const message =
    error.error ||
    ErrorCodeMessage[error.errorCode as keyof typeof ErrorCodeMessage] ||
    "Đã xảy ra lỗi";

  toast.error(message);
}
