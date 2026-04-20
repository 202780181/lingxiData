"use client";

import * as React from "react";
import { motion, type Transition } from "motion/react";

import { cn } from "@/lib/utils";

export interface GlowEffectProps {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?:
    | "rotate"
    | "pulse"
    | "breathe"
    | "colorShift"
    | "flowHorizontal"
    | "static";
  blur?:
    | number
    | "softest"
    | "soft"
    | "medium"
    | "strong"
    | "stronger"
    | "strongest"
    | "none";
  transition?: Transition;
  scale?: number;
  hoverScale?: number;
  duration?: number;
}

const BLUR_PRESETS = {
  softest: "blur-xs",
  soft: "blur-sm",
  medium: "blur-md",
  strong: "blur-lg",
  stronger: "blur-xl",
  strongest: "blur-xl",
  none: "blur-none",
} as const;

export function GlowEffect({
  className,
  style,
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "medium",
  transition,
  scale = 1,
  hoverScale: _hoverScale = 1.15,
  duration = 5,
}: GlowEffectProps) {
  const baseTransition: Transition = {
    repeat: Infinity,
    duration,
    ease: "linear",
  };

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(", ")})`,
      ],
      transition: transition ?? baseTransition,
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`,
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition:
        transition ??
        ({
          ...baseTransition,
          repeatType: "mirror",
        } satisfies Transition),
    },
    breathe: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`,
      ),
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition:
        transition ??
        ({
          ...baseTransition,
          repeatType: "mirror",
        } satisfies Transition),
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`;
      }),
      transition:
        transition ??
        ({
          ...baseTransition,
          repeatType: "mirror",
        } satisfies Transition),
    },
    flowHorizontal: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length];
        return `linear-gradient(to right, ${color}, ${nextColor})`;
      }),
      transition:
        transition ??
        ({
          ...baseTransition,
          repeatType: "mirror",
        } satisfies Transition),
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(", ")})`,
    },
  } as const;

  const blurClassName =
    typeof blur === "number" ? undefined : BLUR_PRESETS[blur] ?? BLUR_PRESETS.medium;

  return (
    <motion.div
      animate={animations[mode] as never}
      className={cn(
        "absolute inset-0 h-full w-full pointer-events-none transform-gpu scale-[var(--scale)]",
        blurClassName,
        className,
      )}
      style={
        {
          ...style,
          "--scale": scale,
          ...(typeof blur === "number" ? { filter: `blur(${blur}px)` } : null),
          willChange: "transform",
          backfaceVisibility: "hidden",
        } as React.CSSProperties
      }
    />
  );
}

export default GlowEffect;
