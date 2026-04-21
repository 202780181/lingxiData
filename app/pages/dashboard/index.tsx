import * as React from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigation } from "react-router";

import { cn } from "@/lib/utils";
import {
  dashboardNavGroups,
  dashboardPrimaryItem,
  dashboardSidebarChrome,
  dashboardTopTabs,
  dashboardUtilityItems,
  defaultDashboardViewKey,
  getDashboardViewGroupTitle,
  getDashboardViewItem,
  isDashboardViewKey,
  type DashboardNavItem,
} from "./config";

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
    role: string;
  };
}

const dashboardPageData: DashboardPageData = {
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
  user: {
    name: "Aaron",
    role: "系统管理员",
  },
};

export async function loadDashboardPageData() {
  return dashboardPageData;
}

export function getDashboardMeta(data?: DashboardPageData) {
  const title = data?.seo.title ?? dashboardPageData.seo.title;
  const description =
    data?.seo.description ?? dashboardPageData.seo.description;

  return [
    { title },
    { name: "description", content: description },
  ];
}

export function DashboardLayout({ data }: { data: DashboardPageData }) {
  const location = useLocation();
  const navigation = useNavigation();
  const contentScrollRef = React.useRef<HTMLDivElement>(null);

  const activeView = React.useMemo(() => {
    const [, dashboardSegment, viewSegment] = location.pathname.split("/");

    if (dashboardSegment !== "dashboard") {
      return defaultDashboardViewKey;
    }

    return isDashboardViewKey(viewSegment)
      ? viewSegment
      : defaultDashboardViewKey;
  }, [location.pathname]);

  const activeItem = getDashboardViewItem(activeView);
  const activeGroupTitle = getDashboardViewGroupTitle(activeView);
  const isSwitching = navigation.state !== "idle";
  const SidebarActionIcon = dashboardSidebarChrome.collapseIcon;

  React.useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <main className="glass-layout-bg h-svh overflow-hidden text-slate-950">
      <div className="flex h-full flex-col gap-3 px-3 pb-3 pt-0 lg:gap-3 lg:px-4 lg:pb-4 lg:pt-0">
        <header className="glass-topbar -mx-3 flex shrink-0 flex-col gap-3 rounded-none px-4 py-2 lg:-mx-4 lg:h-[64px] lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                title="展开菜单"
                className="grid size-9 shrink-0 place-items-center rounded-[11px] text-slate-500 transition-colors hover:bg-white/38 hover:text-slate-900"
              >
                <Menu className="size-4.5" strokeWidth={2.1} />
              </button>

              <div className="flex min-w-0 items-center gap-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-[11px] bg-[linear-gradient(135deg,#586dff_0%,#22c3ff_48%,#2dd4bf_100%)] shadow-[0_12px_26px_rgba(71,114,255,0.24)]">
                  <div className="flex items-end gap-[2px]">
                    <span className="h-3 w-1.5 rounded-full bg-white/92" />
                    <span className="h-4.5 w-1.5 rounded-full bg-white/78" />
                    <span className="h-3.5 w-1.5 rounded-full bg-white/62" />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
                    灵犀数据
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-slate-200/70 lg:block" />

            <nav className="hidden items-center gap-5 xl:flex">
              {dashboardTopTabs.map((tab) => (
                <NavLink
                  key={tab.label}
                  to={tab.href}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium transition-colors",
                      isActive
                        ? "text-slate-950"
                        : "text-slate-500 hover:text-slate-900",
                    )
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden h-8 w-px bg-slate-200/70 xl:block" />

            <div className="glass-chip hidden min-w-0 flex-1 items-center gap-3 rounded-[12px] border-white/55 px-3.5 py-2 text-slate-500 lg:flex">
              <Search className="size-4 shrink-0 text-slate-400" strokeWidth={2} />
              <span className="truncate text-sm text-slate-500">
                搜索模型、任务、空间与文档
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm lg:ml-6 lg:flex-nowrap">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-slate-400">{activeGroupTitle}</span>
              <ChevronRight className="size-3.5 text-slate-300" strokeWidth={2.2} />
              <span className="font-semibold text-slate-900">{activeItem.label}</span>
              {isSwitching ? (
                <span className="rounded-full bg-sky-100/80 px-2 py-0.5 text-[0.68rem] font-semibold text-sky-700">
                  切换中
                </span>
              ) : null}
            </div>

            <div className="hidden h-6 w-px bg-slate-200/70 lg:block" />

            <div className="glass-chip flex items-center gap-1.5 rounded-[10px] border-white/50 px-3 py-1.5 text-slate-600">
              <span>{data.workspace.region}</span>
              <ChevronDown className="size-3.5 text-slate-400" strokeWidth={2.2} />
            </div>

            <div className="glass-chip flex items-center gap-1.5 rounded-[10px] border-white/50 px-3 py-1.5 text-slate-600">
              <span>{data.workspace.space}</span>
              <ChevronDown className="size-3.5 text-slate-400" strokeWidth={2.2} />
            </div>

            <button
              type="button"
              className="glass-chip grid size-8 place-items-center rounded-[10px] text-slate-500 transition-colors hover:text-slate-900"
            >
              <BookOpen className="size-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              className="glass-chip grid size-8 place-items-center rounded-[10px] text-slate-500 transition-colors hover:text-slate-900"
            >
              <Bell className="size-4" strokeWidth={2} />
            </button>

            <div className="flex items-center gap-3 lg:border-l lg:border-white/35 lg:pl-4">
              <div className="grid size-8 place-items-center rounded-full bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white">
                <UserRound className="size-4" strokeWidth={2} />
              </div>
              <div className="pr-1">
                <p className="text-sm font-semibold text-slate-900">{data.user.name}</p>
                <p className="text-[0.72rem] text-slate-500">{data.user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-[228px]">
            <div className="glass-sidebar flex h-full flex-col overflow-hidden rounded-[12px] border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(244,248,255,0.54))] shadow-[0_22px_56px_rgba(135,151,181,0.16)]">
              <div className="sidebar-scroll-area min-h-0 flex-1 overflow-y-auto">
                <div className="pb-4 pt-2">
                  <DashboardSidebarLink item={dashboardPrimaryItem} prominent />

                  {dashboardNavGroups.map((group) => (
                    <section key={group.title} className="pt-4 first:pt-3">
                      <p className="px-5 pb-1.5 text-[11.5px] leading-5 font-medium tracking-[0.01em] text-slate-400/95">
                        {group.title}
                      </p>

                      <div>
                        {group.items.map((item) => (
                          <DashboardSidebarLink key={item.key} item={item} />
                        ))}
                      </div>
                    </section>
                  ))}

                  <div className="mx-4 mt-3 border-t border-white/40 pt-2">
                    {dashboardUtilityItems.map((item) => (
                      <DashboardSidebarLink key={item.key} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/45 px-4 py-2.5">
                <button
                  type="button"
                  title={dashboardSidebarChrome.collapseLabel}
                  className="glass-chip grid size-8 place-items-center rounded-[10px] text-slate-600 transition-transform hover:-translate-y-0.5 hover:text-slate-900"
                >
                  <SidebarActionIcon className="size-[16px]" strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </aside>

          <section className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="glass-panel-strong shadow-none flex h-full min-h-0 flex-col overflow-hidden rounded-[12px]">
              <div
                ref={contentScrollRef}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.5)_transparent] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/60"
              >
                <Outlet />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DashboardSidebarLink({
  item,
  prominent = false,
}: {
  item: DashboardNavItem;
  prominent?: boolean;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          "group relative mx-2.5 flex min-h-[42px] items-center gap-3 rounded-[9px] px-4 py-2.5 text-[14px] leading-[22px] transition-all duration-150",
          isActive
            ? "glass-sidebar-link-active text-slate-900"
            : prominent
              ? "hover:bg-white/36 hover:text-slate-900"
              : "hover:bg-white/30 hover:text-slate-900",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "size-[16px] shrink-0 transition-colors",
              isActive ? "text-slate-700" : "text-slate-500",
            )}
            strokeWidth={1.95}
          />
          <span
            className={cn(
              "truncate tracking-tight",
              isActive ? "font-medium text-slate-900" : "font-normal text-slate-600",
            )}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function DashboardViewPage(_props: { viewKey: string }) {
  return null;
}
