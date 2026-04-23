import type { ComponentType } from "react";
import {
  AudioLines,
  Bell,
  Boxes,
  Camera,
  ChartNoAxesColumnIncreasing,
  Clapperboard,
  Compass,
  Database,
  KeyRound,
  MonitorPlay,
  PanelsTopLeft,
  Radar,
  ShieldCheck,
  SlidersVertical,
  Type,
  Waypoints,
} from "lucide-react";

type DashboardIcon = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export type DashboardViewKey =
  | "model-plaza"
  | "text-model"
  | "voice-model"
  | "vision-model"
  | "multimodal-model"
  | "data-management"
  | "model-tuning"
  | "my-models"
  | "model-evaluation"
  | "model-usage"
  | "batch-inference"
  | "model-deployment"
  | "model-monitoring"
  | "model-alerts"
  | "quota-management"
  | "access-management"
  | "api-key";

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

export const defaultDashboardViewKey: DashboardViewKey = "model-plaza";
export const dashboardUtilityGroupTitle = "系统设置";

export const dashboardPrimaryItem: DashboardNavItem = {
  key: "model-plaza",
  label: "模型广场",
  description: "精选模型、能力入口与官方推荐模型市场。",
  href: "/dashboard/model-plaza",
  icon: Waypoints,
};

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    title: "模型体验",
    items: [
      {
        key: "text-model",
        label: "文本模型",
        description: "文本生成、问答、摘要与脚本创作。",
        href: "/dashboard/text-model",
        icon: Type,
      },
      {
        key: "voice-model",
        label: "语音模型",
        description: "语音识别、合成与多轮语音交互。",
        href: "/dashboard/voice-model",
        icon: AudioLines,
      },
      {
        key: "vision-model",
        label: "视觉模型",
        description: "图像识别、检测与视觉理解。",
        href: "/dashboard/vision-model",
        icon: Camera,
      },
      {
        key: "multimodal-model",
        label: "全模态模型",
        description: "文本、图像、视频的联合建模能力。",
        href: "/dashboard/multimodal-model",
        icon: Clapperboard,
      },
    ],
  },
  {
    title: "模型训练",
    items: [
      {
        key: "data-management",
        label: "数据管理",
        description: "数据集、标签、同步链路与资产治理。",
        href: "/dashboard/data-management",
        icon: Database,
      },
      {
        key: "model-tuning",
        label: "模型调优",
        description: "参数调优、实验记录与效果优化。",
        href: "/dashboard/model-tuning",
        icon: SlidersVertical,
      },
      {
        key: "my-models",
        label: "我的模型",
        description: "自定义模型、版本、发布与部署记录。",
        href: "/dashboard/my-models",
        icon: Boxes,
      },
      {
        key: "model-evaluation",
        label: "模型评测",
        description: "基准测试、效果对比与质量评分。",
        href: "/dashboard/model-evaluation",
        icon: Compass,
      },
    ],
  },
  {
    title: "工作台",
    items: [
      {
        key: "model-usage",
        label: "模型用量",
        description: "查看模型调用趋势、额度消耗与成本分布。",
        href: "/dashboard/model-usage",
        icon: ChartNoAxesColumnIncreasing,
      },
      {
        key: "batch-inference",
        label: "批量推理",
        description: "围绕大批量任务提交、结果回收与重试管理。",
        href: "/dashboard/batch-inference",
        icon: Boxes,
      },
      {
        key: "model-deployment",
        label: "模型部署",
        description: "管理模型上线、环境切换与部署策略。",
        href: "/dashboard/model-deployment",
        icon: MonitorPlay,
      },
      {
        key: "model-monitoring",
        label: "模型监控",
        description: "跟踪可用性、延迟、吞吐与质量波动。",
        href: "/dashboard/model-monitoring",
        icon: Radar,
      },
      {
        key: "model-alerts",
        label: "模型告警",
        description: "查看告警规则、升级链路与历史异常记录。",
        href: "/dashboard/model-alerts",
        icon: Bell,
      },
      {
        key: "quota-management",
        label: "限流提额",
        description: "管理速率限制、配额申请与容量策略。",
        href: "/dashboard/quota-management",
        icon: SlidersVertical,
      },
    ],
  },
];

export const dashboardUtilityItems: DashboardNavItem[] = [
  {
    key: "access-management",
    label: "权限管理",
    description: "成员、角色、空间与访问边界管理。",
    href: "/dashboard/access-management",
    icon: ShieldCheck,
  },
  {
    key: "api-key",
    label: "API Key",
    description: "密钥创建、轮换与调用控制。",
    href: "/dashboard/api-key",
    icon: KeyRound,
  },
];

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
  { label: "模型服务", href: "/dashboard/model-plaza" },
  { label: "训练空间", href: "/dashboard/data-management" },
  { label: "工作台", href: "/dashboard/access-management" },
] as const;

export const dashboardSidebarChrome = {
  collapseLabel: "收起菜单",
  expandLabel: "展开菜单",
  collapseIcon: PanelsTopLeft,
  systemIcon: Database,
};
