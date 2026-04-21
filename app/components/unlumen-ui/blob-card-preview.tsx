"use client";

import * as React from "react";

import {
  BlobCard,
  BlobCardContent,
  BlobCardDescription,
  BlobCardEyebrow,
  BlobCardHeader,
  BlobCardTitle,
  type BlobCardProps,
} from "@/components/unlumen-ui/blob-card";
import { cn } from "@/lib/utils";

export interface BlobCardPreviewItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface BlobCardPreviewProps
  extends Omit<BlobCardProps, "children" | "header" | "title"> {
  badge?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  signalLabel?: React.ReactNode;
  signalValue?: React.ReactNode;
  signalStatus?: React.ReactNode;
  items?: BlobCardPreviewItem[];
  children?: React.ReactNode;
}

const DEFAULT_ITEMS: BlobCardPreviewItem[] = [
  { label: "Creative direction", value: "Synced to spring campaign" },
  { label: "Audience overlap", value: "34% with core shoppers" },
  { label: "Launch window", value: "Best on Tue 18:00 - 20:00" },
];

export const BlobCardPreview = React.forwardRef<
  HTMLDivElement,
  BlobCardPreviewProps
>(
  (
    {
      badge = "Blob Card",
      children,
      className,
      description = "A soft glass card with floating blobs and a quiet fade into the content area.",
      items = DEFAULT_ITEMS,
      signalLabel = "Weekly signal",
      signalStatus = "Stable",
      signalValue = "+18.4%",
      title = "Brand pulse",
      ...props
    },
    ref,
  ) => {
    return (
      <BlobCard
        ref={ref}
        className={cn("w-full max-w-[420px]", className)}
        header={
          <BlobCardHeader>
            <BlobCardEyebrow>{badge}</BlobCardEyebrow>

            <div className="max-w-[15rem] space-y-2">
              <BlobCardTitle>{title}</BlobCardTitle>
              <BlobCardDescription>{description}</BlobCardDescription>
            </div>
          </BlobCardHeader>
        }
        {...props}
      >
        {children ? (
          children
        ) : (
          <BlobCardContent>
            <div className="flex items-center justify-between rounded-[1rem] bg-[#f7f4f8] px-4 py-3">
              <div>
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-neutral-500">
                  {signalLabel}
                </p>
                <p className="mt-1 text-[1.35rem] font-semibold tracking-[-0.05em] text-neutral-900">
                  {signalValue}
                </p>
              </div>

              <div className="rounded-full bg-white px-3 py-1 text-[0.72rem] font-semibold text-emerald-600 shadow-[0_6px_20px_rgba(15,23,42,0.08)]">
                {signalStatus}
              </div>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-[0.95rem] border border-black/5 bg-white/70 px-4 py-3"
                >
                  <span className="text-[0.82rem] font-medium text-neutral-500">
                    {item.label}
                  </span>
                  <span className="text-[0.82rem] font-semibold text-neutral-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </BlobCardContent>
        )}
      </BlobCard>
    );
  },
);

BlobCardPreview.displayName = "BlobCardPreview";

export default BlobCardPreview;
