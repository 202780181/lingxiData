import * as React from "react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronRight,
  Clock3,
  FolderKanban,
  LogOut,
  Puzzle,
  Rocket,
  UserRound,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

import {
  MotionTabsMenu,
  type MotionTabsMenuItem,
} from "@/components/unlumen-ui/motion-tabs-menu";
import { BlobCardPreview } from "@/components/unlumen-ui/blob-card-preview";
import { cn } from "@/lib/utils";

export interface DashboardPageData {
  seo: {
    title: string;
    description: string;
  };
}

type DashboardTabKey =
  | "focus"
  | "progression"
  | "ideas"
  | "activity"
  | "profile";

interface IdeaItem {
  title: string;
  description: string;
  tag: string;
}

interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  dotClassName: string;
}

interface ProfileItem {
  label: string;
  icon: typeof UserRound;
  toneClassName?: string;
}

const dashboardPageData: DashboardPageData = {
  seo: {
    title: "灵犀工作台 - Motion Tabs Menu Refinement",
    description: "基于参考截图优化后的 Motion Tabs Menu 仪表盘演示。",
  },
};

const weekBars = [
  { day: "M", value: 112, className: "bg-neutral-800" },
  { day: "T", value: 92, className: "bg-neutral-800" },
  { day: "W", value: 66, className: "bg-neutral-800" },
  { day: "T", value: 120, className: "bg-neutral-800" },
  { day: "F", value: 44, className: "bg-neutral-800" },
  { day: "S", value: 18, className: "bg-neutral-800" },
  { day: "S", value: 4, className: "bg-neutral-200" },
] as const;

const ideaItems: IdeaItem[] = [
  {
    title: "Adaptive color themes",
    description:
      "Generate palettes from a single brand seed and keep contrast rules intact.",
    tag: "Design",
  },
  {
    title: "Micro-interaction library",
    description:
      "Reusable spring animations for buttons, drawers, chips, and status states.",
    tag: "Dev",
  },
  {
    title: "AI component naming",
    description:
      "Use LLM suggestions to surface semantic names before publishing to the registry.",
    tag: "AI",
  },
  {
    title: "Dark mode token audit",
    description:
      "Review all CSS vars for contrast drift and inconsistent neutral ramps.",
    tag: "Design",
  },
];

const activityItems: ActivityItem[] = [
  {
    id: "1",
    actor: "Sarah",
    action: "commented on",
    target: "Design system audit",
    time: "3m ago",
    dotClassName: "bg-violet-500",
  },
  {
    id: "2",
    actor: "Alex",
    action: "merged",
    target: "feat/motion-tabs-menu",
    time: "18m ago",
    dotClassName: "bg-emerald-500",
  },
  {
    id: "3",
    actor: "You",
    action: "created",
    target: "Registry search idea",
    time: "1h ago",
    dotClassName: "bg-sky-500",
  },
  {
    id: "4",
    actor: "Marc",
    action: "reviewed",
    target: "Component usage heatmap",
    time: "2h ago",
    dotClassName: "bg-orange-500",
  },
  {
    id: "5",
    actor: "Sarah",
    action: "closed",
    target: "Dark mode token audit",
    time: "3h ago",
    dotClassName: "bg-pink-500",
  },
];

const profileItems: ProfileItem[] = [
  { label: "Profile", icon: UserRound },
  { label: "Upgrade", icon: Rocket },
  { label: "Projects", icon: FolderKanban },
  { label: "Documentation", icon: BookOpen },
  { label: "Logout", icon: LogOut, toneClassName: "text-red-500" },
] as const;

const scrollAreaClassName =
  "overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(229,229,229,1)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-200";

function FocusPanel() {
  return (
    <div className="space-y-4 px-0.5 pt-0.5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-3.5 rounded-full bg-[linear-gradient(135deg,#ff97a9_0%,#ff7e95_100%)] shadow-[0_0_0_3px_rgba(255,144,168,0.16)]" />
        <span className="text-[0.84rem] font-semibold text-neutral-500">
          Current task
        </span>
      </div>

      <div className="space-y-4">
        <h2 className="max-w-[13ch] text-[1.35rem] font-semibold leading-[0.98] tracking-[-0.05em] text-neutral-800">
          Design system audit
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#f3f3f1]">
            <motion.div
              initial={{ scaleX: 0.48 }}
              animate={{ scaleX: 1 }}
              transition={{
                type: "spring",
                stiffness: 215,
                damping: 24,
                mass: 0.9,
              }}
              className="absolute inset-y-0 left-0 w-[65%] origin-left rounded-full bg-neutral-800"
            />
          </div>

          <div className="rounded-full bg-[#f3f3f1] px-3 py-1 text-[0.9rem] font-semibold text-neutral-500">
            65%
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-neutral-500">
          <Clock3 className="size-4 stroke-[1.8]" />
          <span className="text-[0.92rem] font-medium">2h 15m</span>
        </div>
      </div>
    </div>
  );
}

function ProgressionPanel() {
  return (
    <div className="space-y-5 px-0.5 pt-0.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.84rem] font-semibold text-neutral-500">
          This week
        </h2>
        <span className="text-[0.84rem] font-semibold text-emerald-500">
          12/15 tasks
        </span>
      </div>

      <div className="flex items-end justify-between gap-1 px-0.5">
        {weekBars.map((bar) => (
          <div key={bar.day} className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ scaleY: 0.35, opacity: 0.7 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 215,
                damping: 24,
                mass: 0.9,
              }}
              className={cn("w-[1.8rem] origin-bottom rounded-[0.7rem]", bar.className)}
              style={{ height: `${Math.max(6, Math.round(bar.value * 0.42))}px` }}
            />
            <span className="text-[0.72rem] font-medium text-neutral-500">
              {bar.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdeasPanel() {
  return (
    <div className={cn("max-h-[12rem]", scrollAreaClassName)}>
      <div className="space-y-4">
        {ideaItems.map((item) => (
          <div
            key={item.title}
            className="flex items-start justify-between gap-3"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="truncate text-[0.88rem] font-semibold tracking-tight text-neutral-800">
                {item.title}
              </h2>
              <p className="truncate text-[0.76rem] text-neutral-500">
                {item.description}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[#f3f3f1] px-2 py-1 text-[0.68rem] font-semibold text-neutral-700">
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div className={cn("max-h-[12rem]", scrollAreaClassName)}>
      <div className="space-y-4">
        {activityItems.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-start gap-2.5"
          >
            <div className="flex h-full flex-col items-center">
              <span className={cn("mt-1 size-2.5 rounded-full", item.dotClassName)} />
              {index < activityItems.length - 1 ? (
                <span className="mt-2 w-px flex-1 bg-neutral-200" />
              ) : null}
            </div>

            <div className="min-w-0">
              <p className="text-[0.82rem] leading-[1.42] text-neutral-800">
                <span className="font-semibold">{item.actor}</span>{" "}
                <span className="font-medium text-neutral-500">{item.action}</span>
                <br />
                <span className="font-semibold">{item.target}</span>
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[#f3f3f1] px-2 py-1 text-[0.68rem] font-medium text-neutral-500">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="space-y-1">
      {profileItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center justify-between rounded-[0.95rem] px-2 py-2 text-left transition-colors hover:bg-black/[0.03]"
          >
            <span className="flex items-center gap-2.5">
              <Icon
                className={cn(
                  "size-3.5 text-neutral-500",
                  item.toneClassName ?? "text-neutral-500",
                )}
                strokeWidth={1.8}
              />
              <span
                className={cn(
                  "text-[0.82rem] font-semibold tracking-tight text-neutral-800",
                  item.toneClassName,
                )}
              >
                {item.label}
              </span>
            </span>

            <ChevronRight
              className={cn(
                "size-3.5 text-neutral-500",
                item.toneClassName ?? "text-neutral-500",
              )}
              strokeWidth={2}
            />
          </button>
        );
      })}
    </div>
  );
}

const dashboardTabs: MotionTabsMenuItem[] = [
  {
    key: "focus" satisfies DashboardTabKey,
    label: "Focus",
    icon: <Zap className="size-[0.95rem]" strokeWidth={2.15} />,
    children: <FocusPanel />,
  },
  {
    key: "progression" satisfies DashboardTabKey,
    label: "Progression",
    icon: <ArrowUpRight className="size-[0.95rem]" strokeWidth={2.15} />,
    children: <ProgressionPanel />,
  },
  {
    key: "ideas" satisfies DashboardTabKey,
    label: "Ideas",
    icon: <Puzzle className="size-[0.95rem]" strokeWidth={2.15} />,
    children: <IdeasPanel />,
  },
  {
    key: "activity" satisfies DashboardTabKey,
    label: "Activity",
    icon: <Bell className="size-[0.95rem]" strokeWidth={2.15} />,
    children: <ActivityPanel />,
  },
  {
    key: "profile" satisfies DashboardTabKey,
    label: "Profile",
    icon: <UserRound className="size-[0.95rem]" strokeWidth={2.15} />,
    children: <ProfilePanel />,
  },
];

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

export function DashboardPage(_props: { data: DashboardPageData }) {
  return (
    <main className="min-h-svh bg-[#f4f4f2] px-4 py-10 text-neutral-900 md:px-8 md:py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12">
        <MotionTabsMenu
          items={dashboardTabs}
          collapsedWidth={212}
          expandedWidth={288}
          frameHeight={240}
        />
        <BlobCardPreview />
      </div>
    </main>
  );
}
