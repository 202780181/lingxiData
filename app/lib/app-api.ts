export interface AppApiEnvelope<T> {
  code: string;
  message: string;
  data: T | null;
}

export class AppApiError extends Error {
  status: number;
  code: string;
  data: unknown;

  constructor({
    message,
    status,
    code,
    data,
  }: {
    message: string;
    status: number;
    code: string;
    data: unknown;
  }) {
    super(message);
    this.name = "AppApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const APP_API_BASE_PATH = "/api/v1/app";

export async function appApiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${APP_API_BASE_PATH}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  let payload: AppApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as AppApiEnvelope<T>;
  } catch {
    throw new AppApiError({
      message: "服务返回了无法解析的响应，请稍后重试。",
      status: response.status,
      code: "INVALID_RESPONSE",
      data: null,
    });
  }

  if (!response.ok || payload.code !== "OK") {
    throw new AppApiError({
      message: payload.message || "请求失败，请稍后重试。",
      status: response.status,
      code: payload.code || "UNKNOWN_ERROR",
      data: payload.data,
    });
  }

  return payload.data as T;
}

export interface RegisterEmailCodePayload {
  email: string;
}

export interface LoginCaptchaResponse {
  token: string;
  image_data_url: string;
  expires_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  image_captcha_token: string;
  image_captcha_answer: string;
}

export interface LoginSession {
  session_id: string;
  user_id: string;
  email: string;
  name: string;
  onboarding_required: boolean;
  active_tenant_id: string | null;
  active_role: "owner" | "member" | null;
  platform_roles: string[];
}

export interface LoginResponse {
  session: LoginSession;
  [key: string]: unknown;
}

export interface RegisterEmailCodeResponse {
  cooldown_seconds?: number;
  debug_code?: string;
  [key: string]: unknown;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  email_verification_code: string;
}

export interface RegisterResponse {
  user_id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export function requestRegisterEmailCode(payload: RegisterEmailCodePayload) {
  return appApiFetch<RegisterEmailCodeResponse>("/auth/register/email-code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getLoginCaptcha() {
  return appApiFetch<LoginCaptchaResponse>("/auth/captcha", {
    method: "GET",
  });
}

export function loginUser(payload: LoginPayload) {
  return appApiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterPayload) {
  return appApiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
