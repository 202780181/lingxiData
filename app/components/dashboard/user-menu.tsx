import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import {
  BookOpen,
  ChevronRight,
  Computer,
  Download,
  ExternalLink,
  LogOut,
  Mail,
  MessageCircleQuestion,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Workflow,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

import { dispatchMembershipUpgradeEvent } from "@/lib/app-api-events";
import { getLoginBypassHref } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

type DashboardThemeMode = "system" | "light" | "dark";

const USER_MENU_THEME_STORAGE_KEY = "lingxi-dashboard-theme";

const userMenuLinks = {
  helpDocs: "https://docs.dify.ai/use-dify/getting-started/introduction",
  contact: "mailto:support@dify.ai",
  forum: "https://forum.dify.ai/",
  community: "https://discord.gg/5AEfbxcd9k",
} as const;

type MenuIcon = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export interface DashboardUserMenuUser {
  name: string;
  email: string;
  initials?: string;
  role?: string;
  avatarUrl?: string | null;
}

interface DashboardUserMenuProps {
  user: DashboardUserMenuUser;
  workspace?: {
    name: string;
    space?: string;
  };
  onOpenSettings: () => void;
  onOpenAccount: () => void;
}

export function DashboardUserMenu({
  user,
  workspace,
  onOpenSettings,
  onOpenAccount,
}: DashboardUserMenuProps) {
  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useDashboardThemeMode();
  const [open, setOpen] = React.useState(false);
  const initials = React.useMemo(
    () => getUserInitials(user.initials ?? user.name),
    [user.initials, user.name],
  );

  return (
    <>
      <Menu.Root modal={false} open={open} onOpenChange={setOpen}>
        <Menu.Trigger
          aria-label="账户"
          className={cn(
            "inline-flex items-center rounded-full p-0.5 outline-none transition-colors hover:bg-[#f2f4f7] focus-visible:ring-2 focus-visible:ring-[#2f69f5]/25",
            open && "bg-[#f2f4f7]",
            "dark:hover:bg-white/8 dark:focus-visible:ring-[#2f69f5]/35 dark:data-[popup-open]:bg-white/8",
          )}
        >
          <AvatarBadge initials={initials} avatarUrl={user.avatarUrl} />
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            align="end"
            sideOffset={4}
            collisionPadding={8}
            className="z-50 outline-none"
          >
            <Menu.Popup className={userMenuPopupClassName}>
              <UserMenuAccountPanel
                user={user}
                initials={initials}
                onUpgrade={() => {
                  setOpen(false);
                  window.setTimeout(() => {
                    dispatchMembershipUpgradeEvent(
                      "升级会员后可获得更高额度和更多经营分析能力。",
                    );
                  }, 0);
                }}
              />

              <Menu.Group className="py-1">
                <Menu.Item
                  onClick={() => {
                    setOpen(false);
                    window.setTimeout(() => {
                      onOpenAccount();
                    }, 0);
                  }}
                  className={userMenuItemClassName}
                >
                  <UserMenuRowContent icon={UserRound} label="账户" />
                </Menu.Item>

                <Menu.Item
                  onClick={() => {
                    setOpen(false);
                    window.setTimeout(() => {
                      onOpenSettings();
                    }, 0);
                  }}
                  className={userMenuItemClassName}
                >
                  <UserMenuRowContent icon={Settings} label="设置" />
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    setOpen(false);
                    navigate("/workspace-onboarding");
                  }}
                  className={userMenuItemClassName}
                >
                  <UserMenuRowContent
                    icon={Workflow}
                    label={
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">工作区</span>
                        {workspace?.name ? (
                          <span className="truncate text-[11px] leading-4 text-[#667085] dark:text-slate-400">
                            {workspace.name}
                          </span>
                        ) : null}
                      </span>
                    }
                  />
                </Menu.Item>

              </Menu.Group>

              <Menu.Separator className={userMenuSeparatorClassName} />

              <Menu.Group className="py-1">
                <Menu.LinkItem
                  href={userMenuLinks.helpDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={userMenuItemClassName}
                >
                  <UserMenuRowContent
                    icon={BookOpen}
                    label="查看帮助文档"
                    trailing={<ExternalLinkIndicator />}
                  />
                </Menu.LinkItem>

                <SupportSubmenu />
                <ComplianceSubmenu />
              </Menu.Group>

              <Menu.Separator className={userMenuSeparatorClassName} />

              <Menu.Group className="py-1">
                <Menu.Item
                  closeOnClick={false}
                  className={cn(
                    userMenuItemClassName,
                    "cursor-default data-[highlighted]:bg-transparent",
                  )}
                >
                  <UserMenuRowContent
                    icon={Sparkles}
                    label="主题"
                    trailing={
                      <ThemeSwitcher
                        value={themeMode}
                        onChange={setThemeMode}
                      />
                    }
                  />
                </Menu.Item>
              </Menu.Group>

              <Menu.Separator className={userMenuSeparatorClassName} />

              <Menu.Group className="py-1">
                <Menu.Item
                  onClick={() => navigate(getLoginBypassHref())}
                  className={userMenuItemClassName}
                >
                  <UserMenuRowContent icon={LogOut} label="登出" />
                </Menu.Item>
              </Menu.Group>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </>
  );
}

function UserMenuAccountPanel({
  user,
  initials,
  onUpgrade,
}: {
  user: DashboardUserMenuUser;
  initials: string;
  onUpgrade: () => void;
}) {
  return (
    <div className="px-3 pb-2.5 pt-3">
      <div className="flex items-center gap-2.5">
        <AvatarBadge
          initials={initials}
          avatarUrl={user.avatarUrl}
          className="size-9 text-[15px]"
        />
        <div className="min-w-0">
          <div className="truncate text-[16px] leading-5 font-semibold text-[#242424] dark:text-slate-50">
            {user.name}
          </div>
          <div className="mt-0.5 truncate text-[13px] leading-[18px] font-normal text-[#a3a3a3] dark:text-slate-400">
            {user.email}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#e8e8e8] pt-3 dark:border-white/10">
        <button
          type="button"
          className="flex w-full items-center gap-1.5 rounded-[10px] text-left outline-none transition-colors hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#2f69f5]/25 dark:hover:text-slate-50"
          onClick={onUpgrade}
        >
          <span className="min-w-0 grow text-[16px] leading-5 font-normal text-[#242424] dark:text-slate-100">
            Free
          </span>
          <Zap
            className="size-4 shrink-0 fill-[#737373] text-[#737373] dark:fill-slate-400 dark:text-slate-400"
            strokeWidth={0}
          />
          <span className="text-[16px] leading-5 font-normal text-[#6f6f6f] dark:text-slate-300">
            80
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-[#7a7a7a] dark:text-slate-400"
            strokeWidth={2.2}
          />
        </button>

        <button
          type="button"
          className="mt-3 flex h-9 w-full items-center justify-center rounded-[11px] bg-[#2b2b2b] px-3 text-[15px] leading-5 font-normal text-white outline-none transition-colors hover:bg-[#1f1f1f] focus-visible:ring-2 focus-visible:ring-[#2f69f5]/25 dark:bg-white dark:text-[#111111] dark:hover:bg-slate-100"
          onClick={onUpgrade}
        >
          升级
        </button>
      </div>
    </div>
  );
}

function SupportSubmenu() {
  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger className={userMenuItemClassName}>
        <UserMenuRowContent icon={MessageCircleQuestion} label="支持" />
        <ChevronRight
          className={userMenuSubmenuArrowClassName}
          strokeWidth={1.9}
        />
      </Menu.SubmenuTrigger>

      <Menu.Portal>
        <Menu.Positioner
          side="left"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-[60] outline-none"
        >
          <Menu.Popup
            className={cn(userMenuPopupBaseClassName, "w-[208px] py-0")}
          >
            <Menu.Group className="py-1">
              <Menu.LinkItem
                href={userMenuLinks.contact}
                rel="noopener noreferrer"
                target="_blank"
                className={userMenuItemClassName}
              >
                <UserMenuRowContent
                  icon={Mail}
                  label="邮件支持"
                  trailing={<ExternalLinkIndicator />}
                />
              </Menu.LinkItem>
              <Menu.LinkItem
                href={userMenuLinks.forum}
                rel="noopener noreferrer"
                target="_blank"
                className={userMenuItemClassName}
              >
                <UserMenuRowContent
                  icon={MessageCircleQuestion}
                  label="论坛"
                  trailing={<ExternalLinkIndicator />}
                />
              </Menu.LinkItem>
              <Menu.LinkItem
                href={userMenuLinks.community}
                rel="noopener noreferrer"
                target="_blank"
                className={userMenuItemClassName}
              >
                <UserMenuRowContent
                  icon={MessageCircleQuestion}
                  label="社区"
                  trailing={<ExternalLinkIndicator />}
                />
              </Menu.LinkItem>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}

function ComplianceSubmenu() {
  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger className={userMenuItemClassName}>
        <UserMenuRowContent icon={ShieldCheck} label="合规" />
        <ChevronRight
          className={userMenuSubmenuArrowClassName}
          strokeWidth={1.9}
        />
      </Menu.SubmenuTrigger>

      <Menu.Portal>
        <Menu.Positioner
          side="left"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-[60] outline-none"
        >
          <Menu.Popup
            className={cn(userMenuPopupBaseClassName, "w-[312px] py-0")}
          >
            <Menu.Group className="py-1">
              <ComplianceItem label="SOC 2 Type I" canDownload />
              <ComplianceItem label="SOC 2 Type II" />
              <ComplianceItem label="ISO 27001" />
              <ComplianceItem label="GDPR" canDownload />
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}

function ComplianceItem({
  label,
  canDownload = false,
}: {
  label: string;
  canDownload?: boolean;
}) {
  return (
    <Menu.Item className="mx-1 flex h-9 cursor-pointer select-none items-center gap-1 rounded-[10px] py-1 pr-2 pl-1 outline-none data-[highlighted]:bg-[#f2f4f7] dark:data-[highlighted]:bg-white/8">
      <div className="grid size-[26px] shrink-0 place-items-center rounded-[10px] border border-[#e4e7ec] bg-white text-[#667085] dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        <ShieldCheck className="size-4" strokeWidth={1.8} />
      </div>
      <div className="grow truncate px-1 text-[14px] leading-5 font-normal text-[#344054] dark:text-slate-300">
        {label}
      </div>
      {canDownload ? (
        <span className="inline-flex h-[26px] items-center gap-px rounded-[9px] border border-[#d0d5dd] bg-white px-2 text-[11px] font-medium text-[#344054] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <Download className="size-[14px]" strokeWidth={1.9} />
          下载
        </span>
      ) : (
        <span className="inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#eef4ff] px-2 text-[11px] font-medium text-[#3538cd] dark:bg-blue-500/15 dark:text-blue-300">
          <Sparkles className="size-3.5" strokeWidth={1.8} />
          升级
        </span>
      )}
    </Menu.Item>
  );
}

function UserMenuRowContent({
  icon: Icon,
  label,
  trailing,
}: {
  icon: MenuIcon;
  label: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <>
      <Icon className={userMenuLeadingIconClassName} strokeWidth={1.9} />
      <div className="min-w-0 grow truncate px-1 text-[14px] leading-5 font-normal text-[#344054] dark:text-slate-300">
        {label}
      </div>
      {trailing}
    </>
  );
}

function AvatarBadge({
  initials,
  avatarUrl,
  className,
}: {
  initials: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-[#155eef] text-[14px] font-medium text-white",
        className,
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="用户头像"
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function ExternalLinkIndicator() {
  return (
    <ExternalLink className={userMenuTrailingIconClassName} strokeWidth={1.9} />
  );
}

function ThemeSwitcher({
  value,
  onChange,
}: {
  value: DashboardThemeMode;
  onChange: (value: DashboardThemeMode) => void;
}) {
  return (
    <div className="flex items-center rounded-[9px] bg-[#f2f4f7] p-0.5 dark:bg-white/8">
      <ThemeButton
        active={value === "system"}
        label="System theme"
        icon={Computer}
        onClick={() => onChange("system")}
      />
      <ThemeDivider active={value === "dark"} />
      <ThemeButton
        active={value === "light"}
        label="Light theme"
        icon={Sun}
        onClick={() => onChange("light")}
      />
      <ThemeDivider active={value === "system"} />
      <ThemeButton
        active={value === "dark"}
        label="Dark theme"
        icon={Moon}
        onClick={() => onChange("dark")}
      />
    </div>
  );
}

function ThemeButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: MenuIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "rounded-[8px] px-1.5 py-1 text-[#667085] outline-none hover:bg-[#eef0f3] hover:text-[#344054] focus-visible:ring-2 focus-visible:ring-[#2f69f5]/25 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-slate-200",
        active &&
          "bg-white text-[#155eef] shadow-sm hover:bg-white hover:text-[#155eef] dark:bg-white dark:text-[#155eef]",
      )}
    >
      <div className="p-0.5">
        <Icon className="size-4" strokeWidth={1.9} />
      </div>
    </button>
  );
}

function ThemeDivider({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "h-[14px] w-px bg-transparent",
        active && "bg-[#d0d5dd] dark:bg-white/15",
      )}
    />
  );
}

function useDashboardThemeMode() {
  const [themeMode, setThemeMode] =
    React.useState<DashboardThemeMode>("system");

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(
      USER_MENU_THEME_STORAGE_KEY,
    );

    if (isDashboardThemeMode(storedTheme)) {
      setThemeMode(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme =
        themeMode === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : themeMode;

      document.documentElement.classList.toggle(
        "dark",
        resolvedTheme === "dark",
      );
      document.documentElement.style.colorScheme = resolvedTheme;
      window.localStorage.setItem(USER_MENU_THEME_STORAGE_KEY, themeMode);
    };

    applyTheme();

    if (themeMode !== "system") {
      return;
    }

    const handleChange = () => applyTheme();

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  return { themeMode, setThemeMode };
}

function getUserInitials(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "A";
  }

  return normalizedValue.charAt(0).toUpperCase();
}

function isDashboardThemeMode(value: unknown): value is DashboardThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

const userMenuPopupBaseClassName = cn(
  "max-h-[var(--available-height)] overflow-y-auto overflow-x-hidden rounded-[14px] border border-[#e4e7ec] bg-white text-[14px] text-[#344054] shadow-lg outline-none backdrop-blur-[5px]",
  "origin-[var(--transform-origin)] transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none",
  "dark:border-white/10 dark:bg-[#101828] dark:text-slate-300",
);

const userMenuPopupClassName = cn(
  userMenuPopupBaseClassName,
  "w-56 max-w-80 bg-white/95 py-0 dark:bg-[#101828]/95",
);

const userMenuItemClassName = cn(
  "mx-1 flex min-h-[30px] cursor-pointer select-none items-center gap-1 rounded-[10px] px-2 py-1 outline-none",
  "data-[highlighted]:bg-[#f2f4f7] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-30",
  "dark:data-[highlighted]:bg-white/8",
);

const userMenuLeadingIconClassName =
  "size-4 shrink-0 text-[#667085] dark:text-slate-400";
const userMenuTrailingIconClassName =
  "size-[14px] shrink-0 text-[#667085] dark:text-slate-400";
const userMenuSubmenuArrowClassName =
  "ml-auto size-4 shrink-0 text-[#667085] dark:text-slate-400";
const userMenuSeparatorClassName = "my-0 h-px bg-[#eaecf0] dark:bg-white/10";
