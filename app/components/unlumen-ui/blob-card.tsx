"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { FluidBlobs, type BlobOrigin } from "@/components/unlumen-ui/fluid-blobs";

const DEFAULT_LIGHT_COLORS = ["#ff0020", "#fc0f60", "#e8227a", "#ff85b3"];
const DEFAULT_DARK_COLORS = ["#8c0f60", "#e8227a", "#e8227a", "#ff85b3"];
const DEFAULT_ORIGINS: BlobOrigin[] = [
  { x: 14, y: -55 },
  { x: 38, y: -34 },
  { x: 68, y: -24 },
  { x: 92, y: -48 },
];

export interface BlobCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  headerHeight?: number;
  lightColors?: string[];
  darkColors?: string[];
  headerClassName?: string;
  contentClassName?: string;
  classNames?: Partial<Record<BlobCardSemanticDOM, string>>;
  styles?: Partial<Record<BlobCardSemanticDOM, React.CSSProperties>>;
}

type BlobCardSemanticDOM =
  | "root"
  | "surface"
  | "headerArea"
  | "headerOverlay"
  | "content";

export const BlobCard = React.forwardRef<HTMLDivElement, BlobCardProps>(
  (
    {
      children,
      className,
      contentClassName,
      darkColors = DEFAULT_DARK_COLORS,
      header,
      headerClassName,
      headerHeight = 224,
      classNames,
      lightColors = DEFAULT_LIGHT_COLORS,
      styles,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full", classNames?.root, className)}
        style={style}
        {...props}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] shadow-[0_18px_55px_rgba(15,23,42,0.1)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.45)]",
            classNames?.surface,
          )}
          style={styles?.surface}
        >
          <div className="relative overflow-hidden rounded-[20px] bg-background">
            <div
              className={cn("relative overflow-hidden", classNames?.headerArea)}
              style={{
                height: headerHeight,
                ...styles?.headerArea,
              }}
            >
              <FluidBlobs
                blur={55}
                className="opacity-95"
                darkColors={darkColors}
                lightColors={lightColors}
                margin={80}
                origins={DEFAULT_ORIGINS}
              />

              <div
                className={cn(
                  "absolute inset-0 bg-[radial-gradient(120%_95%_at_16%_0%,rgba(255,255,255,0.42),transparent_52%),radial-gradient(95%_80%_at_84%_2%,rgba(255,255,255,0.26),transparent_48%)] dark:bg-[radial-gradient(120%_95%_at_16%_0%,rgba(255,255,255,0.08),transparent_52%),radial-gradient(95%_80%_at_84%_2%,rgba(255,255,255,0.06),transparent_48%)]",
                  classNames?.headerOverlay,
                )}
                style={styles?.headerOverlay}
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-transparent to-background" />

              {header ? (
                <div
                  className={cn(
                    "relative z-10 flex h-full items-start p-8 pb-0",
                    classNames?.headerArea,
                    headerClassName,
                  )}
                >
                  {header}
                </div>
              ) : null}
            </div>

            {children ? (
              <div
                className={cn(
                  "relative z-10 px-8 pb-8 pt-6",
                  classNames?.content,
                  contentClassName,
                )}
                style={styles?.content}
              >
                {children}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

BlobCard.displayName = "BlobCard";

export interface BlobCardSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const BlobCardHeader = React.forwardRef<
  HTMLDivElement,
  BlobCardSectionProps
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-4", className)} {...props} />;
});

BlobCardHeader.displayName = "BlobCardHeader";

export const BlobCardContent = React.forwardRef<
  HTMLDivElement,
  BlobCardSectionProps
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-5", className)} {...props} />;
});

BlobCardContent.displayName = "BlobCardContent";

export const BlobCardEyebrow = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex rounded-full bg-white/60 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#5d495f] backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
});

BlobCardEyebrow.displayName = "BlobCardEyebrow";

export const BlobCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn(
        "text-[2rem] font-semibold leading-none tracking-[-0.08em] text-[#241726]",
        className,
      )}
      {...props}
    />
  );
});

BlobCardTitle.displayName = "BlobCardTitle";

export const BlobCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-[0.84rem] leading-5 text-[#5f4b61]", className)}
      {...props}
    />
  );
});

BlobCardDescription.displayName = "BlobCardDescription";

export default BlobCard;
