export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public requestId?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type AccessTokenGetter = () => string | null;

let accessTokenGetter: AccessTokenGetter | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAdminAccessTokenGetter(getter: AccessTokenGetter | null): void {
  accessTokenGetter = getter;
}

export function setAdminUnauthorizedHandler(
  handler: (() => void) | null
): void {
  unauthorizedHandler = handler;
}

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://deltalabs-backend.onrender.com";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const requestId = generateRequestId();
  headers.set("X-Request-Id", requestId);

  const token = accessTokenGetter ? accessTokenGetter() : null;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      const parsed: unknown = await response.json();
      if (parsed && typeof parsed === "object") {
        errorData = parsed as Record<string, unknown>;
      }
    } catch {
      // ignore JSON parse error
    }

    const detail = errorData.detail;
    const detailObject =
      detail && typeof detail === "object"
        ? (detail as Record<string, unknown>)
        : null;

    const message =
      typeof errorData.message === "string"
        ? errorData.message
        : typeof detail === "string"
          ? detail
          : detailObject && typeof detailObject.message === "string"
            ? detailObject.message
            : `API error: ${response.statusText}`;

    const code =
      typeof errorData.code === "string"
        ? errorData.code
        : detailObject && typeof detailObject.code === "string"
          ? detailObject.code
          : undefined;

    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }

    throw new ApiError(response.status, message, code, requestId, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
