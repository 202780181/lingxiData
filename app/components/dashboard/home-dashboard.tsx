import * as React from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Heart,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createDashboardXhsSyncRun,
  getDashboardXhsAccounts,
  getDashboardXhsOverview,
  isAppApiError,
  type DashboardAccountDataState,
  type DashboardOverviewResponse,
  type DashboardOverviewSummary,
  type DashboardState,
  type DashboardXhsAccount,
} from "@/lib/app-api";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 90000;
const ALL_ACCOUNTS_VALUE = "__all__";

type MetricKey = keyof DashboardOverviewSummary;

interface DashboardMetricConfig {
  label: string;
  valueKey: MetricKey;
  deltaKey: MetricKey;
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
}

const metricConfigs: DashboardMetricConfig[] = [
  {
    label: "粉丝数",
    valueKey: "followers_total",
    deltaKey: "followers_delta",
    icon: Users,
    accentClassName: "from-[rgba(110,110,111,0.16)] to-[rgba(24,24,26,0.06)] text-[var(--dashboard-accent)]",
  },
  {
    label: "点赞数",
    valueKey: "likes_total",
    deltaKey: "likes_delta",
    icon: Heart,
    accentClassName: "from-rose-400/14 to-orange-300/10 text-rose-600",
  },
  {
    label: "收藏数",
    valueKey: "collects_total",
    deltaKey: "collects_delta",
    icon: Star,
    accentClassName: "from-amber-400/16 to-yellow-200/10 text-amber-600",
  },
  {
    label: "评论数",
    valueKey: "comments_total",
    deltaKey: "comments_delta",
    icon: MessageCircle,
    accentClassName: "from-indigo-400/14 to-sky-300/10 text-indigo-600",
  },
];

const dashboardStateCopy: Record<
  DashboardState,
  { label: string; title: string; description: string }
> = {
  ready: {
    label: "数据就绪",
    title: "今日运营概览",
    description: "关键账号数据已汇总，可快速掌握今天相对昨天的核心变化。",
  },
  no_accounts: {
    label: "未绑定账号",
    title: "先绑定小红书账号",
    description: "绑定账号后，首页看板会展示粉丝、互动和当前待处理状态。",
  },
  no_data: {
    label: "暂无数据",
    title: "还没有可展示的数据",
    description: "当前范围暂无采集结果，可以手动同步后刷新看板。",
  },
  sync_pending: {
    label: "同步中",
    title: "数据正在同步",
    description: "系统正在等待 worker 回传数据，完成后会自动刷新状态。",
  },
  partial_data: {
    label: "部分可用",
    title: "部分账号已有数据",
    description: "当前展示可用数据，仍有账号未采集或需要重新登录。",
  },
  login_required: {
    label: "需登录",
    title: "账号需要重新登录",
    description: "部分小红书账号登录态已失效，请重新登录后再同步数据。",
  },
  sync_failed: {
    label: "同步失败",
    title: "最近同步未完成",
    description: "可以稍后重试同步，或检查账号登录状态和 worker 可用性。",
  },
};

const accountStateCopy: Record<DashboardAccountDataState, string> = {
  ready: "有数据",
  no_data: "未采集",
  login_required: "需登录",
  sync_failed: "失败",
  unknown: "未知",
};

export function HomeDashboard() {
  const [accounts, setAccounts] = React.useState<DashboardXhsAccount[]>([]);
  const [overview, setOverview] = React.useState<DashboardOverviewResponse | null>(
    null,
  );
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const selectedAccountIdRef = React.useRef<string | null>(selectedAccountId);
  const pollStartedAtRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    selectedAccountIdRef.current = selectedAccountId;
  }, [selectedAccountId]);

  const loadDashboard = React.useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const [accountsPayload, overviewPayload] = await Promise.all([
          getDashboardXhsAccounts(),
          getDashboardXhsOverview(selectedAccountIdRef.current),
        ]);

        setAccounts(accountsPayload.items);
        setOverview(overviewPayload);
      } catch (error) {
        setErrorMessage(
          isAppApiError(error)
            ? error.message
            : "首页看板数据加载失败，请稍后重试。",
        );
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    void loadDashboard();
  }, [loadDashboard, selectedAccountId]);

  React.useEffect(() => {
    if (!isSyncing && overview?.dashboard_state !== "sync_pending") {
      return;
    }

    if (!pollStartedAtRef.current) {
      pollStartedAtRef.current = Date.now();
    }

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - (pollStartedAtRef.current ?? Date.now());

      if (elapsed > POLL_TIMEOUT_MS) {
        pollStartedAtRef.current = null;
        setIsSyncing(false);
        window.clearInterval(intervalId);
        return;
      }

      void loadDashboard({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isSyncing, loadDashboard, overview?.dashboard_state]);

  React.useEffect(() => {
    if (
      isSyncing &&
      overview &&
      overview.dashboard_state !== "sync_pending"
    ) {
      pollStartedAtRef.current = null;
      setIsSyncing(false);
    }
  }, [isSyncing, overview]);

  async function handleSync() {
    setIsSyncing(true);
    setErrorMessage(null);
    pollStartedAtRef.current = Date.now();

    try {
      await createDashboardXhsSyncRun(selectedAccountId);
      await loadDashboard({ silent: true });
    } catch (error) {
      setIsSyncing(false);
      setErrorMessage(
        isAppApiError(error)
          ? error.message
          : "同步任务创建失败，请稍后重试。",
      );
    }
  }

  const state = overview?.dashboard_state ?? "sync_pending";
  const copy = dashboardStateCopy[state];
  const summary = overview?.summary ?? null;
  const activeAccount = selectedAccountId
    ? accounts.find((account) => account.account_id === selectedAccountId) ?? null
    : null;
  const canSync = Boolean(
    overview?.available_actions.includes("sync") ||
      state === "no_data" ||
      state === "sync_failed" ||
      state === "partial_data" ||
      state === "ready",
  );

  return (
    <div className="flex flex-col gap-4 text-[var(--dashboard-foreground)]">
      <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)] md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div>
              <h1 className="text-[22px] leading-8 font-semibold tracking-[-0.02em] text-[var(--dashboard-foreground)]">
                {copy.title}
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[var(--dashboard-muted)]">
                {copy.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="dashboard-account-scope">
              账号范围
            </label>
            <select
              id="dashboard-account-scope"
              value={selectedAccountId ?? ALL_ACCOUNTS_VALUE}
              onChange={(event) =>
                setSelectedAccountId(
                  event.target.value === ALL_ACCOUNTS_VALUE
                    ? null
                    : event.target.value,
                )
              }
              className="h-[var(--app-control-height)] min-w-[180px] rounded-[var(--app-radius-control)] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] px-3 text-[13px] leading-5 text-[var(--dashboard-foreground)] shadow-[var(--dashboard-card-shadow)] outline-none transition-colors hover:border-[var(--dashboard-border-strong)] focus:border-[var(--dashboard-accent)]"
            >
              <option value={ALL_ACCOUNTS_VALUE}>全部账号</option>
              {accounts.map((account) => (
                <option key={account.account_id} value={account.account_id}>
                  {getAccountName(account)} · {accountStateCopy[account.data_state]}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              onClick={handleSync}
              disabled={!canSync || isSyncing || isLoading}
            >
              <RefreshCw
                data-icon="inline-start"
                className={cn("size-3.5", isSyncing && "animate-spin")}
              />
              {isSyncing || state === "sync_pending" ? "同步中" : "同步数据"}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <StatusPill label="账号总数" value={overview?.account_count} />
          <StatusPill label="有数据账号" value={overview?.accounts_with_data_count} />
          <StatusPill label="需登录账号" value={overview?.accounts_requiring_login_count} />
          <StatusPill label="状态" value={copy.label} />
        </div>
      </section>

      {errorMessage ? (
        <DashboardNotice
          tone="danger"
          icon={AlertCircle}
          title="看板加载异常"
          description={errorMessage}
        />
      ) : null}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.82fr)]">
            <div className="grid gap-3 md:grid-cols-2">
              {metricConfigs.map((metric) => (
                <MetricCard
                  key={metric.label}
                  config={metric}
                  summary={summary}
                  isMuted={!summary}
                />
              ))}
            </div>
            <SignalPanel overview={overview} state={state} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <OperationsPanel
              overview={overview}
              selectedAccount={activeAccount}
              state={state}
              canSync={canSync}
              isSyncing={isSyncing}
              onSync={handleSync}
            />
            <AccountsPanel accounts={accounts} selectedAccountId={selectedAccountId} />
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({
  config,
  summary,
  isMuted,
}: {
  config: DashboardMetricConfig;
  summary: DashboardOverviewSummary | null;
  isMuted: boolean;
}) {
  const Icon = config.icon;
  const value = summary?.[config.valueKey] ?? null;
  const delta = summary?.[config.deltaKey] ?? null;
  const safeValue = typeof value === "number" ? Math.max(value, 0) : 0;
  const barPercent = Math.min(100, Math.max(8, Math.round(Math.log10(safeValue + 1) * 18)));

  return (
    <article className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)] transition-colors duration-150 hover:border-[var(--dashboard-border-strong)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">
            {config.label}
          </p>
          <p className="mt-2 text-[26px] leading-8 font-semibold tracking-[-0.04em] text-[var(--dashboard-foreground)]">
            {formatMetricValue(value)}
          </p>
        </div>
        <div
          className={cn(
            "grid size-10 place-items-center rounded-[9px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)]",
            config.accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--dashboard-accent-soft)]">
          <div
            className="h-full rounded-full bg-[var(--dashboard-chart-to)]"
            style={{ width: `${barPercent}%` }}
          />
        </div>
        <span className="text-[11px] leading-4 text-[var(--dashboard-muted-soft)]">
          指数
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--dashboard-border)] pt-3 text-[12px] leading-4">
        <span className="text-[var(--dashboard-muted-soft)]">较昨日</span>
        <DeltaBadge delta={delta} isMuted={isMuted} />
      </div>
    </article>
  );
}

function SignalPanel({
  overview,
  state,
}: {
  overview: DashboardOverviewResponse | null;
  state: DashboardState;
}) {
  const accountTotal = Math.max(overview?.account_count ?? 0, 0);
  const readyTotal = Math.max(overview?.accounts_with_data_count ?? 0, 0);
  const loginRequiredTotal = Math.max(overview?.accounts_requiring_login_count ?? 0, 0);
  const denominator = Math.max(accountTotal, 1);
  const readyPercent = Math.round((readyTotal / denominator) * 100);
  const healthPercent = Math.max(
    0,
    Math.round(((accountTotal - loginRequiredTotal) / denominator) * 100),
  );
  const signalPercent = Math.round((readyPercent + healthPercent) / 2);
  const segments = [readyPercent, healthPercent, signalPercent, accountTotal ? 100 : 0];

  return (
    <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">数据链路信号</p>
          <h2 className="mt-1 text-[16px] leading-6 font-semibold text-[var(--dashboard-foreground)]">
            {dashboardStateCopy[state].label}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] px-2.5 py-1 text-[12px] leading-4 text-[var(--dashboard-muted)]">
          <TrendingUp className="size-3.5" />
          Live
        </span>
      </div>

      <div className="mt-6 grid grid-cols-[132px_minmax(0,1fr)] items-center gap-5">
        <div
          className="grid size-[132px] place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--dashboard-chart-to) ${signalPercent * 3.6}deg, var(--dashboard-accent-soft) 0deg)`,
          }}
        >
          <div className="grid size-[104px] place-items-center rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div>
              <p className="text-[26px] leading-7 font-semibold tracking-[-0.04em] text-[var(--dashboard-foreground)]">
                {signalPercent}%
              </p>
              <p className="mt-1 text-[11px] leading-3 text-[var(--dashboard-muted-soft)]">SYNC</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <SignalRow label="数据可用" value={readyPercent} />
          <SignalRow label="登录健康" value={healthPercent} />
          <div className="grid grid-cols-12 gap-1.5 pt-1">
            {segments.map((segment, index) => (
              <div
                key={`${segment}-${index}`}
                className={cn(
                  "h-8 rounded-[5px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)]",
                  segment > 0 && "bg-[var(--dashboard-chart-to)] opacity-80",
                )}
                style={{ opacity: segment > 0 ? 0.28 + segment / 140 : undefined }}
              />
            ))}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-8 rounded-[5px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] leading-4">
        <span className="text-[var(--dashboard-muted)]">{label}</span>
        <span className="font-medium text-[var(--dashboard-foreground)]">{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--dashboard-accent-soft)]">
        <div
          className="h-full rounded-full bg-[var(--dashboard-chart-to)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function OperationsPanel({
  overview,
  selectedAccount,
  state,
  canSync,
  isSyncing,
  onSync,
}: {
  overview: DashboardOverviewResponse | null;
  selectedAccount: DashboardXhsAccount | null;
  state: DashboardState;
  canSync: boolean;
  isSyncing: boolean;
  onSync: () => void;
}) {
  const copy = dashboardStateCopy[state];
  const noticeTone = getNoticeTone(state);
  const NoticeIcon = getNoticeIcon(state);
  const progressItems = [
    {
      label: "账号接入",
      value: overview?.account_count ?? 0,
      total: Math.max(overview?.account_count ?? 0, 1),
    },
    {
      label: "数据可用",
      value: overview?.accounts_with_data_count ?? 0,
      total: Math.max(overview?.account_count ?? 0, 1),
    },
    {
      label: "登录健康",
      value:
        (overview?.account_count ?? 0) -
        (overview?.accounts_requiring_login_count ?? 0),
      total: Math.max(overview?.account_count ?? 0, 1),
    },
  ];

  return (
    <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">
            当前待办
          </p>
          <h2 className="mt-1 text-[16px] leading-6 font-semibold text-[var(--dashboard-foreground)]">
            {selectedAccount ? getAccountName(selectedAccount) : "全部账号"}
          </h2>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] px-2.5 py-1 text-[12px] leading-4 text-[var(--dashboard-muted)]">
          <Clock3 className="size-3.5" />
          {formatDateTime(overview?.last_synced_at) ?? "尚未同步"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {progressItems.map((item) => (
          <ProgressStat key={item.label} {...item} />
        ))}
      </div>

      <DashboardNotice
        className="mt-4"
        tone={noticeTone}
        icon={NoticeIcon}
        title={copy.label}
        description={copy.description}
      />

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex flex-col gap-2 rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] leading-5 font-medium text-[var(--dashboard-foreground)]">
              下一步建议
            </span>
            <span className="text-[12px] leading-4 text-[var(--dashboard-muted-soft)]">
              {formatDateTime(overview?.generated_at) ?? "等待生成"}
            </span>
          </div>
          <p className="text-[13px] leading-5 text-[var(--dashboard-muted)]">
            {getActionHint(state)}
          </p>
          <div className="pt-1">
            <Button
              type="button"
              variant={canSync ? "default" : "outline"}
              size="sm"
              onClick={onSync}
              disabled={!canSync || isSyncing}
            >
              <RefreshCw
                data-icon="inline-start"
                className={cn("size-3.5", isSyncing && "animate-spin")}
              />
              {isSyncing ? "同步中" : "同步数据"}
            </Button>
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] p-3">
          <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">采集队列</p>
          <div className="mt-3 grid grid-cols-8 gap-1">
            {Array.from({ length: 24 }).map((_, index) => {
              const activeIndex = (overview?.accounts_with_data_count ?? 0) + (isSyncing ? 6 : 0);
              return (
                <span
                  key={index}
                  className={cn(
                    "h-3 rounded-[2px] bg-[var(--dashboard-accent-soft)]",
                    index < activeIndex && "bg-[var(--dashboard-chart-to)] opacity-80",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountsPanel({
  accounts,
  selectedAccountId,
}: {
  accounts: DashboardXhsAccount[];
  selectedAccountId: string | null;
}) {
  return (
    <section className="rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-4 shadow-[var(--dashboard-card-shadow)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] leading-4 text-[var(--dashboard-muted)]">
            账号状态
          </p>
          <h2 className="mt-1 text-[16px] leading-6 font-semibold text-[var(--dashboard-foreground)]">
            运营账号列表
          </h2>
        </div>
        <span className="rounded-full bg-[var(--dashboard-accent-soft)] px-2 py-1 text-[12px] leading-4 text-[var(--dashboard-muted)]">
          {accounts.length} 个账号
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {accounts.length ? (
          accounts.slice(0, 6).map((account) => (
            <div
              key={account.account_id}
              className={cn(
                "flex items-center gap-3 rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] p-2.5",
                selectedAccountId === account.account_id &&
                  "border-[var(--dashboard-border-strong)] bg-[var(--dashboard-accent-soft)]",
              )}
            >
              <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--dashboard-accent-soft)] text-[12px] font-medium text-[var(--dashboard-muted)]">
                {account.avatar_url ? (
                  <img
                    src={account.avatar_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  getAccountName(account).slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-5 font-medium text-[var(--dashboard-foreground)]">
                  {getAccountName(account)}
                </p>
                <p className="truncate text-[12px] leading-4 text-[var(--dashboard-muted-soft)]">
                  {formatDateTime(account.last_synced_at) ?? "尚未同步"}
                </p>
              </div>
              <AccountStateBadge state={account.data_state} />
            </div>
          ))
        ) : (
          <div className="rounded-[8px] border border-dashed border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] p-4 text-[13px] leading-5 text-[var(--dashboard-muted)]">
            暂未绑定小红书账号，绑定后这里会展示账号数据状态。
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardNotice({
  icon: Icon,
  title,
  description,
  tone = "neutral",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  className?: string;
}) {
  const toneClassName = {
    neutral: "border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] text-[var(--dashboard-muted)]",
    success: "border-emerald-200/70 bg-emerald-50/52 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
    warning: "border-amber-200/80 bg-amber-50/60 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
    danger: "border-rose-200/80 bg-rose-50/62 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
  }[tone];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-[var(--app-radius-panel)] border p-3",
        toneClassName,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="text-[13px] leading-5 font-medium">{title}</p>
        <p className="mt-0.5 text-[12px] leading-5 opacity-80">{description}</p>
      </div>
    </div>
  );
}

function ProgressStat({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const safeValue = Math.max(value, 0);
  const percent = Math.min(100, Math.round((safeValue / total) * 100));

  return (
    <div className="rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] p-3">
      <div className="flex items-center justify-between gap-2 text-[12px] leading-4">
        <span className="text-[var(--dashboard-muted)]">{label}</span>
        <span className="font-medium text-[var(--dashboard-foreground)]">
          {safeValue}/{total}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--dashboard-accent-soft)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--dashboard-chart-from),var(--dashboard-chart-to))] opacity-85"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel-muted)] px-3 py-2">
      <p className="text-[12px] leading-4 text-[var(--dashboard-muted-soft)]">
        {label}
      </p>
      <p className="mt-1 truncate text-[13px] leading-5 font-medium text-[var(--dashboard-foreground)]">
        {value ?? "--"}
      </p>
    </div>
  );
}

function DeltaBadge({ delta, isMuted }: { delta: number | null; isMuted: boolean }) {
  if (delta === null || isMuted) {
    return <span className="text-slate-400 dark:text-slate-500">暂无基线</span>;
  }

  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const Icon = isNegative ? ArrowDownRight : ArrowUpRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
        isPositive && "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
        isNegative && "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
        !isPositive && !isNegative && "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
      )}
    >
      {delta !== 0 ? <Icon className="size-3" /> : null}
      {delta > 0 ? "+" : ""}
      {formatNumber(delta)}
    </span>
  );
}

function AccountStateBadge({ state }: { state: DashboardAccountDataState }) {
  const className = {
    ready: "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
    no_data: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
    login_required: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300",
    sync_failed: "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
    unknown: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
  }[state];

  return (
    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-4", className)}>
      {accountStateCopy[state]}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[132px] animate-pulse rounded-[10px] border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] shadow-[var(--dashboard-card-shadow)]"
        />
      ))}
    </div>
  );
}

function getAccountName(account: DashboardXhsAccount) {
  return account.nickname || account.display_name || "未命名账号";
}

function formatMetricValue(value: number | null) {
  if (value === null) {
    return "--";
  }

  return formatNumber(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
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

function getNoticeTone(state: DashboardState) {
  if (state === "ready") {
    return "success" as const;
  }

  if (state === "sync_failed" || state === "login_required") {
    return "danger" as const;
  }

  if (state === "partial_data" || state === "no_data" || state === "sync_pending") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getNoticeIcon(state: DashboardState) {
  if (state === "ready") {
    return CheckCircle2;
  }

  if (state === "sync_failed") {
    return AlertCircle;
  }

  if (state === "login_required") {
    return ShieldAlert;
  }

  return Clock3;
}

function getActionHint(state: DashboardState) {
  switch (state) {
    case "no_accounts":
      return "请先完成小红书账号绑定，绑定成功后再回到首页看板同步数据。";
    case "no_data":
      return "建议点击同步数据，系统会拉取当前账号主页和笔记互动指标。";
    case "sync_pending":
      return "同步任务已提交，请稍等片刻；看板会自动轮询最新状态。";
    case "partial_data":
      return "建议优先处理未采集或需要登录的账号，再同步全部账号。";
    case "login_required":
      return "请重新登录失效账号，恢复授权后再执行同步。";
    case "sync_failed":
      return "可以重试同步；如果连续失败，请检查账号登录态或稍后再试。";
    case "ready":
    default:
      return "数据状态正常，可按账号筛选查看重点账号表现。";
  }
}
