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

export function isAppApiError(error: unknown): error is AppApiError {
  return error instanceof AppApiError;
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

export interface CreateOnboardingWorkspacePayload {
  name: string;
  slug?: string;
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

export interface CurrentUserResponse {
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

export interface CreateOnboardingWorkspaceResponse {
  workspace_id?: string;
  tenant_id?: string;
  slug?: string;
  [key: string]: unknown;
}

export interface WorkspaceEntitlement {
  plan_code: string;
  plan_name: string;
  enabled_features: string[];
  quota_limits: { quota_key: string; limit: number | null }[];
  subscription_status: string | null;
}

export interface WorkspaceUsageItem {
  usage_key: string;
  period: string;
  limit: number | null;
  used: number;
  reserved: number;
  remaining: number | null;
  period_start: string;
  period_end: string;
}

export interface WorkspaceUsageResponse {
  items: WorkspaceUsageItem[];
}

export type WorkspaceAccountStatus = "active" | "disabled" | "archived";
export type WorkspaceAccountAuthState =
  | "unknown"
  | "authenticated"
  | "login_required"
  | "expired";

export interface WorkspaceAccount {
  account_id: string;
  tenant_id: string;
  platform: string;
  external_account_id: string;
  display_name: string;
  status: WorkspaceAccountStatus;
  auth_state: WorkspaceAccountAuthState;
  worker_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkspaceAccountsResponse {
  items: WorkspaceAccount[];
}

export interface StartXhsLoginSessionPayload {
  display_name: string;
  platform?: "xiaohongshu";
}

export interface XhsLoginQrCode {
  timeout: string;
  is_logged_in: boolean;
  image: string | null;
}

export interface XhsLoginSessionResponse {
  account: WorkspaceAccount;
  worker_id: string;
  qrcode: XhsLoginQrCode;
}

export interface XhsLoginStatusResponse {
  account: WorkspaceAccount;
  worker_id: string | null;
  is_logged_in: boolean;
  username: string | null;
}

export type DashboardAccountDataState =
  | "ready"
  | "no_data"
  | "login_required"
  | "sync_failed"
  | "unknown";

export interface DashboardXhsAccount {
  account_id: string;
  display_name: string;
  platform: string;
  status: string;
  auth_state: string;
  worker_id: string | null;
  avatar_url: string | null;
  nickname: string | null;
  profile_url: string | null;
  last_synced_at: string | null;
  has_metrics: boolean;
  data_state: DashboardAccountDataState;
}

export interface DashboardXhsAccountsResponse {
  items: DashboardXhsAccount[];
}

export type DashboardState =
  | "ready"
  | "no_accounts"
  | "no_data"
  | "sync_pending"
  | "partial_data"
  | "login_required"
  | "sync_failed";

export interface DashboardOverviewSummary {
  followers_total: number | null;
  followers_delta: number | null;
  likes_total: number | null;
  likes_delta: number | null;
  collects_total: number | null;
  collects_delta: number | null;
  comments_total: number | null;
  comments_delta: number | null;
}

export interface DashboardOverviewResponse {
  dashboard_state: DashboardState;
  scope: {
    scope_type: "all_accounts" | "single_account";
    account_id: string | null;
  };
  summary: DashboardOverviewSummary | null;
  comparison: {
    current_date: string;
    previous_date: string;
    timezone: string;
  };
  available_actions: string[];
  generated_at: string;
  last_synced_at: string | null;
  account_count: number;
  accounts_with_data_count: number;
  accounts_requiring_login_count: number;
}

export interface DashboardSyncRun {
  sync_run_id: string;
  account_id: string;
  job_id: string;
  status: "pending" | "running" | "succeeded" | "failed" | "canceled";
  created_at: string | null;
  updated_at: string | null;
}

export interface DashboardSyncRunsResponse {
  items: DashboardSyncRun[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLoginSession(value: unknown): value is LoginSession {
  return (
    isRecord(value) &&
    typeof value.session_id === "string" &&
    typeof value.user_id === "string" &&
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    typeof value.onboarding_required === "boolean" &&
    (value.active_tenant_id === null ||
      typeof value.active_tenant_id === "string") &&
    (value.active_role === null ||
      value.active_role === "owner" ||
      value.active_role === "member") &&
    Array.isArray(value.platform_roles)
  );
}

function normalizeAuthSessionResponse(
  payload: unknown,
): CurrentUserResponse | LoginResponse {
  if (isRecord(payload) && isLoginSession(payload.session)) {
    return payload as CurrentUserResponse | LoginResponse;
  }

  if (isLoginSession(payload)) {
    return {
      session: payload,
    };
  }

  throw new AppApiError({
    message: "用户信息响应格式不正确，请稍后重试。",
    status: 200,
    code: "INVALID_AUTH_PAYLOAD",
    data: payload,
  });
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
  return appApiFetch<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(normalizeAuthSessionResponse);
}

export function getCurrentUser() {
  return appApiFetch<unknown>("/auth/me", {
    method: "GET",
  }).then(normalizeAuthSessionResponse);
}

export function createOnboardingWorkspace(
  payload: CreateOnboardingWorkspacePayload,
) {
  return appApiFetch<CreateOnboardingWorkspaceResponse>(
    "/onboarding/workspace",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function getWorkspaceEntitlements() {
  return appApiFetch<WorkspaceEntitlement>(
    "/workspace/entitlements",
    { method: "GET" },
  );
}

export function getWorkspaceUsage() {
  return appApiFetch<WorkspaceUsageResponse>("/workspace/usage", {
    method: "GET",
  });
}

export function getWorkspaceAccounts() {
  return appApiFetch<WorkspaceAccountsResponse>("/workspace/accounts", {
    method: "GET",
  });
}

export function startXhsAccountLoginSession(
  payload: StartXhsLoginSessionPayload,
) {
  return appApiFetch<XhsLoginSessionResponse>(
    "/workspace/xhs-accounts/login-sessions",
    {
      method: "POST",
      body: JSON.stringify({ platform: "xiaohongshu", ...payload }),
    },
  );
}

export function getXhsAccountLoginStatus(accountId: string) {
  return appApiFetch<XhsLoginStatusResponse>(
    `/workspace/xhs-accounts/${encodeURIComponent(accountId)}/login-status`,
    { method: "GET" },
  );
}

export function getDashboardXhsAccounts() {
  return appApiFetch<DashboardXhsAccountsResponse>(
    "/workspace/dashboard/xhs-accounts",
    {
      method: "GET",
    },
  );
}

export function getDashboardXhsOverview(accountId?: string | null) {
  const query = accountId
    ? `?account_id=${encodeURIComponent(accountId)}`
    : "";

  return appApiFetch<DashboardOverviewResponse>(
    `/workspace/dashboard/xhs-overview${query}`,
    {
      method: "GET",
    },
  );
}

export function createDashboardXhsSyncRun(accountId: string | null) {
  return appApiFetch<DashboardSyncRunsResponse>(
    "/workspace/dashboard/xhs-sync-runs",
    {
      method: "POST",
      body: JSON.stringify({ account_id: accountId }),
    },
  );
}

export function registerUser(payload: RegisterPayload) {
  return appApiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
