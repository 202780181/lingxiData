import * as React from "react";
import {
  Bell,
  ChevronDown,
  Database,
  Download,
  Play,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

import { AppDialog, AppDialogCloseButton } from "@/components/ui/app-dialog";
import { cn } from "@/lib/utils";

type MenuIcon = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

type DashboardThemeMode = "system" | "light" | "dark";
type SettingsSectionKey =
  | "general"
  | "notifications"
  | "personalization"
  | "data-management"
  | "account";

type SettingsPreferences = {
  contrast: "system" | "standard" | "high";
  accentColor: "default" | "ocean" | "violet" | "mint";
  language: "auto" | "zh-CN" | "en-US";
  speechLanguage: "auto" | "mandarin" | "english";
  voice: "cove" | "alloy" | "breeze";
  standaloneVoiceMode: boolean;
  desktopNotifications: boolean;
  emailDigest: boolean;
  taskAlerts: boolean;
  productUpdates: boolean;
  interfaceDensity: "comfortable" | "compact";
  defaultHome:
    | "home-dashboard"
    | "multi-account-analysis"
    | "account-overview";
  showPromptSuggestions: boolean;
  motionEffects: boolean;
  usageHistory: boolean;
  improveProduct: boolean;
  dataRetention: "30" | "90" | "365";
  twoFactorAuth: boolean;
  securityAlerts: boolean;
};

export interface DashboardSettingsDialogUser {
  name: string;
  email: string;
  role?: string;
}

interface DashboardSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  user: DashboardSettingsDialogUser;
  themeMode: DashboardThemeMode;
  onThemeModeChange: (value: DashboardThemeMode) => void;
}

const DASHBOARD_SETTINGS_STORAGE_KEY = "lingxi:dashboard-settings";

const defaultSettingsPreferences: SettingsPreferences = {
  contrast: "system",
  accentColor: "default",
  language: "auto",
  speechLanguage: "auto",
  voice: "cove",
  standaloneVoiceMode: false,
  desktopNotifications: true,
  emailDigest: true,
  taskAlerts: true,
  productUpdates: false,
  interfaceDensity: "comfortable",
  defaultHome: "home-dashboard",
  showPromptSuggestions: true,
  motionEffects: true,
  usageHistory: true,
  improveProduct: false,
  dataRetention: "90",
  twoFactorAuth: false,
  securityAlerts: true,
};

const sectionItems: Array<{
  key: SettingsSectionKey;
  label: string;
  icon: MenuIcon;
}> = [
  { key: "general", label: "常规", icon: Settings },
  { key: "notifications", label: "通知", icon: Bell },
  { key: "personalization", label: "个性化", icon: Sparkles },
  { key: "data-management", label: "数据管理", icon: Database },
  { key: "account", label: "账户", icon: UserRound },
];

const themeModeOptions = [
  { value: "system", label: "系统" },
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
] as const;

const contrastOptions = [
  { value: "system", label: "系统" },
  { value: "standard", label: "标准" },
  { value: "high", label: "高对比度" },
] as const;

const accentOptions = [
  { value: "default", label: "默认", color: "bg-[#9ca3af]" },
  { value: "ocean", label: "海蓝", color: "bg-[#2563eb]" },
  { value: "violet", label: "紫罗兰", color: "bg-[#8b5cf6]" },
  { value: "mint", label: "薄荷", color: "bg-[#10b981]" },
] as const;

const languageOptions = [
  { value: "auto", label: "自动检测" },
  { value: "zh-CN", label: "简体中文" },
  { value: "en-US", label: "English" },
] as const;

const speechLanguageOptions = [
  { value: "auto", label: "自动检测" },
  { value: "mandarin", label: "普通话" },
  { value: "english", label: "English" },
] as const;

const voiceOptions = [
  { value: "cove", label: "Cove" },
  { value: "alloy", label: "Alloy" },
  { value: "breeze", label: "Breeze" },
] as const;

const interfaceDensityOptions = [
  { value: "comfortable", label: "舒适" },
  { value: "compact", label: "紧凑" },
] as const;

const defaultHomeOptions = [
  { value: "home-dashboard", label: "首页看板" },
  { value: "multi-account-analysis", label: "多账号管理分析" },
  { value: "account-overview", label: "账号综合分析" },
] as const;

const retentionOptions = [
  { value: "30", label: "30 天" },
  { value: "90", label: "90 天" },
  { value: "365", label: "365 天" },
] as const;

export function DashboardSettingsDialog({
  open,
  onClose,
  user,
  themeMode,
  onThemeModeChange,
}: DashboardSettingsDialogProps) {
  const [activeSection, setActiveSection] =
    React.useState<SettingsSectionKey>("general");
  const [isVoicePreviewing, setIsVoicePreviewing] = React.useState(false);
  const [isExportRequested, setIsExportRequested] = React.useState(false);
  const { preferences, updatePreference } = useDashboardSettingsPreferences();

  React.useEffect(() => {
    if (!isVoicePreviewing) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVoicePreviewing(false);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [isVoicePreviewing]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      labelledBy="dashboard-settings-title"
      size="settings"
      className="max-w-[800px] h-[min(calc(100svh-24px),592px)]"
    >
      <aside className="flex w-full shrink-0 flex-col border-b border-[var(--app-dialog-border-soft)] bg-[var(--app-dialog-surface-muted)] px-2 py-2 md:w-[184px] md:border-b-0 md:border-r">
        <AppDialogCloseButton
          label="关闭设置"
          className="size-8"
          onClick={onClose}
        />

        <nav className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
          {sectionItems.map((section) => (
            <SettingsNavItem
              key={section.key}
              compact
              icon={section.icon}
              active={activeSection === section.key}
              label={section.label}
              onClick={() => setActiveSection(section.key)}
            />
          ))}
        </nav>
      </aside>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-3 py-2 md:px-3.5 md:py-2">
          <h2 id="dashboard-settings-title" className="sr-only">
            设置
          </h2>
          <div>
            {activeSection === "general" ? (
              <>
                <SettingsRow
                  compact
                  label="外观"
                  control={
                    <SettingsSelectControl
                      compact
                      value={themeMode}
                      onChange={(value) =>
                        onThemeModeChange(value as DashboardThemeMode)
                      }
                      options={themeModeOptions}
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="对比度"
                  control={
                    <SettingsSelectControl
                      compact
                      value={preferences.contrast}
                      onChange={(value) =>
                        updatePreference(
                          "contrast",
                          value as SettingsPreferences["contrast"],
                        )
                      }
                      options={contrastOptions}
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="重点色"
                  control={
                    <SettingsSelectControl
                      compact
                      value={preferences.accentColor}
                      onChange={(value) =>
                        updatePreference(
                          "accentColor",
                          value as SettingsPreferences["accentColor"],
                        )
                      }
                      options={accentOptions.map((item) => ({
                        value: item.value,
                        label: item.label,
                      }))}
                      leading={
                        <span
                          className={cn(
                            "size-3 rounded-full",
                            accentOptions.find(
                              (item) => item.value === preferences.accentColor,
                            )?.color ?? "bg-[#9ca3af]",
                          )}
                        />
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="语言"
                  control={
                    <SettingsSelectControl
                      compact
                      value={preferences.language}
                      onChange={(value) =>
                        updatePreference(
                          "language",
                          value as SettingsPreferences["language"],
                        )
                      }
                      options={languageOptions}
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="口语"
                  description="为获得更好的语音识别结果，请选择你当前最常用的语言环境。"
                  control={
                    <SettingsSelectControl
                      compact
                      value={preferences.speechLanguage}
                      onChange={(value) =>
                        updatePreference(
                          "speechLanguage",
                          value as SettingsPreferences["speechLanguage"],
                        )
                      }
                      options={speechLanguageOptions}
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="声音"
                  control={
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="app-dialog-pill-control min-h-[34px] px-2.5 py-0.5"
                        onClick={() => setIsVoicePreviewing(true)}
                      >
                        <Play
                          className={cn(
                            "size-[18px]",
                            isVoicePreviewing && "fill-current",
                          )}
                          strokeWidth={1.9}
                        />
                        {isVoicePreviewing ? "试听中" : "播放"}
                      </button>

                      <span className="h-[18px] w-px bg-[var(--app-dialog-border-soft)]" />

                      <SettingsSelectControl
                        compact
                        value={preferences.voice}
                        onChange={(value) =>
                          updatePreference(
                            "voice",
                            value as SettingsPreferences["voice"],
                          )
                        }
                        options={voiceOptions}
                        minWidth={98}
                      />
                    </div>
                  }
                />
                <SettingsRow
                  compact
                  label="独立语音模式"
                  description="在单独的全屏语音体验里启用语音对话，不显示额外的文本与界面元素。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.standaloneVoiceMode}
                      onCheckedChange={(checked) =>
                        updatePreference("standaloneVoiceMode", checked)
                      }
                    />
                  }
                />
              </>
            ) : null}

            {activeSection === "notifications" ? (
              <>
                <SettingsRow
                  compact
                  label="桌面通知"
                  description="在任务完成、导出就绪和系统事件发生时推送桌面提醒。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.desktopNotifications}
                      onCheckedChange={(checked) =>
                        updatePreference("desktopNotifications", checked)
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="邮件摘要"
                  description="每天将使用概览、重要更新和异常提醒发送到你的邮箱。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.emailDigest}
                      onCheckedChange={(checked) =>
                        updatePreference("emailDigest", checked)
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="任务提醒"
                  description="批量推理、模型训练和部署状态变化时通知我。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.taskAlerts}
                      onCheckedChange={(checked) =>
                        updatePreference("taskAlerts", checked)
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="产品更新"
                  description="接收版本功能更新、灰度能力开放和活动通知。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.productUpdates}
                      onCheckedChange={(checked) =>
                        updatePreference("productUpdates", checked)
                      }
                    />
                  }
                />
              </>
            ) : null}

            {activeSection === "personalization" ? (
              <>
                <SettingsRow
                  compact
                  label="界面密度"
                  control={
                    <SettingsSelectControl
                      compact
                      value={preferences.interfaceDensity}
                      onChange={(value) =>
                        updatePreference(
                          "interfaceDensity",
                          value as SettingsPreferences["interfaceDensity"],
                        )
                      }
                      options={interfaceDensityOptions}
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="默认进入页面"
                  control={
                    <SettingsSelectControl
                      compact
                      value={preferences.defaultHome}
                      onChange={(value) =>
                        updatePreference(
                          "defaultHome",
                          value as SettingsPreferences["defaultHome"],
                        )
                      }
                      options={defaultHomeOptions}
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="推荐提示词"
                  description="在空白状态下展示建议任务和预置模板，帮助更快开始。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.showPromptSuggestions}
                      onCheckedChange={(checked) =>
                        updatePreference("showPromptSuggestions", checked)
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="界面动效"
                  description="控制过渡动画、悬浮反馈和弹窗轻动效。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.motionEffects}
                      onCheckedChange={(checked) =>
                        updatePreference("motionEffects", checked)
                      }
                    />
                  }
                />
              </>
            ) : null}

            {activeSection === "data-management" ? (
              <>
                <SettingsRow
                  compact
                  label="保存使用历史"
                  description="保留最近操作记录，便于跨设备继续查看和回溯。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.usageHistory}
                      onCheckedChange={(checked) =>
                        updatePreference("usageHistory", checked)
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="使用数据改进产品"
                  description="允许以匿名方式记录使用情况，用于改进推荐质量与交互体验。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.improveProduct}
                      onCheckedChange={(checked) =>
                        updatePreference("improveProduct", checked)
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="数据保留周期"
                  control={
                    <SettingsSelectControl
                      compact
                      value={preferences.dataRetention}
                      onChange={(value) =>
                        updatePreference(
                          "dataRetention",
                          value as SettingsPreferences["dataRetention"],
                        )
                      }
                      options={retentionOptions}
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="导出数据"
                  description="打包你的偏好配置、最近使用记录和基础账户信息。"
                  control={
                    <button
                      type="button"
                      className="app-dialog-button app-dialog-button--secondary min-h-[34px] px-3"
                      onClick={() => setIsExportRequested(true)}
                    >
                      <Download className="size-[15px]" strokeWidth={1.9} />
                      {isExportRequested ? "已创建导出请求" : "导出数据包"}
                    </button>
                  }
                />
              </>
            ) : null}

            {activeSection === "account" ? (
              <>
                <SettingsRow
                  compact
                  label="名称"
                  control={<StaticValue value={user.name} />}
                />
                <SettingsRow
                  compact
                  label="邮箱"
                  control={<StaticValue value={user.email} />}
                />
                <SettingsRow
                  compact
                  label="角色"
                  control={<StaticValue value={user.role ?? "管理员"} />}
                />
                <SettingsRow
                  compact
                  label="双重验证"
                  description="开启后，登录时会额外要求验证步骤以提高账户安全性。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        updatePreference("twoFactorAuth", checked)
                      }
                    />
                  }
                />
                <SettingsRow
                  compact
                  label="安全通知"
                  description="当检测到新设备登录或风险操作时，通过邮箱通知我。"
                  control={
                    <SettingsSwitch
                      compact
                      checked={preferences.securityAlerts}
                      onCheckedChange={(checked) =>
                        updatePreference("securityAlerts", checked)
                      }
                    />
                  }
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AppDialog>
  );
}

function SettingsNavItem({
  active,
  icon: Icon,
  label,
  compact = false,
  onClick,
}: {
  active: boolean;
  icon: MenuIcon;
  label: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-active={active}
      className={cn(
        "app-dialog-nav-item",
        compact && "min-h-[40px] gap-2.5 rounded-[12px] px-3",
      )}
      onClick={onClick}
    >
      <Icon className="size-[19px] shrink-0" strokeWidth={1.9} />
      <span>{label}</span>
    </button>
  );
}

function SettingsRow({
  label,
  description,
  control,
  compact = false,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("app-dialog-row", compact && "gap-2.5 py-3 md:gap-5")}>
      <div className="space-y-1">
        <div className="app-dialog-row-label">{label}</div>
        {description ? (
          <p className="app-dialog-row-description">{description}</p>
        ) : null}
      </div>
      <div className="app-dialog-row-control">{control}</div>
    </div>
  );
}

function SettingsSelectControl({
  value,
  onChange,
  options,
  leading,
  minWidth = 120,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  leading?: React.ReactNode;
  minWidth?: number;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "app-dialog-pill-control",
        compact && "min-h-[34px] gap-1.5 px-2.5 py-0.5",
      )}
      style={{ minWidth }}
    >
      {leading}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("app-dialog-pill-select", compact && "pr-4")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 size-4 text-[var(--app-dialog-body)]"
        strokeWidth={1.9}
      />
    </div>
  );
}

function SettingsSwitch({
  checked,
  onCheckedChange,
  compact = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-checked={checked}
      className={cn("app-dialog-switch", compact && "h-[26px] w-[42px]")}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={cn("app-dialog-switch-thumb", compact && "size-[22px]")}
      />
    </button>
  );
}

function StaticValue({ value }: { value: string }) {
  return <div className="app-dialog-static-value">{value}</div>;
}

function useDashboardSettingsPreferences() {
  const [preferences, setPreferences] = React.useState<SettingsPreferences>(
    defaultSettingsPreferences,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = window.localStorage.getItem(
      DASHBOARD_SETTINGS_STORAGE_KEY,
    );

    if (!storedValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(
        storedValue,
      ) as Partial<SettingsPreferences>;

      setPreferences((currentValue) => ({
        ...currentValue,
        ...parsedValue,
      }));
    } catch {
      window.localStorage.removeItem(DASHBOARD_SETTINGS_STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DASHBOARD_SETTINGS_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  }, [preferences]);

  const updatePreference = React.useCallback(
    <Key extends keyof SettingsPreferences>(
      key: Key,
      value: SettingsPreferences[Key],
    ) => {
      setPreferences((currentValue) => ({
        ...currentValue,
        [key]: value,
      }));
    },
    [],
  );

  return { preferences, updatePreference };
}
