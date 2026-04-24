import type {
  ForwardRefExoticComponent,
  HTMLAttributes,
  RefAttributes,
} from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { ChartColumnIncreasingIcon } from "@/components/ui/chart-column-increasing";
import { DatabaseBackupIcon } from "@/components/ui/database-backup";
import { FilePenLineIcon } from "@/components/ui/file-pen-line";
import { HomeIcon } from "@/components/ui/home";
import { ScanTextIcon } from "@/components/ui/scan-text";
import { SendIcon } from "@/components/ui/send";
import { UsersIcon } from "@/components/ui/users";

export interface DashboardIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type DashboardIcon = ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & {
  size?: number;
  } & RefAttributes<DashboardIconHandle>
>;

export type DashboardViewKey =
  | "home-dashboard"
  | "xhs-account-management"
  | "multi-account-analysis"
  | "competitor-analysis"
  | "viral-learning-article-generation"
  | "article-publishing-center"
  | "account-overview"
  | "knowledge-base-management";

export interface DashboardNavItem {
  key: DashboardViewKey;
  label: string;
  description: string;
  href: string;
  icon: DashboardIcon;
}

export interface DashboardNavGroup {
  title: string;
  items: DashboardNavItem[];
}

export const defaultDashboardViewKey: DashboardViewKey = "home-dashboard";
export const dashboardUtilityGroupTitle = "";

export const dashboardPrimaryItem: DashboardNavItem = {
  key: "home-dashboard",
  label: "首页看板",
  description: "查看平台关键经营数据、重点任务和核心运营总览。",
  href: "/dashboard/home-dashboard",
  icon: HomeIcon,
};

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    title: "账号运营",
    items: [
      dashboardPrimaryItem,
      {
        key: "xhs-account-management",
        label: "小红书账号管理",
        description: "接入、登录和管理工作区内的小红书业务账号。",
        href: "/dashboard/xhs-account-management",
        icon: UsersIcon,
      },
      {
        key: "multi-account-analysis",
        label: "多账号管理分析",
        description: "统一查看多账号运营表现、分组情况和协同管理状态。",
        href: "/dashboard/multi-account-analysis",
        icon: UsersIcon,
      },
      {
        key: "account-overview",
        label: "账号综合分析",
        description: "查看账号整体表现、内容结构和增长趋势。",
        href: "/dashboard/account-overview",
        icon: ChartColumnIncreasingIcon,
      },
    ],
  },
  {
    title: "内容创作",
    items: [
      {
        key: "viral-learning-article-generation",
        label: "爆文生成",
        description: "基于爆款数据拆解选题，并辅助生成文章内容。",
        href: "/dashboard/viral-learning-article-generation",
        icon: FilePenLineIcon,
      },
      {
        key: "knowledge-base-management",
        label: "知识库管理",
        description: "管理知识资产、资料沉淀和内容素材库。",
        href: "/dashboard/knowledge-base-management",
        icon: DatabaseBackupIcon,
      },
      {
        key: "article-publishing-center",
        label: "文章发布",
        description: "集中管理文章发布、分发节奏和发布结果。",
        href: "/dashboard/article-publishing-center",
        icon: SendIcon,
      },
    ],
  },
  {
    title: "数据洞察",
    items: [
      {
        key: "competitor-analysis",
        label: "竞品与内容自检",
        description: "分析竞品内容策略，并对当前内容进行自检评估。",
        href: "/dashboard/competitor-analysis",
        icon: ScanTextIcon,
      },
    ],
  },
];

export const dashboardUtilityItems: DashboardNavItem[] = [];

export const dashboardNavItems = [
  dashboardPrimaryItem,
  ...dashboardNavGroups.flatMap((group) => group.items),
  ...dashboardUtilityItems,
];

export function isDashboardViewKey(
  value: string | undefined,
): value is DashboardViewKey {
  return dashboardNavItems.some((item) => item.key === value);
}

export function getDashboardViewItem(
  key: DashboardViewKey = defaultDashboardViewKey,
) {
  return dashboardNavItems.find((item) => item.key === key) ?? dashboardPrimaryItem;
}

export function getDashboardViewGroupTitle(key: DashboardViewKey) {
  if (dashboardPrimaryItem.key === key) {
    return dashboardPrimaryItem.label;
  }

  if (dashboardUtilityItems.some((item) => item.key === key)) {
    return dashboardUtilityGroupTitle;
  }

  return (
    dashboardNavGroups.find((group) =>
      group.items.some((item) => item.key === key),
    )?.title ?? dashboardPrimaryItem.label
  );
}

export const dashboardTopTabs = [
  { label: "首页看板", href: "/dashboard/home-dashboard" },
  { label: "多账号管理分析", href: "/dashboard/multi-account-analysis" },
  { label: "账号综合分析", href: "/dashboard/account-overview" },
] as const;

export const dashboardSidebarChrome = {
  collapseLabel: "收起菜单",
  expandLabel: "展开菜单",
  collapseIcon: PanelLeftClose,
  expandIcon: PanelLeftOpen,
  systemIcon: DatabaseBackupIcon,
};
