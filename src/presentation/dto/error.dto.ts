export interface ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorResponse(code: string, message: string, details?: unknown): ErrorResponseDto {
  return {
    success: false,
    error: { code, message, details },
  };
}
