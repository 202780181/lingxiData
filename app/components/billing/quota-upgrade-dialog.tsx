import * as React from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Crown,
  Database,
  Sparkles,
  Zap,
} from "lucide-react";

import { AppDialog, AppDialogCloseButton } from "@/components/ui/app-dialog";
import { Button } from "@/components/ui/button";
import {
  APP_API_QUOTA_EXCEEDED_EVENT,
  APP_MEMBERSHIP_UPGRADE_EVENT,
  type AppApiQuotaExceededEventDetail,
} from "@/lib/app-api-events";
import {
  changeWorkspaceSubscription,
  type WorkspaceSubscriptionPlanCode,
  isAppApiError,
} from "@/lib/app-api";
import { cn } from "@/lib/utils";

interface QuotaUpgradePlan {
  code: WorkspaceSubscriptionPlanCode;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyHint: string;
  summary: string;
  features: string[];
}

const quotaUpgradeFeatures = [
  {
    icon: Zap,
    title: "更高 AI 使用额度",
    description: "提升内容生成、数据分析和自动化任务的月度调用上限。",
  },
  {
    icon: BarChart3,
    title: "进阶账号分析",
    description: "解锁多账号经营看板、趋势洞察和增长诊断能力。",
  },
  {
    icon: Database,
    title: "知识库容量升级",
    description: "沉淀更多素材、选题和品牌资料，支撑持续内容生产。",
  },
  {
    icon: Sparkles,
    title: "优先处理通道",
    description: "高峰期优先执行生成任务，减少排队等待。",
  },
] as const;

const quotaUpgradePlans: QuotaUpgradePlan[] = [
  {
    code: "plus",
    name: "Plus",
    monthlyPrice: "¥39",
    yearlyPrice: "¥399",
    yearlyHint: "适合个人轻量使用",
    summary: "解锁基础额度，继续完成日常内容生产和账号分析。",
    features: ["基础 AI 生成额度", "单工作区知识库", "标准任务队列"],
  },
  {
    code: "pro",
    name: "Pro",
    monthlyPrice: "¥99",
    yearlyPrice: "¥899",
    yearlyHint: "推荐增长团队使用",
    summary: "提升额度和处理优先级，覆盖多账号运营和高频生成。",
    features: ["更高 AI 使用额度", "多账号经营看板", "优先处理通道"],
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyPrice: "定制",
    yearlyPrice: "定制方案",
    yearlyHint: "适合团队和企业部署",
    summary: "提供更高配额、团队权限和企业级数据治理能力。",
    features: ["企业级额度", "团队权限管理", "专属支持"],
  },
];

export function QuotaUpgradeDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quotaError, setQuotaError] =
    React.useState<AppApiQuotaExceededEventDetail | null>(null);

  React.useEffect(() => {
    const handleQuotaExceeded = (event: Event) => {
      setQuotaError(
        (event as CustomEvent<AppApiQuotaExceededEventDetail>).detail ?? {
          code: "QUOTA_EXCEEDED",
          message: "免费额度已用完，请升级会员后继续使用。",
          status: 429,
          data: null,
        },
      );
    };
    const handleMembershipUpgrade = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;

      setQuotaError({
        code: "QUOTA_EXCEEDED",
        message:
          detail?.message ||
          "升级会员后可获得更高额度和更多经营分析能力。",
        status: 200,
        data: null,
      });
    };

    window.addEventListener(
      APP_API_QUOTA_EXCEEDED_EVENT,
      handleQuotaExceeded,
    );
    window.addEventListener(
      APP_MEMBERSHIP_UPGRADE_EVENT,
      handleMembershipUpgrade,
    );

    return () => {
      window.removeEventListener(
        APP_API_QUOTA_EXCEEDED_EVENT,
        handleQuotaExceeded,
      );
      window.removeEventListener(
        APP_MEMBERSHIP_UPGRADE_EVENT,
        handleMembershipUpgrade,
      );
    };
  }, []);

  return (
    <>
      {children}
      <QuotaUpgradeDialog
        open={Boolean(quotaError)}
        message={quotaError?.message}
        onClose={() => setQuotaError(null)}
      />
    </>
  );
}

function QuotaUpgradeDialog({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message?: string;
  onClose: () => void;
}) {
  const [selectedPlanCode, setSelectedPlanCode] =
    React.useState<WorkspaceSubscriptionPlanCode>("pro");
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [upgradeMessage, setUpgradeMessage] = React.useState<string | null>(
    null,
  );
  const [upgradeTone, setUpgradeTone] = React.useState<"success" | "error">(
    "success",
  );

  React.useEffect(() => {
    if (!open) {
      setIsUpgrading(false);
      setUpgradeMessage(null);
      setUpgradeTone("success");
    }
  }, [open]);

  const selectedPlan =
    quotaUpgradePlans.find((plan) => plan.code === selectedPlanCode) ??
    quotaUpgradePlans[1];

  const handleUpgrade = React.useCallback(() => {
    setIsUpgrading(true);
    setUpgradeMessage(null);

    changeWorkspaceSubscription({ plan_code: selectedPlan.code })
      .then((payload) => {
        setUpgradeTone("success");
        setUpgradeMessage(
          `已升级到 ${payload.plan_name || selectedPlan.name}，可以继续使用。`,
        );
      })
      .catch((error: unknown) => {
        setUpgradeTone("error");
        setUpgradeMessage(
          isAppApiError(error)
            ? error.message || "升级失败，请稍后重试。"
            : "升级失败，请稍后重试。",
        );
      })
      .finally(() => {
        setIsUpgrading(false);
      });
  }, [selectedPlan]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      labelledBy="quota-upgrade-title"
      align="center"
      size="compact"
      className="max-h-[min(760px,calc(100svh-48px))] max-w-[680px] flex-col bg-[var(--app-dialog-surface)]"
      overlayClassName="z-[140]"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="absolute right-3 top-3 z-10">
          <AppDialogCloseButton
            label="关闭会员升级弹窗"
            className="bg-white/82 text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.12)] backdrop-blur-md hover:bg-white dark:bg-black/35 dark:text-white dark:hover:bg-black/50"
            onClick={onClose}
          />
        </div>

        <div className="relative aspect-[16/8.7] shrink-0 overflow-hidden bg-[#f7fbff]">
          <img
            src="/billing/quota-upgrade.png"
            alt="会员升级权益示意图"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-4 md:px-5 md:pb-5">
          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[12px] leading-4 font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <Crown className="size-3.5" strokeWidth={1.9} />
                免费额度已用完
              </div>
              <h2
                id="quota-upgrade-title"
                className="text-[22px] leading-[1.18] font-semibold tracking-normal text-[var(--app-dialog-title)] md:text-[24px]"
              >
                升级会员，继续使用灵犀数据
              </h2>
              <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-[var(--app-dialog-body)]">
                {message?.trim() ||
                  "当前工作区免费额度已经用完，升级后可继续使用数据分析、AI 内容生成和知识库能力。"}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              {quotaUpgradePlans.map((plan) => (
                <PlanOption
                  key={plan.code}
                  plan={plan}
                  active={selectedPlan.code === plan.code}
                  disabled={isUpgrading}
                  onSelect={() => setSelectedPlanCode(plan.code)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {quotaUpgradeFeatures.map((feature) => (
              <FeatureItem
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          {upgradeMessage ? (
            <div
              className={cn(
                "mt-4 rounded-[var(--app-radius-control)] border px-3 py-2 text-[12px] leading-[18px]",
                upgradeTone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                  : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100",
              )}
            >
              {upgradeMessage}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col-reverse gap-2 border-t border-[var(--app-dialog-border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-5 text-[var(--app-dialog-muted)]">
              升级后额度会按当前计费周期刷新，原有数据和配置不会受影响。
            </p>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                稍后再说
              </Button>
              <Button
                type="button"
                disabled={isUpgrading}
                onClick={handleUpgrade}
              >
                {isUpgrading ? "升级中..." : `升级 ${selectedPlan.name}`}
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppDialog>
  );
}

function PlanOption({
  plan,
  active,
  disabled,
  onSelect,
}: {
  plan: QuotaUpgradePlan;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      data-active={active}
      className={cn(
        "group flex min-h-[178px] flex-col rounded-[var(--app-radius-panel)] border p-3 text-left outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70",
        active
          ? "border-sky-300 bg-sky-50/80 shadow-[0_10px_28px_rgba(37,99,235,0.12)] dark:border-sky-400/30 dark:bg-sky-400/10"
          : "border-[var(--app-dialog-border-soft)] bg-[var(--app-dialog-control-surface)] hover:border-sky-200 hover:bg-sky-50/35 dark:hover:border-sky-400/20 dark:hover:bg-sky-400/5",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] leading-5 font-semibold text-[var(--app-dialog-title)]">
            {plan.name}
          </p>
          <p className="mt-1 text-[12px] leading-[18px] text-[var(--app-dialog-muted)]">
            {plan.summary}
          </p>
        </div>
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-full border",
            active
              ? "border-sky-500 bg-sky-500 text-white"
              : "border-[var(--app-dialog-border-strong)] text-transparent",
          )}
        >
          <Check className="size-3.5" strokeWidth={2.2} />
        </span>
      </div>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-[24px] leading-none font-semibold text-[var(--app-dialog-title)]">
          {plan.monthlyPrice}
        </span>
        {plan.monthlyPrice !== "定制" ? (
          <span className="pb-0.5 text-[12px] leading-4 text-[var(--app-dialog-muted)]">
            / 月
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] leading-4 text-[var(--app-dialog-muted)]">
        年付 {plan.yearlyPrice}，{plan.yearlyHint}
      </p>

      <div className="mt-auto space-y-1.5 pt-3">
        {plan.features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-1.5 text-[12px] leading-4 text-[var(--app-dialog-body)]"
          >
            <Check className="size-3.5 shrink-0 text-emerald-500" strokeWidth={2} />
            <span className="min-w-0 truncate">{feature}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[76px] gap-2.5 rounded-[var(--app-radius-panel)] border border-[var(--app-dialog-border-soft)] bg-[var(--app-dialog-control-surface)] p-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-[var(--app-radius-control)] bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-200">
        <Icon className="size-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Check
            className={cn("size-3.5 shrink-0 text-emerald-500")}
            strokeWidth={2}
          />
          <p className="text-[14px] leading-5 font-medium text-[var(--app-dialog-title)]">
            {title}
          </p>
        </div>
        <p className="mt-1 text-[12px] leading-[18px] text-[var(--app-dialog-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
