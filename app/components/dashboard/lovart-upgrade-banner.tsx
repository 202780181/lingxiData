import * as React from "react";
import {
  Check,
  ChevronDown,
  Info,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "annually";

interface CountdownDigits {
  days: string[];
  hours: string[];
  minutes: string[];
  seconds: string[];
}

interface PricingFeature {
  label: string;
  detail?: string;
  badge?: string;
}

interface PricingPlan {
  id: "starter" | "basic" | "pro" | "ultimate";
  name: string;
  discount: string;
  highlighted?: boolean;
  ribbon?: string;
  monthly: {
    price: string;
    description: string;
  };
  annually: {
    price: string;
    originalPrice: string;
    description: string;
    savings: string;
  };
  features: PricingFeature[];
}

interface LovartFaq {
  question: string;
  answer: string[];
}

type ModelCategory = "image" | "video";

interface GenerationOverviewRow {
  name: string;
  usageCost: number;
  usageLabel: string;
  unit: "张" | "个";
  detail?: string;
}

const PROMO_COUNTDOWN_MS = (((20 * 60) + 12) * 60 + 7) * 1000;

const billingOptions: Array<{
  value: BillingCycle;
  label: string;
  helper?: string;
}> = [
  { value: "monthly", label: "月付" },
  { value: "annually", label: "年付", helper: "最高享 55 折" },
];

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    discount: "16% Off",
    monthly: {
      price: "19",
      description: "按月计费",
    },
    annually: {
      price: "16",
      originalPrice: "19",
      description: "按年计费, $192/年",
      savings: "相比月付省下 $36",
    },
    features: [
      { label: "每月 2,000 积分", detail: "用于快速生成" },
      { label: "每日获得 100 刷新积分" },
      { label: "2 个并发任务" },
      { label: "5 个品牌套件" },
      { label: "0.5倍 动态算力特权" },
      { label: "访问所有图片模型" },
      { label: "访问所有视频模型" },
      { label: "访问所有编辑功能" },
      { label: "可商用" },
      { label: "标准充值价格" },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    discount: "16% Off",
    monthly: {
      price: "32",
      description: "按月计费",
    },
    annually: {
      price: "27",
      originalPrice: "32",
      description: "按年计费, $324/年",
      savings: "相比月付省下 $60",
    },
    features: [
      { label: "每月 3,500 积分", detail: "用于快速生成" },
      { label: "GPT-image 2：7天0积分快速生成", badge: "限时" },
      { label: "每日获得 100 刷新积分" },
      { label: "4 个并发任务" },
      { label: "10 个品牌套件" },
      { label: "0.5倍 动态算力特权" },
      { label: "访问所有图片模型" },
      { label: "访问所有视频模型" },
      { label: "访问所有编辑功能" },
      { label: "可商用" },
      { label: "标准充值价格" },
      {
        label: "无限低速生成（精选模型）",
        detail: "包含 GPT Image 2（Low 1k，文生图）、Nano Banana Pro & 2（1k）",
      },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    discount: "44% Off",
    highlighted: true,
    ribbon: "最受欢迎",
    monthly: {
      price: "90",
      description: "按月计费",
    },
    annually: {
      price: "50",
      originalPrice: "90",
      description: "按年计费, 首年 $600, 次年续费 $888",
      savings: "相比月付省下 $480",
    },
    features: [
      { label: "每月 11,000 积分", detail: "用于快速生成" },
      { label: "GPT-image 2：7天0积分快速生成", badge: "限时" },
      { label: "每日获得 100 刷新积分" },
      { label: "8 个并发任务" },
      { label: "30 个品牌套件" },
      { label: "0.5倍 动态算力特权" },
      { label: "访问所有图片模型" },
      { label: "访问所有视频模型" },
      { label: "访问所有编辑功能" },
      { label: "可商用" },
      { label: "充值积分享 九折 优惠" },
      {
        label: "无限低速生成（进阶模型支持）",
        detail: "包含 GPT Image 2（Medium 1k，文生图）、Nano Banana Pro & 2（2k）、Kling O1",
      },
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    discount: "45% Off",
    monthly: {
      price: "199",
      description: "按月计费",
    },
    annually: {
      price: "109",
      originalPrice: "199",
      description: "按年计费, 首年 $1,308, 次年续费 $1,992",
      savings: "相比月付省下 $1,080",
    },
    features: [
      { label: "每月 27,000 积分", detail: "用于快速生成" },
      { label: "GPT-image 2：7天0积分快速生成", badge: "限时" },
      { label: "每日获得 100 刷新积分" },
      { label: "10 个并发任务" },
      { label: "100 个品牌套件" },
      { label: "0.5倍 动态算力特权" },
      { label: "访问所有图片模型" },
      { label: "访问所有视频模型" },
      { label: "访问所有编辑功能" },
      { label: "可商用" },
      { label: "充值积分享 九折 优惠" },
      {
        label: "无限低速生成（覆盖最广）",
        detail: "包含 GPT Image 2（Medium 2k，文生图）、Nano Banana Pro & 2（4k）、Kling O1、Seedance 1.5Pro",
      },
    ],
  },
];

const lovartFaqs: LovartFaq[] = [
  {
    question: "积分是如何使用的？",
    answer: [
      "积分用于处理您的请求并生成最终结果，具体消耗取决于您选择的功能以及任务的复杂程度。",
      "在基于 Agent 的生成中，积分消耗会根据所选工具或模型以及请求的详细程度而有所不同。对于画布生成，积分消耗由图像尺寸、质量、风格细节以及高级参数共同决定。",
      "总体来说，任务越复杂、设置越高级，所需的积分就越多。",
    ],
  },
  {
    question: "积分会过期吗？",
    answer: [
      "月度套餐积分在当前计费周期内有效，并会在下一个计费日自动重置。未使用的积分不会滚动到下个月。",
      "年度套餐积分按月分配。每月的积分仅在该月周期内有效，并会在下个月周期开始时自动重置。",
      "充值积分永不过期，会一直保留在您的账户中直到使用完毕。",
    ],
  },
  {
    question: "我可以购买额外的积分吗？",
    answer: [
      "如果您需要更多积分，可以升级套餐以提高每月积分上限，或单独购买积分包，在不更改当前订阅的情况下生成更多内容。购买的积分会立即到账，并可在所有支持的模型中使用。",
    ],
  },
  {
    question: "我的订阅会自动续费吗？",
    answer: [
      "会的。您的订阅会在每个计费周期结束时自动续费，以确保可以持续使用相关功能。您可以随时在账户设置中取消订阅，当前套餐仍会一直有效至本计费周期结束。",
    ],
  },
  {
    question: "365 无限生成活动是如何运作的？",
    answer: [
      "365 无限生成为您提供一年内在套餐模型上的无限次生成。只要订阅保持有效，就可以持续使用无限生成。",
      "如果您取消或降级订阅，无限访问将在当前套餐到期时结束。升级套餐可以让您在完整的 12 个月内保持访问权限。",
      "重新激活订阅不会延长原始的 365 天期限。作弊或非人工活动可能会触发访问的临时暂停，以确保公平和可靠的使用。",
    ],
  },
  {
    question: "快速生成与无限低速生成如何运作？",
    answer: [
      "快速生成会消耗积分，订阅包含的快速积分会在每个计费周期开始时重置，无法累积至下月。您单独购买的积分包不受计费周期影响。",
      "无限低速生成仅面向特定档位会员提供，允许您在不消耗快速积分的情况下进行无限次生成。此模式下任务会进入排队队列，等待时长取决于系统负载与个人使用频率，不同套餐也有不同的排队优先级。",
    ],
  },
  {
    question: "一个账户可以在多少台设备上使用？",
    answer: [
      "Lovart 账户仅供个人使用。为防止账户共享或资源滥用，任务最多可同时在 2 个桌面网页端和 1 个移动网页端上运行。如需团队或多用户使用，请购买团队版。",
    ],
  },
  {
    question: "我可以升级我的套餐吗？",
    answer: [
      "一旦您拥有有效订阅，就可以随时通过支付差价来升级套餐。如果升级选项不可用，可以先购买更高级别的套餐，然后联系 support@lovart.ai 申请退款。",
    ],
  },
];

const generationPlanCredits: Record<PricingPlan["id"], number> = {
  starter: 2000,
  basic: 3500,
  pro: 11000,
  ultimate: 27000,
};

const generationCategoryOptions: Array<{
  value: ModelCategory;
  label: string;
}> = [
  { value: "image", label: "图片" },
  { value: "video", label: "视频" },
];

const GENERATION_OVERVIEW_PREVIEW_COUNT = 10;

const generationOverviewRows: Record<ModelCategory, GenerationOverviewRow[]> = {
  image: [
    {
      name: "GPT Image 2 1K",
      usageCost: 1,
      usageLabel: "1 积分/张",
      unit: "张",
      detail: "Low · 无参考图",
    },
    {
      name: "GPT Image 2 2K",
      usageCost: 2,
      usageLabel: "2 积分/张",
      unit: "张",
      detail: "Low · 无参考图",
    },
    {
      name: "GPT Image 2 4K",
      usageCost: 3,
      usageLabel: "3 积分/张",
      unit: "张",
      detail: "Low · 无参考图",
    },
    {
      name: "GPT Image 2 1K",
      usageCost: 8,
      usageLabel: "8 积分/张",
      unit: "张",
      detail: "Medium · 无参考图",
    },
    {
      name: "GPT Image 2 2K",
      usageCost: 12,
      usageLabel: "12 积分/张",
      unit: "张",
      detail: "Medium · 无参考图",
    },
    {
      name: "Nano Banana 2 512P",
      usageCost: 5,
      usageLabel: "5 积分/张",
      unit: "张",
    },
    {
      name: "Nano Banana 2 1K",
      usageCost: 8,
      usageLabel: "8 积分/张",
      unit: "张",
    },
    {
      name: "Nano Banana 2 2K",
      usageCost: 12,
      usageLabel: "12 积分/张",
      unit: "张",
    },
    {
      name: "Nano Banana 2 4K",
      usageCost: 18,
      usageLabel: "18 积分/张",
      unit: "张",
    },
    {
      name: "Nano Banana Pro 1K",
      usageCost: 14,
      usageLabel: "14 积分/张",
      unit: "张",
    },
    {
      name: "Nano Banana Pro 2K",
      usageCost: 14,
      usageLabel: "14 积分/张",
      unit: "张",
    },
    {
      name: "Nano Banana Pro 4K",
      usageCost: 24,
      usageLabel: "24 积分/张",
      unit: "张",
    },
    {
      name: "Nano Banana",
      usageCost: 6,
      usageLabel: "6 积分/张",
      unit: "张",
    },
    {
      name: "Seedream 4.0",
      usageCost: 2,
      usageLabel: "2 积分/张",
      unit: "张",
    },
    {
      name: "Seedream 4.5",
      usageCost: 3,
      usageLabel: "3 积分/张",
      unit: "张",
    },
    {
      name: "Seedream 5.0 Lite",
      usageCost: 3,
      usageLabel: "3 积分/张",
      unit: "张",
    },
    {
      name: "GPT Image 1.5",
      usageCost: 4,
      usageLabel: "4 积分/张",
      unit: "张",
      detail: "Medium · 无参考图",
    },
    {
      name: "Flux Kontext",
      usageCost: 12,
      usageLabel: "12 积分/张",
      unit: "张",
    },
    {
      name: "Flux 2 Pro 1K",
      usageCost: 4,
      usageLabel: "4 积分/张",
      unit: "张",
    },
    {
      name: "Flux 2 Max 1K",
      usageCost: 12,
      usageLabel: "12 积分/张",
      unit: "张",
    },
  ],
  video: [
    {
      name: "Seedance 2.0 480p",
      usageCost: 40,
      usageLabel: "40 积分/5s",
      unit: "个",
    },
    {
      name: "Seedance 2.0 720p",
      usageCost: 90,
      usageLabel: "90 积分/5s",
      unit: "个",
    },
    {
      name: "Seedance 2.0 480p",
      usageCost: 25,
      usageLabel: "25 积分/5s",
      unit: "个",
      detail: "含参考视频",
    },
    {
      name: "Seedance 2.0 720p",
      usageCost: 55,
      usageLabel: "55 积分/5s",
      unit: "个",
      detail: "含参考视频",
    },
    {
      name: "Kling 3.0 Omni Pro",
      usageCost: 40,
      usageLabel: "40 积分/5s",
      unit: "个",
    },
    {
      name: "Kling 3.0 Pro",
      usageCost: 60,
      usageLabel: "60 积分/5s",
      unit: "个",
    },
    {
      name: "Kling O1 Pro",
      usageCost: 30,
      usageLabel: "30 积分/5s",
      unit: "个",
      detail: "含参考视频",
    },
    {
      name: "Kling 2.6 Pro",
      usageCost: 36,
      usageLabel: "36 积分/5s",
      unit: "个",
      detail: "含音频",
    },
    {
      name: "Kling 2.5 Turbo Std",
      usageCost: 15,
      usageLabel: "15 积分/5s",
      unit: "个",
    },
    {
      name: "Kling 2.5 Turbo Pro",
      usageCost: 20,
      usageLabel: "20 积分/5s",
      unit: "个",
    },
    {
      name: "Kling 2.1 720p/1080p",
      usageCost: 18,
      usageLabel: "18 积分/5s",
      unit: "个",
    },
    {
      name: "Kling 2.1 Master 1080p",
      usageCost: 50,
      usageLabel: "50 积分/5s",
      unit: "个",
    },
    {
      name: "Seedance 1.5 Pro 480p",
      usageCost: 10,
      usageLabel: "10 积分/5s",
      unit: "个",
      detail: "含音频",
    },
    {
      name: "Seedance 1.5 Pro 720p",
      usageCost: 25,
      usageLabel: "25 积分/5s",
      unit: "个",
      detail: "含音频",
    },
    {
      name: "Sora 2 720p",
      usageCost: 40,
      usageLabel: "40 积分/4s",
      unit: "个",
    },
    {
      name: "Sora 2 Pro 720p",
      usageCost: 116,
      usageLabel: "116 积分/4s",
      unit: "个",
    },
    {
      name: "Sora 2 Pro 1080p",
      usageCost: 192,
      usageLabel: "192 积分/4s",
      unit: "个",
    },
    {
      name: "Veo 3.1 Fast 720p/1080p",
      usageCost: 40,
      usageLabel: "40 积分/4s",
      unit: "个",
    },
    {
      name: "Veo 3.1 720p/1080p",
      usageCost: 104,
      usageLabel: "104 积分/4s",
      unit: "个",
    },
    {
      name: "Veo 3 Fast 720p/1080p",
      usageCost: 40,
      usageLabel: "40 积分/4s",
      unit: "个",
    },
    {
      name: "Veo 3 720p/1080p",
      usageCost: 104,
      usageLabel: "104 积分/4s",
      unit: "个",
    },
    {
      name: "Wan 2.6 480p",
      usageCost: 15,
      usageLabel: "15 积分/5s",
      unit: "个",
    },
    {
      name: "Wan 2.6 720p",
      usageCost: 25,
      usageLabel: "25 积分/5s",
      unit: "个",
    },
    {
      name: "Wan 2.6 1080p",
      usageCost: 35,
      usageLabel: "35 积分/5s",
      unit: "个",
    },
    {
      name: "Vidu Q2 720p",
      usageCost: 20,
      usageLabel: "20 积分/5s",
      unit: "个",
    },
    {
      name: "Vidu Q2 1080p",
      usageCost: 30,
      usageLabel: "30 积分/5s",
      unit: "个",
    },
    {
      name: "Vidu Q1 1080p",
      usageCost: 28,
      usageLabel: "28 积分/5s",
      unit: "个",
    },
    {
      name: "Hailuo 2.3 Fast 768p 6s",
      usageCost: 12,
      usageLabel: "12 积分/6s",
      unit: "个",
    },
    {
      name: "Hailuo 2.3 Fast 1080p 6s",
      usageCost: 18,
      usageLabel: "18 积分/6s",
      unit: "个",
    },
    {
      name: "Hailuo 2.3 768p 6s",
      usageCost: 12,
      usageLabel: "12 积分/6s",
      unit: "个",
    },
    {
      name: "Hailuo 2.3 1080p 6s",
      usageCost: 24,
      usageLabel: "24 积分/6s",
      unit: "个",
    },
    {
      name: "Hailuo 02 768p",
      usageCost: 12,
      usageLabel: "12 积分/6s",
      unit: "个",
    },
    {
      name: "Hailuo 02 1080p",
      usageCost: 20,
      usageLabel: "20 积分/6s",
      unit: "个",
    },
    {
      name: "Seedance Pro 480p",
      usageCost: 10,
      usageLabel: "10 积分/5s",
      unit: "个",
    },
    {
      name: "Seedance 1.0 Pro 720p",
      usageCost: 15,
      usageLabel: "15 积分/5s",
      unit: "个",
    },
    {
      name: "Seedance 1.0 Pro 1080p",
      usageCost: 35,
      usageLabel: "35 积分/5s",
      unit: "个",
    },
  ],
};

export function LovartUpgradeBanner() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdown = usePromoCountdown(PROMO_COUNTDOWN_MS);

  const openDialog = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setIsClosing(false);
    setIsDialogOpen(true);
  }, []);

  const requestClose = React.useCallback(() => {
    setIsClosing(true);

    closeTimerRef.current = setTimeout(() => {
      setIsDialogOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 160);
  }, []);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className="relative z-10 w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-inset"
        onClick={openDialog}
      >
        <PromoRibbon countdown={countdown} clickable />
      </button>

      {isDialogOpen && (
        <LovartUpgradeDialog
          countdown={countdown}
          isClosing={isClosing}
          onClose={requestClose}
        />
      )}
    </>
  );
}

function LovartUpgradeDialog({
  countdown,
  isClosing,
  onClose,
}: {
  countdown: CountdownDigits;
  isClosing: boolean;
  onClose: () => void;
}) {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("annually");
  const [openFaq, setOpenFaq] = React.useState<string | null>(null);
  const [selectedModelCategory, setSelectedModelCategory] = React.useState<ModelCategory>("image");
  const [isGenerationOverviewExpanded, setIsGenerationOverviewExpanded] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  React.useEffect(() => {
    setIsGenerationOverviewExpanded(false);
  }, [selectedModelCategory]);

  return (
    <div
      role="presentation"
      data-state={isClosing ? "closing" : "open"}
      className="lovart-upgrade-overlay fixed inset-0 z-[90] flex items-center justify-center bg-black/42 px-3 py-4 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lovart-upgrade-title"
        data-state={isClosing ? "closing" : "open"}
        className="lovart-upgrade-dialog relative flex max-h-[calc(100svh-32px)] w-[min(calc(100vw-24px),1360px)] flex-col overflow-hidden rounded-[24px] bg-[#f8f8f3] text-[#1b1b1a] shadow-[0_32px_96px_rgba(0,0,0,0.28)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="关闭"
          className="absolute top-4 right-4 z-20 grid size-8 place-items-center rounded-full bg-black/5 text-[#1b1b1a] transition-colors hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-black/25"
          onClick={onClose}
        >
          <X className="size-4" strokeWidth={2} />
        </button>

        <PromoRibbon countdown={countdown} />

        <div className="min-h-0 overflow-y-auto px-5 pb-6 pt-7 md:px-8 md:pb-8 md:pt-9">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-col items-center gap-6">
              <h2
                id="lovart-upgrade-title"
                className="text-center text-[30px] leading-[1.15] font-medium tracking-[-0.03em] text-[#1b1b1a] md:text-[42px]"
              >
                选择你的专属方案
              </h2>

              <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
                <div className="md:flex-1" />

                <div className="inline-flex items-center self-center rounded-full bg-[#efefe8] p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
                  {billingOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "inline-flex h-9 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-normal leading-none transition-all",
                        billingCycle === option.value
                          ? "bg-white text-[#1b1b1a] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                          : "text-[#66665f] hover:text-[#1b1b1a]",
                      )}
                      onClick={() => setBillingCycle(option.value)}
                    >
                      <span>{option.label}</span>
                      {option.helper ? <span className="font-semibold">{option.helper}</span> : null}
                    </button>
                  ))}
                </div>

                <div className="flex md:flex-1 md:justify-end">
                  <button
                    type="button"
                    className="h-10 rounded-full border border-black/10 bg-transparent px-4 text-[14px] font-normal text-[#1b1b1a] transition-colors hover:bg-black/4"
                  >
                    团队版
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {pricingPlans.map((plan) => (
                <PricingPlanCard
                  key={plan.id}
                  billingCycle={billingCycle}
                  plan={plan}
                />
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-[780px]">
              <div className="space-y-0 border-t border-black/8">
                {lovartFaqs.map((faq) => {
                  const isOpen = openFaq === faq.question;

                  return (
                    <div key={faq.question} className="border-b border-black/8">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-6 py-5 text-left"
                        onClick={() =>
                          setOpenFaq((current) =>
                            current === faq.question ? null : faq.question,
                          )
                        }
                      >
                        <span className="text-[16px] leading-[1.4] font-medium text-[#1b1b1a] md:text-[20px]">
                          {faq.question}
                        </span>
                        <span className="grid size-6 shrink-0 place-items-center text-[#6b6b65]">
                          <ChevronDown
                            className={cn(
                              "size-5 transition-transform duration-200",
                              isOpen ? "rotate-180" : "rotate-0",
                            )}
                            strokeWidth={1.9}
                          />
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="pb-5">
                          <div className="space-y-3 text-[14px] leading-[1.7] text-[#5e5e57] md:text-[16px]">
                            {faq.answer.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="pt-5 text-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[14px] font-normal text-[#66665f] transition-colors hover:text-[#1b1b1a]"
                >
                  <Info className="size-3.5" strokeWidth={1.9} />
                  查看更多常见问题
                </button>
              </div>
            </div>

            <GenerationOverviewSection
              billingCycle={billingCycle}
              category={selectedModelCategory}
              expanded={isGenerationOverviewExpanded}
              onCategoryChange={setSelectedModelCategory}
              onExpandedChange={setIsGenerationOverviewExpanded}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PromoRibbon({
  countdown,
  clickable = false,
}: {
  countdown: CountdownDigits;
  clickable?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center bg-[#e3ff74] px-4 py-3 text-black md:min-h-16 md:px-6 md:py-0",
        clickable ? "transition-colors hover:bg-[#ddfb68]" : "border-b border-black/6",
      )}
    >
      <div className="flex flex-col items-center gap-3 md:flex-row md:gap-6">
        <p className="text-center text-[14px] font-medium tracking-[0.01em] md:text-[16px]">
          <span className="mr-1">⚡️</span>
          抢先体验新一代 GPT Image 2 模型
          <span className="mx-2 hidden md:inline">-</span>
          <span className="block md:inline">升级立享 7 天 0 积分快速生成及 365 天无限创作。</span>
        </p>

        <div className="flex items-center gap-1.5">
          <CountdownPair digits={countdown.days} />
          <CountdownDivider />
          <CountdownPair digits={countdown.hours} />
          <CountdownDivider />
          <CountdownPair digits={countdown.minutes} />
          <CountdownDivider />
          <CountdownPair digits={countdown.seconds} />
        </div>

        {clickable ? (
          <span className="inline-flex h-8 items-center rounded-full bg-black px-3 text-[13px] font-medium text-[#e3ff74]">
            立即升级
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CountdownPair({ digits }: { digits: string[] }) {
  return (
    <div className="flex gap-0.5">
      {digits.map((digit, index) => (
        <span
          key={`${digit}-${index}`}
          className="flex h-7 w-6 items-center justify-center rounded-[7px] border border-black/10 bg-white text-[14px] leading-none font-medium text-[#1b1b1a] md:h-8 md:w-7 md:rounded-[8px] md:text-[16px]"
        >
          {digit}
        </span>
      ))}
    </div>
  );
}

function CountdownDivider() {
  return <span className="text-[16px] leading-none font-semibold text-black/45">:</span>;
}

function PricingPlanCard({
  billingCycle,
  plan,
}: {
  billingCycle: BillingCycle;
  plan: PricingPlan;
}) {
  const isAnnually = billingCycle === "annually";
  const pricing = isAnnually ? plan.annually : plan.monthly;

  return (
    <div className="relative mt-[30px] flex w-full">
      {plan.ribbon ? (
        <div className="absolute inset-x-0 top-[-30px] z-[1] flex rounded-[16px] border border-[#d9f05d] bg-[#e3ff74] px-3 pt-[9px] text-[13px] font-medium leading-none text-black">
          <div className="w-full truncate text-center">{plan.ribbon}</div>
        </div>
      ) : null}

      <article
        className={cn(
          "relative z-[2] flex w-full flex-col gap-6 rounded-[16px] border pb-6",
          plan.highlighted
            ? "border-[#def479] bg-[#fcffe9]"
            : "border-black/8 bg-white",
        )}
      >
        <div className="border-b border-black/8 p-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[24px] leading-none font-normal text-[#1b1b1a]">
              {plan.name}
            </h3>

            <div className="inline-flex h-6 items-center rounded-md bg-[#f1f1ea] px-2 text-[13px] font-medium leading-none text-[#1b1b1a]">
              {plan.discount}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <span className="flex items-start text-[40px] leading-[1.1] font-medium text-[#1b1b1a]">
                <span className="mr-[3px] translate-y-[0.18em] text-[20px]">$</span>
                <span>{pricing.price}</span>
              </span>

              {isAnnually ? (
                <span className="mt-[12px] flex items-start text-[28px] leading-[1.1] font-normal text-[#9b9b94]">
                  <span className="mr-[3px] translate-y-[0.2em] text-[16px]">$</span>
                  <span className="line-through">{plan.annually.originalPrice}</span>
                </span>
              ) : null}

              <span className="mt-auto translate-y-[-0.25em] whitespace-nowrap text-[15px] leading-none font-normal text-[#8b8b84]">
                /月
              </span>
            </div>

            <p className="min-h-[17px] text-[12px] leading-[1.4] font-normal text-[#81817b]">
              {pricing.description}
            </p>
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-full items-center justify-center rounded-full bg-[#1b1b1a] px-4 text-[14px] font-normal text-white transition-colors hover:bg-black"
            >
              立即升级
            </button>

            {isAnnually ? (
              <div className="inline-flex items-center rounded-full bg-[#f4f4ef] px-3 py-1 text-[12px] font-medium text-[#66665f]">
                {plan.annually.savings}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 px-6">
          {plan.features.map((feature) => (
            <div key={feature.label} className="flex items-start gap-[10px]">
              <Check className="mt-[2px] size-4 shrink-0 text-[#1b1b1a]" strokeWidth={2.05} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-[13px] leading-[1.45] font-normal text-[#1b1b1a]">
                  <span>{feature.label}</span>
                  {feature.badge ? (
                    <span className="rounded-full bg-[#f1f1ea] px-1.5 py-0.5 text-[11px] leading-none text-[#66665f]">
                      {feature.badge}
                    </span>
                  ) : null}
                  {feature.detail ? (
                    <span className="cursor-help text-[#8d8d86]">
                      <Info className="size-[13px]" strokeWidth={1.9} />
                    </span>
                  ) : null}
                </div>

                {feature.detail ? (
                  <p className="mt-1 pl-0.5 text-[11px] leading-[1.4] font-normal text-[#7f7f78]">
                    {feature.detail}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function GenerationOverviewSection({
  billingCycle,
  category,
  expanded,
  onCategoryChange,
  onExpandedChange,
}: {
  billingCycle: BillingCycle;
  category: ModelCategory;
  expanded: boolean;
  onCategoryChange: (value: ModelCategory) => void;
  onExpandedChange: (value: boolean) => void;
}) {
  const rows = generationOverviewRows[category];
  const visibleRows = expanded ? rows : rows.slice(0, GENERATION_OVERVIEW_PREVIEW_COUNT);
  const showToggle = rows.length > GENERATION_OVERVIEW_PREVIEW_COUNT;

  return (
    <section className="mx-auto mt-16 w-full max-w-[1220px] pb-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <h3 className="text-[28px] leading-[1.18] font-medium tracking-[-0.03em] text-[#1b1b1a] md:text-[36px]">
          模型积分消耗 & 每月生成数量
        </h3>
        <p className="max-w-[760px] text-[14px] leading-[1.7] text-[#66665f] md:text-[16px]">
          以下为基于「生成器」模式的积分消耗和生成数量，Agent 模式的积分消耗略高于「生成器」模式。
        </p>
        <p className="text-[12px] leading-[1.6] text-[#8b8b84] md:text-[13px]">
          当前弹窗按会员方案的每月快速积分折算可生成数量，
          {billingCycle === "annually" ? "年付与月付的月度生成额度保持一致。" : "低速无限生成权益请以上方套餐卡说明为准。"}
        </p>
      </div>

      <div className="mt-7 flex justify-center">
        <div className="inline-flex items-center rounded-full bg-[#efefe8] p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
          {generationCategoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "inline-flex h-9 min-w-[84px] items-center justify-center rounded-full px-4 text-[14px] leading-none transition-all",
                category === option.value
                  ? "bg-white font-medium text-[#1b1b1a] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                  : "font-normal text-[#66665f] hover:text-[#1b1b1a]",
              )}
              onClick={() => onCategoryChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_16px_36px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[minmax(250px,1.6fr)_minmax(124px,0.86fr)_repeat(4,minmax(118px,0.72fr))] gap-0 border-b border-black/8 bg-[#f7f7f2] px-6 py-4">
              <div className="text-[12px] font-medium tracking-[0.02em] text-[#8b8b84] uppercase">
                模型
              </div>
              <div className="text-center text-[12px] font-medium tracking-[0.02em] text-[#8b8b84] uppercase">
                积分消耗
              </div>
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 text-center",
                    plan.highlighted ? "text-[#1b1b1a]" : "text-[#4f4f49]",
                  )}
                >
                  <span className="text-[12px] font-medium tracking-[0.02em] uppercase">
                    {plan.name}
                  </span>
                  <span className="text-[11px] leading-none text-[#8b8b84]">
                    {formatCompactCredits(generationPlanCredits[plan.id])}
                  </span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-black/6">
              {visibleRows.map((row) => (
                <div
                  key={`${category}-${row.name}-${row.usageLabel}`}
                  className="grid grid-cols-[minmax(250px,1.6fr)_minmax(124px,0.86fr)_repeat(4,minmax(118px,0.72fr))] items-center gap-0 px-6 py-4"
                >
                  <div className="pr-5">
                    <div className="text-[15px] leading-[1.4] font-medium text-[#1b1b1a]">
                      {row.name}
                    </div>
                    {row.detail ? (
                      <div className="mt-1 text-[12px] leading-[1.5] text-[#86867f]">
                        {row.detail}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-center text-[13px] leading-[1.5] font-medium text-[#55554f]">
                    {row.usageLabel}
                  </div>

                  {pricingPlans.map((plan) => (
                    <div
                      key={`${row.name}-${plan.id}`}
                      className={cn(
                        "text-center text-[14px] leading-none font-medium",
                        plan.highlighted ? "text-[#1b1b1a]" : "text-[#4f4f49]",
                      )}
                    >
                      {formatMonthlyGenerationCount(generationPlanCredits[plan.id], row)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showToggle ? (
          <div className="border-t border-black/6 px-5 py-4 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[14px] font-normal text-[#66665f] transition-colors hover:text-[#1b1b1a]"
              onClick={() => onExpandedChange(!expanded)}
            >
              <span>{expanded ? "收起" : "查看更多"}</span>
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  expanded ? "rotate-180" : "rotate-0",
                )}
                strokeWidth={1.9}
              />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatCompactCredits(value: number) {
  return `${new Intl.NumberFormat("zh-CN").format(value)} 积分`;
}

function formatMonthlyGenerationCount(planCredits: number, row: GenerationOverviewRow) {
  return `${new Intl.NumberFormat("zh-CN").format(Math.floor(planCredits / row.usageCost))} ${row.unit}`;
}

function usePromoCountdown(initialDurationMs: number) {
  const deadlineRef = React.useRef<number>(Date.now() + initialDurationMs);
  const [remainingMs, setRemainingMs] = React.useState(initialDurationMs);

  React.useEffect(() => {
    const update = () => {
      setRemainingMs(Math.max(0, deadlineRef.current - Date.now()));
    };

    update();
    const intervalId = window.setInterval(update, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: splitDigits(days),
    hours: splitDigits(hours),
    minutes: splitDigits(minutes),
    seconds: splitDigits(seconds),
  } satisfies CountdownDigits;
}

function splitDigits(value: number) {
  return value.toString().padStart(2, "0").split("");
}
