import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { Bell, BookOpen, Search } from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
  useMatch,
  useResolvedPath,
} from "react-router";

import { DashboardProfileDialog } from "@/components/dashboard/dashboard-profile-dialog";
import { DashboardUserMenu } from "@/components/dashboard/user-menu";
import { DashboardSettingsDialog } from "@/components/dashboard/dashboard-settings-dialog";
import { cn } from "@/lib/utils";
import {
  dashboardNavGroups,
  dashboardPrimaryItem,
  dashboardSidebarChrome,
  dashboardUtilityItems,
  type DashboardNavItem,
} from "./config";
import type { CurrentUserResponse } from "@/lib/app-api";
import {
  getUserDisplayName,
  getUserInitials,
  getUserRoleLabel,
} from "@/lib/current-user";

export interface DashboardPageData {
  seo: {
    title: string;
    description: string;
  };
  workspace: {
    name: string;
    region: string;
    space: string;
    version: string;
  };
  user: {
    name: string;
    email: string;
    role: string;
    initials: string;
  };
}

const DASHBOARD_SIDEBAR_COLLAPSED_STORAGE_KEY =
  "lingxi:dashboard-sidebar-collapsed";
const DASHBOARD_PROFILE_STORAGE_KEY = "lingxi:dashboard-profile";

const dashboardPageData: Omit<DashboardPageData, "user"> = {
  seo: {
    title: "灵犀数据工作台 - 系统驾驶舱",
    description: "左侧导航已保留，右侧内容区暂时留空，便于先完成导航结构。",
  },
  workspace: {
    name: "灵犀数据增长中台",
    region: "华东 2 (上海)",
    space: "默认业务空间",
    version: "Production",
  },
};

export function loadDashboardPageData(currentUser: CurrentUserResponse) {
  const displayName = getUserDisplayName(currentUser.session);

  return {
    ...dashboardPageData,
    user: {
      name: displayName,
      email: currentUser.session.email,
      role: getUserRoleLabel(currentUser.session),
      initials: getUserInitials(displayName),
    },
  } satisfies DashboardPageData;
}

export function getDashboardMeta(data?: DashboardPageData) {
  const title = data?.seo.title ?? dashboardPageData.seo.title;
  const description =
    data?.seo.description ?? dashboardPageData.seo.description;

  return [{ title }, { name: "description", content: description }];
}

export function DashboardLayout({ data }: { data: DashboardPageData }) {
  const location = useLocation();
  const contentScrollRef = React.useRef<HTMLDivElement>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);
  const { themeMode, setThemeMode } = useResolvedThemeMode();
  const { profile, saveProfile } = useDashboardProfileState(data.user);
  const SidebarActionIcon = isSidebarCollapsed
    ? dashboardSidebarChrome.expandIcon
    : dashboardSidebarChrome.collapseIcon;

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsSidebarCollapsed(
      window.localStorage.getItem(DASHBOARD_SIDEBAR_COLLAPSED_STORAGE_KEY) ===
        "true",
    );
  }, []);

  React.useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DASHBOARD_SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(isSidebarCollapsed),
    );
  }, [isSidebarCollapsed]);

  return (
    <main className="glass-layout-bg flex h-svh flex-col overflow-hidden text-slate-950 dark:text-slate-100">
      <div className="flex min-h-0 flex-1 flex-col gap-[var(--app-shell-gap)] px-3 pb-3 pt-0 lg:px-4 lg:pb-4 lg:pt-0">
        <header className="glass-topbar -mx-3 flex shrink-0 flex-col gap-2.5 rounded-none px-4 py-2 lg:-mx-4 lg:h-[var(--app-topbar-height)] lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex min-w-0 items-center gap-2 pr-1">
              <div className="grid size-8 shrink-0 place-items-center rounded-[11px] bg-[linear-gradient(135deg,#586dff_0%,#22c3ff_48%,#2dd4bf_100%)] shadow-[0_12px_26px_rgba(71,114,255,0.24)]">
                <div className="flex items-end gap-[2px]">
                  <span className="h-3 w-1.5 rounded-full bg-white/92" />
                  <span className="h-4.5 w-1.5 rounded-full bg-white/78" />
                  <span className="h-3.5 w-1.5 rounded-full bg-white/62" />
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-100">
                  灵犀数据
                </p>
              </div>
            </div>

            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="glass-search-field hidden h-[var(--app-control-height-lg)] min-w-[var(--app-search-width-min)] max-w-[560px] flex-1 items-center gap-2 rounded-[var(--app-radius-panel)] px-3 py-1 text-left lg:flex"
            >
              <div className="grid size-6 shrink-0 place-items-center rounded-[8px] bg-white/72 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] dark:bg-white/5 dark:text-slate-400 dark:shadow-none">
                <Search className="size-3.5" strokeWidth={2} />
              </div>

              <input
                type="search"
                aria-label="搜索达人、视频或品牌"
                placeholder="搜索达人、视频或品牌"
                className="glass-search-input min-w-0 flex-1 bg-transparent text-[14px] leading-5 font-medium text-slate-700 placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-500"
              />

              <div className="glass-chip pointer-events-none hidden items-center gap-1 rounded-[7px] border-white/55 px-1.5 py-0.5 text-[10px] font-medium tracking-[0.02em] text-slate-400 dark:border-white/10 dark:text-slate-500 xl:flex">
                <span>Ctrl</span>
                <span className="text-slate-300 dark:text-slate-600">+</span>
                <span>K</span>
              </div>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm lg:ml-5 lg:flex-nowrap">
            <button
              type="button"
              className="glass-chip grid size-8 place-items-center rounded-[var(--app-radius-control)] text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <BookOpen className="size-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              className="glass-chip grid size-8 place-items-center rounded-[var(--app-radius-control)] text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Bell className="size-4" strokeWidth={2} />
            </button>

            <div className="flex items-center lg:border-l lg:border-white/35 lg:pl-4 dark:lg:border-white/10">
              <DashboardUserMenu
                user={profile}
                onOpenAccount={() => setIsAccountOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <aside
            className={cn(
              "w-full shrink-0 transition-[width] duration-200 lg:overflow-hidden",
              isSidebarCollapsed
                ? "lg:w-[var(--app-sidebar-width-collapsed)]"
                : "lg:w-[var(--app-sidebar-width)]",
            )}
          >
            <div className="glass-sidebar flex h-full flex-col overflow-hidden rounded-[var(--app-radius-panel)] border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(244,248,255,0.54))] shadow-[0_22px_56px_rgba(135,151,181,0.16)] dark:border-white/10 dark:bg-[linear-gradient(180deg,oklch(0.205_0_0/0.98),oklch(0.205_0_0/0.95))] dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
              <div className="sidebar-scroll-area min-h-0 flex-1 overflow-y-auto">
                <div
                  className={cn(
                    "py-3",
                    isSidebarCollapsed ? "lg:px-2" : "px-0",
                  )}
                >
                  <DashboardSidebarLink
                    item={dashboardPrimaryItem}
                    prominent
                    collapsed={isSidebarCollapsed}
                  />

                  {dashboardNavGroups.map((group) => (
                    <section
                      key={group.title}
                      className={cn(
                        "pt-4 first:pt-3.5",
                        isSidebarCollapsed && "lg:pt-3 lg:first:pt-2.5",
                      )}
                    >
                      {!isSidebarCollapsed && group.title ? (
                        <p className="mx-6 mb-2.5 h-8 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-8 font-medium text-[rgba(38,36,76,0.45)] dark:text-slate-500">
                          {group.title}
                        </p>
                      ) : null}

                      <div className="flex flex-col gap-2.5">
                        {group.items.map((item) => (
                          <DashboardSidebarLink
                            key={item.key}
                            item={item}
                            collapsed={isSidebarCollapsed}
                          />
                        ))}
                      </div>
                    </section>
                  ))}

                  {dashboardUtilityItems.length ? (
                    <div
                      className={cn(
                        "mx-0 mt-4 border-t border-white/40 pt-3 dark:border-white/10",
                        isSidebarCollapsed && "mt-2.5",
                      )}
                    >
                      {dashboardUtilityItems.map((item) => (
                        <DashboardSidebarLink
                          key={item.key}
                          item={item}
                          collapsed={isSidebarCollapsed}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                className={cn(
                  "border-t border-white/45 px-3 py-2.5 dark:border-white/10",
                  isSidebarCollapsed && "px-2.5",
                )}
              >
                <button
                  type="button"
                  title={
                    isSidebarCollapsed
                      ? dashboardSidebarChrome.expandLabel
                      : dashboardSidebarChrome.collapseLabel
                  }
                  aria-label={
                    isSidebarCollapsed
                      ? dashboardSidebarChrome.expandLabel
                      : dashboardSidebarChrome.collapseLabel
                  }
                  onClick={() =>
                    setIsSidebarCollapsed((currentValue) => !currentValue)
                  }
                  className={cn(
                    "glass-chip hidden size-8 place-items-center rounded-[var(--app-radius-control)] text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 lg:grid",
                    isSidebarCollapsed && "mx-auto",
                  )}
                >
                  <SidebarActionIcon
                    className="size-[16px]"
                    strokeWidth={1.9}
                  />
                </button>
              </div>
            </div>
          </aside>

          <section className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="glass-panel-strong shadow-none flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--app-radius-panel)]">
              <div
                ref={contentScrollRef}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 md:px-5 md:py-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.5)_transparent] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/60"
              >
                <Outlet />
              </div>
            </div>
          </section>
        </div>
      </div>

      <DashboardSettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={profile}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
      />

      <DashboardProfileDialog
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        profile={profile}
        onSave={saveProfile}
      />
    </main>
  );
}

function useResolvedThemeMode() {
  const [themeMode, setThemeMode] = React.useState<"system" | "light" | "dark">(
    "system",
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem("lingxi-dashboard-theme");

    if (
      storedTheme === "system" ||
      storedTheme === "light" ||
      storedTheme === "dark"
    ) {
      setThemeMode(storedTheme);
    }
  }, []);

  const setResolvedThemeMode = React.useCallback(
    (value: "system" | "light" | "dark") => {
      setThemeMode(value);

      if (typeof window === "undefined") {
        return;
      }

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const resolvedTheme =
        value === "system" ? (mediaQuery.matches ? "dark" : "light") : value;

      document.documentElement.classList.toggle(
        "dark",
        resolvedTheme === "dark",
      );
      document.documentElement.style.colorScheme = resolvedTheme;
      window.localStorage.setItem("lingxi-dashboard-theme", value);
    },
    [],
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || themeMode !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      document.documentElement.classList.toggle("dark", mediaQuery.matches);
      document.documentElement.style.colorScheme = mediaQuery.matches
        ? "dark"
        : "light";
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  return {
    themeMode,
    setThemeMode: setResolvedThemeMode,
  };
}

function useDashboardProfileState(initialUser: DashboardPageData["user"]) {
  const [profile, setProfile] = React.useState(() =>
    buildDashboardProfile(initialUser),
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      setProfile(buildDashboardProfile(initialUser));
      return;
    }

    const storedProfile = window.localStorage.getItem(
      DASHBOARD_PROFILE_STORAGE_KEY,
    );

    if (!storedProfile) {
      setProfile(buildDashboardProfile(initialUser));
      return;
    }

    try {
      const parsedProfile = JSON.parse(storedProfile) as Partial<{
        name: string;
        username: string;
        avatarUrl: string | null;
      }>;

      setProfile(
        buildDashboardProfile(initialUser, {
          name: parsedProfile.name,
          username: parsedProfile.username,
          avatarUrl: parsedProfile.avatarUrl,
        }),
      );
    } catch {
      window.localStorage.removeItem(DASHBOARD_PROFILE_STORAGE_KEY);
      setProfile(buildDashboardProfile(initialUser));
    }
  }, [
    initialUser.email,
    initialUser.initials,
    initialUser.name,
    initialUser.role,
  ]);

  const saveProfile = React.useCallback(
    (nextProfile: {
      name: string;
      username: string;
      avatarUrl: string | null;
    }) => {
      const resolvedProfile = buildDashboardProfile(initialUser, nextProfile);

      setProfile(resolvedProfile);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          DASHBOARD_PROFILE_STORAGE_KEY,
          JSON.stringify({
            name: resolvedProfile.name,
            username: resolvedProfile.username,
            avatarUrl: resolvedProfile.avatarUrl,
          }),
        );
      }
    },
    [
      initialUser.email,
      initialUser.initials,
      initialUser.name,
      initialUser.role,
    ],
  );

  return { profile, saveProfile };
}

function buildDashboardProfile(
  initialUser: DashboardPageData["user"],
  overrides?: Partial<{
    name: string;
    username: string;
    avatarUrl: string | null;
  }>,
) {
  const resolvedName = overrides?.name?.trim() || initialUser.name;
  const defaultUsername = initialUser.email.split("@")[0] || "lingxi-user";
  const resolvedUsername = overrides?.username?.trim() || defaultUsername;

  return {
    ...initialUser,
    name: resolvedName,
    initials: getUserInitials(resolvedName),
    username: resolvedUsername,
    avatarUrl: overrides?.avatarUrl ?? null,
  };
}

function DashboardSidebarLink({
  item,
  prominent = false,
  collapsed = false,
}: {
  item: DashboardNavItem;
  prominent?: boolean;
  collapsed?: boolean;
}) {
  const Icon = item.icon;
  const resolvedPath = useResolvedPath(item.href);
  const isActive = Boolean(
    useMatch({
      path: resolvedPath.pathname,
      end: true,
    }),
  );
  const linkClassName = cn(
    "group relative flex items-center transition-colors duration-150",
    collapsed
      ? "min-h-[40px] w-full justify-center rounded-[11px] px-0 py-2"
      : "mx-4 min-h-[34px] rounded-[8px] px-2 py-1.5 gap-2.5 text-[14px] leading-[22px]",
    isActive
      ? "glass-sidebar-link-active text-[rgba(38,36,76,0.88)] dark:text-slate-50"
      : prominent
        ? "text-[rgba(38,36,76,0.88)] hover:bg-white/38 hover:text-[rgba(38,36,76,0.88)] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100"
        : "text-[rgba(38,36,76,0.88)] hover:bg-white/34 hover:text-[rgba(38,36,76,0.88)] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100",
  );
  const linkContent = (
    <>
      <Icon
        className={cn(
          "size-[15px] shrink-0",
          isActive
            ? "text-slate-900 dark:text-slate-100"
            : "text-slate-500 dark:text-slate-400",
        )}
        strokeWidth={2}
      />
      {collapsed ? (
        <span className="sr-only">{item.label}</span>
      ) : (
        <span
          className={cn(
            "truncate",
            isActive
              ? "font-medium text-[rgba(38,36,76,0.88)] dark:text-slate-50"
              : "font-normal text-[rgba(38,36,76,0.88)] dark:text-slate-300",
          )}
        >
          {item.label}
        </span>
      )}
    </>
  );

  if (collapsed) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger
          delay={0}
          closeDelay={0}
          render={
            <NavLink
              to={item.href}
              aria-label={item.label}
              className={linkClassName}
            />
          }
        >
          {linkContent}
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Positioner side="right" align="center" sideOffset={10}>
            <Tooltip.Popup className="pointer-events-none relative z-[90] max-w-[180px] whitespace-nowrap rounded-[10px] border border-white/10 bg-[#111827] px-3 py-2 text-[14px] leading-5 font-medium text-white shadow-[0_12px_28px_rgba(2,6,23,0.34)] outline-none transition-[opacity,transform] duration-150 data-[starting-style]:translate-x-1 data-[starting-style]:opacity-0 data-[ending-style]:translate-x-1 data-[ending-style]:opacity-0">
              <Tooltip.Arrow className="absolute top-1/2 -left-[5px] size-[10px] -translate-y-1/2 rotate-45 rounded-[2px] border-l border-t border-white/10 bg-[#111827]" />
              {item.label}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return (
    <NavLink to={item.href} className={linkClassName}>
      {linkContent}
    </NavLink>
  );
}

export function DashboardViewPage(_props: { viewKey: string }) {
  return null;
}
