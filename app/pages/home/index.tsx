import { useRef } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, type Variants, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  AudioLines,
  BarChart3,
  Boxes,
  BrainCircuit,
  CirclePlay,
  Database,
  Eye,
  Layers3,
  MonitorPlay,
  Package,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

interface HomeMetric {
  label: string;
  value: string;
  note: string;
}

interface HomeFeature {
  title: string;
  description: string;
  bullets: string[];
  accentClassName: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HomeScenario {
  title: string;
  description: string;
  points: string[];
}

interface HomeRole {
  name: string;
  description: string;
  tags: string[];
}

interface HomeProduct {
  name: string;
  summary: string;
  description: string;
}

interface HomePageData {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trustTags: string[];
  };
  metrics: HomeMetric[];
  scriptTemplate: {
    eyebrow: string;
    title: string;
    description: string;
    linkLabel: string;
    panelTitle: string;
  };
  features: HomeFeature[];
  roles: HomeRole[];
  scenarios: HomeScenario[];
  products: HomeProduct[];
  customers: string[];
  bottomCta: {
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
}

const homePageData: HomePageData = {
  seo: {
    title: "灵犀数据 - 短视频&直播电商数据分析平台",
    description:
      "灵犀数据聚焦短视频与直播电商场景，提供达人、商品、直播间与内容趋势的多维分析能力。",
  },
  hero: {
    badge: "灵犀数据 · 内容电商增长驾驶舱",
    title: "面向品牌、商家与机构的",
    highlight: "短视频&直播电商数据分析平台",
    description:
      "参考内容电商数据平台首页的信息架构，围绕达人、商品、直播和内容四条主线，帮助团队更快找到增长机会、验证投放方向并复盘经营结果。",
    primaryCta: "申请产品演示",
    secondaryCta: "查看能力地图",
    trustTags: [
      "达人库检索",
      "商品趋势追踪",
      "直播间复盘",
      "短视频表现分析",
    ],
  },
  metrics: [
    {
      label: "内容线索池",
      value: "1.2亿+",
      note: "多维内容、商品、账号样本持续沉淀",
    },
    {
      label: "监控更新频率",
      value: "分钟级",
      note: "重点直播间、达人与商品趋势快速跟进",
    },
    {
      label: "决策视角",
      value: "20+",
      note: "覆盖账号、视频、商品、品牌、店铺与投放",
    },
    {
      label: "服务对象",
      value: "品牌 / 商家 / MCN",
      note: "适配内容电商链路中的不同角色分工",
    },
  ],
  scriptTemplate: {
    eyebrow: "爆款台词模版",
    title: "爆款短视频台词模版",
    description:
      "看黄金 3 秒台词，套用最新爆款流量模版，引爆视频开头。",
    linkLabel: "黄金 3 秒台词",
    panelTitle: "黄金3秒台词模版",
  },
  features: [
    {
      title: "达人与账号分析",
      description:
        "聚焦账号画像、带货能力、内容稳定性与合作匹配度，帮助团队快速筛选值得深挖的人群资产。",
      bullets: ["达人标签拆解", "粉丝结构观察", "合作效率评估"],
      accentClassName:
        "from-cyan-500/20 via-sky-500/10 to-transparent border-cyan-500/20",
      icon: Users,
    },
    {
      title: "商品与类目趋势",
      description:
        "围绕商品成长轨迹、价格带、销量波峰和类目变化，判断当下更值得投入的供给方向。",
      bullets: ["爆品追踪", "类目机会发现", "价格与销量联动分析"],
      accentClassName:
        "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/20",
      icon: Package,
    },
    {
      title: "直播间经营复盘",
      description:
        "通过直播节奏、互动、转化与排品表现的结合，定位一场直播到底是流量问题还是货盘问题。",
      bullets: ["场次表现对比", "转化节点定位", "排品结构优化"],
      accentClassName:
        "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/20",
      icon: MonitorPlay,
    },
    {
      title: "短视频内容洞察",
      description:
        "观察内容开头、节奏、话题与商品挂载方式，沉淀适合不同赛道的内容增长模板。",
      bullets: ["高表现内容拆解", "话题趋势监测", "内容素材灵感归档"],
      accentClassName:
        "from-fuchsia-500/20 via-pink-500/10 to-transparent border-fuchsia-500/20",
      icon: Video,
    },
  ],
  roles: [
    {
      name: "品牌方",
      description:
        "从市场趋势、竞品动作和达人合作效果出发，建立更稳的内容投放与生意增长节奏。",
      tags: ["品牌监测", "投放复盘", "达人合作"],
    },
    {
      name: "商家与供应链",
      description:
        "更快识别潜力类目、爆品模型和直播卖点，缩短从选品到内容验证的试错周期。",
      tags: ["选品分析", "货盘优化", "直播策略"],
    },
    {
      name: "MCN / 代运营",
      description:
        "将账号运营、商务合作和内容策略放到同一套数据框架里，提高项目复制与交付效率。",
      tags: ["账号诊断", "团队协作", "客户汇报"],
    },
    {
      name: "操盘手与投手",
      description:
        "把直播、短视频和货盘转化串成闭环，更快判断下一步该加预算、换素材还是调结构。",
      tags: ["投放诊断", "素材分析", "增量机会"],
    },
  ],
  scenarios: [
    {
      title: "找机会",
      description:
        "通过类目热度、商品成长、内容趋势与达人表现，先定位值得投入的方向。",
      points: ["看清类目波动", "发现新达人", "锁定潜力商品"],
    },
    {
      title: "做策略",
      description:
        "围绕谁来带、卖什么、怎么讲、怎么投四个问题，搭建更清晰的增长策略。",
      points: ["搭配合作达人", "优化货盘结构", "调整直播节奏"],
    },
    {
      title: "复盘增长",
      description:
        "把内容表现、成交结果与经营动作对齐，沉淀可复制的增长模型和团队方法论。",
      points: ["复盘场次差异", "追踪内容贡献", "总结爆量规律"],
    },
  ],
  products: [
    {
      name: "达人雷达",
      summary: "找更合适的合作对象",
      description:
        "按类目、带货表现、粉丝画像和内容风格多维筛选达人，缩短筛号和初筛时间。",
    },
    {
      name: "商品引擎",
      summary: "看清商品趋势与货盘结构",
      description:
        "追踪商品热度、价格带、销量变化与竞品动作，帮助团队更快决定选品和补货方向。",
    },
    {
      name: "直播看板",
      summary: "复盘每场直播经营结果",
      description:
        "从流量、互动、转化、排品到销售节奏，建立直播间的统一复盘视图。",
    },
    {
      name: "内容洞察",
      summary: "拆解高表现视频与素材逻辑",
      description:
        "把选题、封面、结构、话术和挂车策略放在一起看，沉淀内容增长模板。",
    },
  ],
  customers: [
    "国货品牌",
    "食品饮料",
    "美妆个护",
    "服饰鞋包",
    "家清日化",
    "母婴行业",
    "MCN 机构",
    "代运营团队",
  ],
  bottomCta: {
    title: "把达人、商品、直播和内容放到一张增长地图里",
    description:
      "如果你希望首页继续往更贴近目标竞品的方向推进，下一步可以继续补真实图表、产品截图和更细的模块层级。",
    primaryCta: "继续完善首页",
    secondaryCta: "规划后台页面",
  },
};

const viewport = {
  once: true,
  amount: 0.2,
} as const;

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const fadeUpItem: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const softScaleItem: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 18,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export async function loadHomePageData() {
  return homePageData;
}

export function getHomeMeta(data?: HomePageData) {
  const title = data?.seo.title ?? homePageData.seo.title;
  const description = data?.seo.description ?? homePageData.seo.description;

  return [
    { title },
    { name: "description", content: description },
  ];
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      variants={fadeUpItem}
      className={cn(
        "space-y-3",
        align === "center" && "mx-auto max-w-3xl text-center",
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      <p className="text-sm leading-7 text-slate-600 md:text-base">
        {description}
      </p>
    </motion.div>
  );
}

function HeroDashboard({
  metrics,
  features,
}: {
  metrics: HomeMetric[];
  features: HomeFeature[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
      className="relative"
    >
      <motion.div
        animate={{
          x: [0, 14, 0],
          y: [0, -8, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-x-8 top-0 h-48 rounded-full bg-cyan-300/30 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.35)] backdrop-blur md:p-5">
        <div className="mb-4 flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              今日增长面板
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              内容电商增长驾驶舱
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="size-2 rounded-full bg-emerald-500"
            />
            实时更新中
          </motion.div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  近 7 日趋势
                </p>
                <p className="mt-2 text-2xl font-semibold">流量与成交双视角</p>
              </div>
              <TrendingUp className="size-5 text-cyan-300" />
            </div>
            <div className="mt-8 flex h-44 items-end gap-3">
              {[56, 88, 72, 110, 96, 132, 148].map((value, index) => (
                <div key={value} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    className={cn(
                      "w-full rounded-t-2xl bg-gradient-to-t from-cyan-500 to-cyan-300",
                      index % 2 === 1 && "from-sky-500 to-cyan-200",
                    )}
                    initial={{ scaleY: 0.15, opacity: 0.35 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.2 + index * 0.08,
                      ease: "easeOut",
                    }}
                    style={{ height: `${value}px` }}
                  />
                  <span className="text-[11px] text-slate-400">
                    {["一", "二", "三", "四", "五", "六", "日"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {metrics.slice(0, 2).map((metric) => (
              <motion.div
                key={metric.label}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {metric.note}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {features.slice(0, 3).map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "rounded-[1.5rem] border bg-gradient-to-br p-4",
                  feature.accentClassName,
                )}
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-white/80 text-slate-950 shadow-sm">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-semibold text-slate-950">
                  {feature.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ScriptTemplateShowcase({
  data,
}: {
  data: HomePageData["scriptTemplate"];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progress = useTransform(scrollYProgress, [0.06, 0.92], [0, 1]);

  const card1X = useTransform(progress, [0, 1], [-156, -156]);
  const card1Y = useTransform(progress, [0, 1], [-110, -110]);
  const card1Rotate = useTransform(progress, [0, 1], [0, 0]);
  const card1Scale = useTransform(progress, [0, 1], [1, 1]);
  const card1Opacity = useTransform(progress, [0, 1], [1, 1]);

  const card2X = useTransform(progress, [0, 1], [212, -142]);
  const card2Y = useTransform(progress, [0, 1], [-186, -102]);
  const card2Rotate = useTransform(progress, [0, 1], [0, -4]);
  const card2Scale = useTransform(progress, [0, 1], [1, 0.96]);
  const card2Opacity = useTransform(progress, [0, 0.82, 1], [1, 0.9, 0.58]);

  const card3X = useTransform(progress, [0, 1], [-144, -136]);
  const card3Y = useTransform(progress, [0, 1], [294, -90]);
  const card3Rotate = useTransform(progress, [0, 1], [0, 2]);
  const card3Scale = useTransform(progress, [0, 1], [0.98, 0.93]);
  const card3Opacity = useTransform(progress, [0, 0.82, 1], [1, 0.84, 0.42]);

  const card4X = useTransform(progress, [0, 1], [212, -128]);
  const card4Y = useTransform(progress, [0, 1], [142, -78]);
  const card4Rotate = useTransform(progress, [0, 1], [0, 4]);
  const card4Scale = useTransform(progress, [0, 1], [0.98, 0.9]);
  const card4Opacity = useTransform(progress, [0, 0.82, 1], [1, 0.8, 0.28]);

  const panelX = useTransform(progress, [0, 1], [252, 96]);
  const panelY = useTransform(progress, [0, 1], [96, 44]);
  const panelOpacity = useTransform(progress, [0, 0.38, 0.62, 1], [0, 0, 0.82, 1]);
  const panelScale = useTransform(progress, [0, 0.55, 1], [0.84, 0.92, 1]);
  const panelBlur = useTransform(progress, [0, 0.48, 1], [12, 10, 0]);
  const panelFilter = useTransform(panelBlur, (value) => `blur(${value}px)`);
  const sceneScale = useTransform(progress, [0, 1], [1, 0.985]);
  const linkOpacity = useTransform(progress, [0, 0.7, 1], [1, 0.92, 0.82]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[210vh] md:h-[220vh] lg:h-[240vh]"
    >
      <div className="sticky top-20 flex min-h-[calc(100svh-5rem)] items-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ scale: sceneScale }}
          className="grid w-full gap-10 overflow-hidden rounded-[2.75rem] bg-[#eff0ff] px-6 py-12 md:px-8 md:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-16"
        >
          <motion.div variants={fadeUpItem} className="max-w-[36rem] space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff5b2e]">
                {data.eyebrow}
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl lg:text-[4.25rem] lg:leading-[1.04]">
                <span>爆款短视频台词</span>
                <span className="text-[#ff5b2e]">模版</span>
              </h2>
              <p className="max-w-2xl text-xl font-medium leading-[1.6] text-slate-400 md:text-2xl lg:text-[2.05rem] lg:leading-[1.55]">
                看黄金3秒台词，套用最新爆款流量模版
                <br />
                引爆视频开头
              </p>
            </div>

            <motion.a
              href="#"
              style={{ opacity: linkOpacity }}
              className="inline-flex items-center text-xl font-semibold text-[#ff5b2e]"
            >
              {data.linkLabel.replaceAll(" ", "")}
              <ArrowRight className="ml-3 size-6" />
            </motion.a>
          </motion.div>

          <motion.div
            variants={fadeUpItem}
            className="relative mx-auto h-[500px] w-full max-w-[760px] overflow-hidden md:h-[580px] lg:h-[660px]"
          >
            <div className="absolute inset-y-0 right-0 z-40 w-16 bg-gradient-to-l from-[#eff0ff] to-transparent md:w-24" />

            <motion.img
              src="/home/script-template-card-1.png"
              alt="爆款短视频台词模版卡片 1"
              style={{
                x: card1X,
                y: card1Y,
                rotate: card1Rotate,
                scale: card1Scale,
                opacity: card1Opacity,
              }}
              className="absolute left-1/2 top-1/2 z-30 w-[220px] -translate-x-1/2 -translate-y-1/2 select-none rounded-[1.9rem] object-cover shadow-[0_35px_90px_-42px_rgba(15,23,42,0.38)] md:w-[280px] lg:w-[320px]"
            />

            <motion.img
              src="/home/script-template-card-2.png"
              alt="爆款短视频台词模版卡片 2"
              style={{
                x: card2X,
                y: card2Y,
                rotate: card2Rotate,
                scale: card2Scale,
                opacity: card2Opacity,
              }}
              className="absolute left-1/2 top-1/2 z-20 w-[206px] -translate-x-1/2 -translate-y-1/2 select-none rounded-[1.9rem] object-cover shadow-[0_35px_90px_-42px_rgba(15,23,42,0.38)] md:w-[260px] lg:w-[296px]"
            />

            <motion.img
              src="/home/script-template-card-3.png"
              alt="爆款短视频台词模版卡片 3"
              style={{
                x: card3X,
                y: card3Y,
                rotate: card3Rotate,
                scale: card3Scale,
                opacity: card3Opacity,
              }}
              className="absolute left-1/2 top-1/2 z-10 w-[206px] -translate-x-1/2 -translate-y-1/2 select-none rounded-[1.9rem] object-cover shadow-[0_35px_90px_-42px_rgba(15,23,42,0.38)] md:w-[260px] lg:w-[296px]"
            />

            <motion.img
              src="/home/script-template-card-4.png"
              alt="爆款短视频台词模版卡片 4"
              style={{
                x: card4X,
                y: card4Y,
                rotate: card4Rotate,
                scale: card4Scale,
                opacity: card4Opacity,
              }}
              className="absolute left-1/2 top-1/2 z-0 w-[206px] -translate-x-1/2 -translate-y-1/2 select-none rounded-[1.9rem] object-cover shadow-[0_35px_90px_-42px_rgba(15,23,42,0.38)] md:w-[260px] lg:w-[296px]"
            />

            <motion.div
              style={{
                x: panelX,
                y: panelY,
                opacity: panelOpacity,
                scale: panelScale,
                filter: panelFilter,
              }}
              className="script-template-panel absolute left-1/2 top-1/2 z-30 min-h-[360px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] p-7 text-white shadow-[0_48px_140px_-56px_rgba(0,0,0,0.62)] md:min-h-[400px] md:w-[375px] md:rounded-[2.6rem] md:p-8 lg:min-h-[430px] lg:w-[375px] lg:rounded-[2.7rem] lg:px-10 lg:py-10"
            >
              <div className="mb-8 text-[1.65rem] font-semibold tracking-tight text-white md:text-[2rem] lg:mb-10 lg:text-[2.1rem] lg:leading-none">
                {data.panelTitle}
              </div>
              <div className="space-y-3.5 md:space-y-4 lg:space-y-4.5">
                <div className="script-template-line script-delay-1 text-[1.3rem] font-semibold leading-[1.2] text-[#ff5b2e] md:text-[1.55rem] lg:text-[1.72rem]">
                  我也不想买呀，可是它
                </div>

                <div className="script-template-line script-delay-2 script-template-muted script-template-swap text-[1.24rem] font-semibold leading-[1.16] md:text-[1.46rem] lg:text-[1.62rem]">
                  <div className="script-template-swap-primary">竟然让玉桂狗</div>
                  <div className="script-template-swap-secondary">是玉桂狗蛋糕呀</div>
                </div>

                <div className="script-template-line script-delay-3 script-template-muted script-template-swap text-[1.24rem] font-semibold leading-[1.16] md:text-[1.46rem] lg:text-[1.62rem]">
                  <div className="script-template-swap-primary">坐在蛋糕上</div>
                  <div className="script-template-swap-secondary">加上少女心配色</div>
                </div>

                <div className="script-template-line script-delay-4 text-[1.3rem] font-semibold leading-[1.2] text-[#ff5b2e] md:text-[1.55rem] lg:text-[1.72rem]">
                  这真的很难抗拒
                </div>

                <div className="script-template-line script-delay-5 script-template-soft script-template-swap text-[1.24rem] font-semibold leading-[1.16] md:text-[1.46rem] lg:text-[1.62rem]">
                  <div className="script-template-swap-primary">太让人心动了</div>
                  <div className="script-template-swap-secondary">好想拥有它！</div>
                </div>

                <div className="script-template-line script-delay-6 script-template-fade pt-2 text-[1.15rem] font-semibold md:text-[1.26rem] lg:pt-3 lg:text-[1.42rem]">
                  ...
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

interface HomePageProps {
  data: HomePageData;
}

export function HomePage({ data }: HomePageProps) {
  return (
    <main className="min-h-svh bg-[linear-gradient(180deg,#eef8ff_0%,#f7fafc_28%,#ffffff_56%,#f8fbfd_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="sticky top-0 z-20 pt-4"
        >
          <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/80 px-5 py-3 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-cyan-950/10">
                <Radar className="size-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-950">灵犀数据</p>
                <p className="text-xs tracking-[0.2em] text-slate-500">
                  LINGXI DATA
                </p>
              </div>
            </div>
            <nav className="hidden items-center gap-7 text-sm text-slate-600 lg:flex">
              <a href="#capabilities" className="transition hover:text-slate-950">
                产品能力
              </a>
              <a href="#scenarios" className="transition hover:text-slate-950">
                应用场景
              </a>
              <a href="#products" className="transition hover:text-slate-950">
                产品矩阵
              </a>
              <a href="#customers" className="transition hover:text-slate-950">
                服务客户
              </a>
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <Button
                asChild
                className="h-10 rounded-full bg-slate-950 px-5 hover:bg-slate-800"
              >
                <Link to="/dashboard">进入工作台</Link>
              </Button>
            </div>
          </div>
        </motion.header>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-12 pb-16 pt-10 md:pb-24 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        >
          <motion.div variants={staggerContainer} className="space-y-8">
            <motion.div
              variants={fadeUpItem}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900"
            >
              <Sparkles className="size-4" />
              {data.hero.badge}
            </motion.div>

            <motion.div variants={fadeUpItem} className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-tight text-slate-950 md:text-6xl">
                {data.hero.title}
                <motion.span
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="mt-2 block bg-[linear-gradient(90deg,#0e7490,#0284c7,#059669,#0e7490)] bg-[length:200%_200%] bg-clip-text text-transparent"
                >
                  {data.hero.highlight}
                </motion.span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                {data.hero.description}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUpItem}
              className="flex flex-wrap items-center gap-3"
            >
              <Button className="h-12 rounded-full bg-slate-950 px-6 text-sm hover:bg-slate-800">
                {data.hero.primaryCta}
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-slate-300 bg-white px-6 text-sm"
              >
                <CirclePlay className="mr-1 size-4" />
                {data.hero.secondaryCta}
              </Button>
            </motion.div>

            <motion.div variants={staggerContainer} className="flex flex-wrap gap-2">
              {data.hero.trustTags.map((tag) => (
                <motion.span
                  variants={softScaleItem}
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <HeroDashboard metrics={data.metrics} features={data.features} />
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="py-16 md:py-20"
        >
          <ScriptTemplateShowcase data={data.scriptTemplate} />
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid gap-4 border-y border-slate-200/80 py-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {data.metrics.map((metric) => (
            <motion.div
              variants={softScaleItem}
              whileHover={{ y: -4 }}
              key={metric.label}
              className="rounded-3xl bg-white/80 p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{metric.note}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          id="capabilities"
          className="py-18 md:py-24"
        >
          <SectionHeading
            eyebrow="产品能力"
            title="围绕内容电商增长的四个核心分析维度"
            description="首页信息架构参考了行业数据平台常见的展示方式：先讲核心价值，再讲能力模块，让访问者在第一屏之外快速知道你到底能解决什么问题。"
          />

          <motion.div variants={staggerContainer} className="mt-10 grid gap-5 lg:grid-cols-2">
            {data.features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  variants={softScaleItem}
                  whileHover={{ y: -8, scale: 1.01 }}
                  key={feature.title}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1"
                >
                  <div
                    className={cn(
                      "mb-6 flex size-14 items-center justify-center rounded-3xl border bg-gradient-to-br",
                      feature.accentClassName,
                    )}
                  >
                    <Icon className="size-6 text-slate-950" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {feature.bullets.map((bullet) => (
                      <motion.span
                        variants={softScaleItem}
                        key={bullet}
                        className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
                      >
                        {bullet}
                      </motion.span>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-10 text-white md:px-8"
        >
          <SectionHeading
            eyebrow="服务对象"
            title="同一套数据底座，匹配不同角色的经营动作"
            description="首页中段通常需要快速告诉访问者“这套产品适合谁”，这部分我按品牌方、商家、机构和操盘手四类角色做了拆分。"
          />
          <motion.div variants={staggerContainer} className="mt-10 grid gap-4 lg:grid-cols-4">
            {data.roles.map((role) => (
              <motion.article
                variants={softScaleItem}
                whileHover={{ y: -6 }}
                key={role.name}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck className="size-5 text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold">{role.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {role.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {role.tags.map((tag) => (
                    <motion.span
                      variants={softScaleItem}
                      key={tag}
                      className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-slate-200"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          id="scenarios"
          className="py-18 md:py-24"
        >
          <SectionHeading
            eyebrow="应用场景"
            title="把找机会、做策略、复盘增长串成完整闭环"
            description="这部分参考行业平台首页常见的“增长路径”表达，不直接复制原站布局，而是做成更适合你项目的三段式场景模块。"
          />

          <motion.div variants={staggerContainer} className="mt-10 grid gap-5 lg:grid-cols-3">
            {data.scenarios.map((scenario, index) => (
              (() => {
                const Icon = [Search, BrainCircuit, BarChart3][index];

                return (
                  <motion.article
                    variants={softScaleItem}
                    whileHover={{ y: -8 }}
                    key={scenario.title}
                    className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                        0{index + 1}
                      </span>
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Icon className="size-5" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-950">
                      {scenario.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {scenario.description}
                    </p>
                    <div className="mt-6 space-y-3">
                      {scenario.points.map((point) => (
                        <motion.div
                          variants={fadeUpItem}
                          key={point}
                          className="flex items-center gap-3"
                        >
                          <div className="flex size-7 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
                            <ArrowRight className="size-3.5" />
                          </div>
                          <span className="text-sm text-slate-700">{point}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.article>
                );
              })()
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          id="products"
          className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-14 text-white md:px-8"
        >
          <SectionHeading
            eyebrow="产品矩阵"
            title="让首页直接讲清楚你有哪些主力产品"
            description="参考蝉妈妈首页会展示产品群和能力地图的方式，这里做成更适合你当前项目的四宫格产品矩阵。"
          />

          <motion.div variants={staggerContainer} className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {data.products.map((product, index) => (
              (() => {
                const Icon = [Users, Database, AudioLines, Layers3][index];

                return (
                  <motion.article
                    variants={softScaleItem}
                    whileHover={{ y: -8, scale: 1.02 }}
                    key={product.name}
                    className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
                  >
                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="mt-2 text-sm font-medium text-cyan-200">
                      {product.summary}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {product.description}
                    </p>
                  </motion.article>
                );
              })()
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          id="customers"
          className="py-18 md:py-24"
        >
          <SectionHeading
            eyebrow="服务客户"
            title="适用于内容电商链路中的多个行业与团队形态"
            description="首页底部增加客户类型与信任背书区域，让整体更像成熟商业产品官网，而不只是单纯的产品功能页。"
            align="center"
          />

          <motion.div variants={staggerContainer} className="mt-10 flex flex-wrap justify-center gap-3">
            {data.customers.map((customer) => (
              <motion.div
                variants={softScaleItem}
                whileHover={{ y: -3 }}
                key={customer}
                className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
              >
                {customer}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={staggerContainer} className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Eye,
                title: "看清趋势",
                text: "把类目、达人、内容和商品的变化统一纳入决策视角。",
              },
              {
                icon: Store,
                title: "找到机会",
                text: "从数据中定位适合当前阶段的合作对象、货盘方向与内容打法。",
              },
              {
                icon: Boxes,
                title: "沉淀方法",
                text: "让团队从单次爆量走向可复用、可复盘、可协作的增长体系。",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <motion.article
                  variants={softScaleItem}
                  whileHover={{ y: -6 }}
                  key={item.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="pb-16 md:pb-24"
        >
          <motion.div
            variants={softScaleItem}
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-[2.5rem] border border-cyan-200 bg-[linear-gradient(135deg,#0f172a_0%,#083344_48%,#0f766e_100%)] px-6 py-10 text-white md:px-10 md:py-14"
          >
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  下一步
                </p>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
                  {data.bottomCta.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-50/85 md:text-base">
                  {data.bottomCta.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button className="h-12 rounded-full bg-white px-6 text-sm text-slate-950 hover:bg-slate-100">
                  {data.bottomCta.primaryCta}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white/20 bg-white/10 px-6 text-sm text-white hover:bg-white/15"
                >
                  {data.bottomCta.secondaryCta}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}
