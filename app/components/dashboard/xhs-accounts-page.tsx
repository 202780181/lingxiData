import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Plus,
  QrCode,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getWorkspaceAccounts,
  getWorkspaceEntitlements,
  getWorkspaceUsage,
  getXhsAccountLoginStatus,
  isAppApiError,
  startXhsAccountLoginSession,
  type WorkspaceAccount,
  type WorkspaceEntitlement,
  type WorkspaceUsageResponse,
  type XhsLoginSessionResponse,
  type XhsLoginStatusResponse,
} from "@/lib/app-api";
import { getUserDisplayName, useAppCurrentUser } from "@/lib/current-user";
import { cn } from "@/lib/utils";

const LOGIN_POLL_INTERVAL_MS = 3000;
const LOGIN_POLL_TIMEOUT_MS = 120000;

const authStateCopy: Record<WorkspaceAccount["auth_state"], string> = {
  unknown: "状态未知",
  authenticated: "已登录",
  login_required: "需重新登录",
  expired: "登录过期",
};

const statusCopy: Record<WorkspaceAccount["status"], string> = {
  active: "启用中",
  disabled: "已停用",
  archived: "已归档",
};

export function XhsAccountsPage() {
  const [accounts, setAccounts] = React.useState<WorkspaceAccount[]>([]);
  const [entitlement, setEntitlement] = React.useState<WorkspaceEntitlement | null>(
    null,
  );
  const [usage, setUsage] = React.useState<WorkspaceUsageResponse | null>(null);
  const [loginSession, setLoginSession] = React.useState<XhsLoginSessionResponse | null>(
    null,
  );
  const [loginStatus, setLoginStatus] = React.useState<XhsLoginStatusResponse | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const pollStartedAtRef = React.useRef<number | null>(null);
  const currentUser = useAppCurrentUser();
  const currentUserDisplayName = currentUser
    ? getUserDisplayName(currentUser.session)
    : "灵犀用户";

  const canConnectAccount =
    entitlement?.enabled_features.includes("xhs_account_connect") ?? true;

  const loadAccounts = React.useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [accountsPayload, entitlementPayload, usagePayload] = await Promise.all([
        getWorkspaceAccounts(),
        getWorkspaceEntitlements().catch(() => null),
        getWorkspaceUsage().catch(() => null),
      ]);

      setAccounts(accountsPayload.items);
      setEntitlement(entitlementPayload);
      setUsage(usagePayload);
    } catch (error) {
      setErrorMessage(getAccountsErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  React.useEffect(() => {
    if (!loginSession || loginSession.qrcode.is_logged_in) {
      return;
    }

    pollStartedAtRef.current = Date.now();
    let isDisposed = false;

    const poll = async () => {
      if (isDisposed) {
        return;
      }

      const startedAt = pollStartedAtRef.current ?? Date.now();
      if (Date.now() - startedAt > LOGIN_POLL_TIMEOUT_MS) {
        setErrorMessage("二维码可能已过期，请重新获取登录二维码。");
        return;
      }

      try {
        const statusPayload = await getXhsAccountLoginStatus(
          loginSession.account.account_id,
        );

        if (isDisposed) {
          return;
        }

        setLoginStatus(statusPayload);

        if (statusPayload.is_logged_in) {
          setSuccessMessage("小红书账号绑定成功。");
          setLoginSession(null);
          await loadAccounts();
          return;
        }
      } catch (error) {
        if (!isDisposed) {
          setErrorMessage(getAccountsErrorMessage(error));
        }
      }

      window.setTimeout(poll, LOGIN_POLL_INTERVAL_MS);
    };

    const timer = window.setTimeout(poll, LOGIN_POLL_INTERVAL_MS);

    return () => {
      isDisposed = true;
      window.clearTimeout(timer);
    };
  }, [loadAccounts, loginSession]);

  async function handleStartLoginSession() {
    setCreating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoginStatus(null);

    try {
      const payload = await startXhsAccountLoginSession({
        display_name: currentUserDisplayName,
      });

      setLoginSession(payload);

      if (payload.qrcode.is_logged_in) {
        setSuccessMessage("小红书账号已完成登录。");
        await loadAccounts();
      }
    } catch (error) {
      setErrorMessage(getAccountsErrorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 text-[var(--dashboard-foreground)]">
      <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)] md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">
              Workspace Accounts
            </p>
            <h1 className="mt-1 text-[22px] leading-8 font-semibold tracking-[-0.02em]">
              小红书账号管理
            </h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[var(--dashboard-muted)]">
              统一接入和管理工作区内的小红书业务账号，扫码登录成功后可用于数据采集、分析和发布。
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={loadAccounts}>
            <RefreshCw data-icon="inline-start" className="size-3.5" />
            刷新列表
          </Button>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <SummaryCard label="已接入账号" value={accounts.length} />
          <SummaryCard
            label="可连接权益"
            value={canConnectAccount ? "已开启" : "未开启"}
          />
          <SummaryCard label="当前套餐" value={entitlement?.plan_name ?? "--"} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.4fr)]">
        <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">
                绑定账号
              </p>
              <h2 className="mt-1 text-[16px] leading-6 font-semibold">
                扫码登录小红书
              </h2>
            </div>
            <QrCode className="size-4 text-[var(--dashboard-muted)]" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] px-3 py-2">
              <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">
                将使用当前用户作为账号显示名称
              </p>
              <p className="mt-1 truncate text-[13px] font-medium">
                {currentUserDisplayName}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleStartLoginSession}
              disabled={creating || !canConnectAccount}
              className="w-full"
            >
              {creating ? (
                <LoaderCircle data-icon="inline-start" className="size-3.5 animate-spin" />
              ) : (
                <Plus data-icon="inline-start" className="size-3.5" />
              )}
              获取登录二维码
            </Button>
          </div>

          {loginSession ? (
            <div className="mt-4 rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium">等待扫码确认</p>
                <span className="text-[12px] text-[var(--dashboard-muted)]">
                  {loginStatus?.is_logged_in ? "已登录" : "轮询中"}
                </span>
              </div>
              <div className="mt-3 grid place-items-center rounded-[8px] border border-[var(--dashboard-border)] bg-white p-3">
                {loginSession.qrcode.image ? (
                  <img
                    src={loginSession.qrcode.image}
                    alt="小红书登录二维码"
                    className="size-44 object-contain"
                  />
                ) : (
                  <div className="grid size-44 place-items-center text-center text-[13px] leading-5 text-[var(--dashboard-muted)]">
                    后端暂未返回二维码图片，请稍后刷新。
                  </div>
                )}
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[var(--dashboard-muted)]">
                请使用小红书扫码登录。登录成功后系统会自动刷新账号列表。
              </p>
            </div>
          ) : null}

          {successMessage ? (
            <StatusMessage tone="success" message={successMessage} />
          ) : null}
          {errorMessage ? <StatusMessage tone="danger" message={errorMessage} /> : null}
        </section>

        <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">
                账号列表
              </p>
              <h2 className="mt-1 text-[16px] leading-6 font-semibold">
                工作区小红书矩阵
              </h2>
            </div>
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
          </div>

          <div className="mt-4 overflow-hidden rounded-[8px] border border-[var(--dashboard-border)]">
            {accounts.length ? (
              <div className="divide-y divide-[var(--dashboard-border)]">
                {accounts.map((account) => (
                  <AccountRow key={account.account_id} account={account} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[13px] leading-5 text-[var(--dashboard-muted)]">
                暂未接入小红书账号，请先获取二维码完成绑定。
              </div>
            )}
          </div>
        </section>
      </section>

      {usage ? <UsagePanel usage={usage} /> : null}
    </div>
  );
}

function AccountRow({ account }: { account: WorkspaceAccount }) {
  return (
    <div className="grid gap-3 bg-[var(--dashboard-panel)] p-3 md:grid-cols-[minmax(0,1fr)_160px_160px_160px] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium">{account.display_name}</p>
        <p className="mt-0.5 truncate text-[12px] text-[var(--dashboard-muted)]">
          {account.external_account_id || account.account_id}
        </p>
      </div>
      <Badge tone={account.status === "active" ? "success" : "neutral"}>
        {statusCopy[account.status] ?? account.status}
      </Badge>
      <Badge tone={account.auth_state === "authenticated" ? "success" : "warning"}>
        {authStateCopy[account.auth_state] ?? account.auth_state}
      </Badge>
      <p className="truncate text-[12px] text-[var(--dashboard-muted)]">
        {formatDateTime(account.updated_at) ?? "尚未更新"}
      </p>
    </div>
  );
}

function UsagePanel({ usage }: { usage: WorkspaceUsageResponse }) {
  return (
    <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)]">
      <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">工作区用量</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {usage.items.map((item) => (
          <div
            key={`${item.usage_key}-${item.period}`}
            className="rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] p-3"
          >
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="truncate text-[var(--dashboard-muted)]">
                {item.usage_key}
              </span>
              <span className="font-medium">
                {item.remaining === null ? "不限量" : `剩余 ${item.remaining}`}
              </span>
            </div>
            <p className="mt-2 text-[13px] font-medium">
              已用 {item.used} · 预留 {item.reserved}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] px-3 py-2">
      <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">{label}</p>
      <p className="mt-1 truncate text-[13px] font-medium">{value}</p>
    </div>
  );
}

function StatusMessage({
  tone,
  message,
}: {
  tone: "success" | "danger";
  message: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "mt-3 flex gap-2 rounded-[8px] border p-3 text-[12px] leading-5",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "danger" && "border-rose-200 bg-rose-50 text-rose-700",
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" />
      {message}
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "neutral";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[12px] leading-4 font-medium",
        tone === "success" && "bg-emerald-50 text-emerald-600",
        tone === "warning" && "bg-amber-50 text-amber-600",
        tone === "neutral" && "bg-slate-100 text-slate-500",
      )}
    >
      {children}
    </span>
  );
}

function getAccountsErrorMessage(error: unknown) {
  if (isAppApiError(error)) {
    return error.message;
  }

  return "小红书账号数据加载失败，请稍后重试。";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
