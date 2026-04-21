import * as React from "react";
import {
  Bell,
  BookOpen,
  Search,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";

import { cn } from "@/lib/utils";
import {
  dashboardNavGroups,
  dashboardPrimaryItem,
  dashboardSidebarChrome,
  dashboardUtilityItems,
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
  const contentScrollRef = React.useRef<HTMLDivElement>(null);
  const SidebarActionIcon = dashboardSidebarChrome.collapseIcon;

  React.useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <main className="glass-layout-bg h-svh overflow-hidden text-slate-950">
      <div className="flex h-full flex-col gap-3 px-3 pb-3 pt-0 lg:gap-3 lg:px-4 lg:pb-4 lg:pt-0">
        <header className="glass-topbar -mx-3 flex shrink-0 flex-col gap-3 rounded-none px-4 py-2 lg:-mx-4 lg:h-[64px] lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex min-w-0 items-center gap-2.5 pr-1">
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

            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="glass-search-field hidden h-[42px] min-w-[320px] max-w-[620px] flex-1 items-center gap-2 rounded-[12px] px-3 py-1 text-left lg:flex"
            >
              <div className="grid size-6.5 shrink-0 place-items-center rounded-[8px] bg-white/72 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
                <Search className="size-3.5" strokeWidth={2} />
              </div>

              <input
                type="search"
                aria-label="搜索达人、视频或品牌"
                placeholder="搜索达人、视频或品牌"
                className="glass-search-input min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-500"
              />

              <div className="glass-chip pointer-events-none hidden items-center gap-1 rounded-[7px] border-white/55 px-1.5 py-0.5 text-[10px] font-medium tracking-[0.02em] text-slate-400 xl:flex">
                <span>Ctrl</span>
                <span className="text-slate-300">+</span>
                <span>K</span>
              </div>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm lg:ml-6 lg:flex-nowrap">
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
