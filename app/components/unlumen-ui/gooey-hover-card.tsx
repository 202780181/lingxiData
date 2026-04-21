"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

type GooeyHoverCardTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "muted";

export interface GooeyHoverCardItem {
  id?: React.Key;
  label: React.ReactNode;
  value?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: GooeyHoverCardTone;
  className?: string;
  valueClassName?: string;
}

export interface GooeyHoverCardProps {
  title?: React.ReactNode;
  meta?: React.ReactNode;
  description?: React.ReactNode;
  items?: GooeyHoverCardItem[];
  renderItem?: (item: GooeyHoverCardItem, index: number) => React.ReactNode;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerAriaLabel?: string;
  collapsedSize?: number;
  panelWidth?: number;
  panelOffset?: number;
  panelRadius?: number;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
}

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

const toneClassNames: Record<GooeyHoverCardTone, string> = {
  default: "text-white/75",
  info: "text-sky-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-rose-300",
  muted: "text-white/45",
};

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const mergedValue = isControlled ? (value as T) : internalValue;
  const valueRef = React.useRef(mergedValue);

  React.useEffect(() => {
    valueRef.current = mergedValue;
  }, [mergedValue]);

  const setValue = React.useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      if (!Object.is(valueRef.current, nextValue)) {
        onChange?.(nextValue);
      }
    },
    [isControlled, onChange],
  );

  return [mergedValue, setValue] as const;
}

function GooeyFilter({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 h-0 w-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}

export function NextMark() {
  const id = React.useId();
  const clipId = `${id}-clip`;
  const paint0Id = `${id}-paint0`;
  const paint1Id = `${id}-paint1`;

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ translate: "-0.5px" }}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M17.2571 18.5026L4.75568 2.39941H2.40027V13.5947H4.2846V4.79242L15.7779 19.642C16.2965 19.2949 16.7906 18.914 17.2571 18.5026Z"
          fill={`url(#${paint0Id})`}
        />
        <rect
          x="11.8892"
          y="2.39941"
          width="1.86667"
          height="11.2"
          fill={`url(#${paint1Id})`}
        />
      </g>
      <defs>
        <linearGradient
          id={paint0Id}
          x1="10.9558"
          y1="12.1216"
          x2="16.478"
          y2="18.9661"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.604072" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={paint1Id}
          x1="12.8225"
          y1="2.39941"
          x2="12.7912"
          y2="10.6244"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function DefaultItemRow({ item }: { item: GooeyHoverCardItem }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        item.description && "items-center",
        item.className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.icon ? (
            <span className="flex size-4 shrink-0 items-center justify-center text-white/70">
              {item.icon}
            </span>
          ) : null}
          <span className="truncate text-sm font-semibold text-white">
            {item.label}
          </span>
        </div>
        {item.description ? (
          <p className="mt-1 text-xs leading-5 text-white/45">
            {item.description}
          </p>
        ) : null}
      </div>

      {item.value !== undefined ? (
        <div
          className={cn(
            "shrink-0 text-right text-sm font-semibold",
            toneClassNames[item.tone ?? "muted"],
            item.valueClassName,
          )}
        >
          {item.value}
        </div>
      ) : null}
    </div>
  );
}

export function GooeyHoverCard({
  title,
  meta,
  description,
  items,
  renderItem,
  trigger,
  footer,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  triggerAriaLabel = "Toggle gooey panel",
  collapsedSize = 40,
  panelWidth = 220,
  panelOffset = 52,
  panelRadius = 10,
  disabled = false,
  className,
  triggerClassName,
  panelClassName,
  contentClassName,
}: GooeyHoverCardProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const filterId = `gooey-filter-${React.useId()}`;

  const [mergedOpen, setMergedOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const isOpen = mergedOpen && !disabled;
  const hasCustomChildren = children !== undefined && children !== null;

  const openPanel = React.useCallback(() => {
    if (!disabled) {
      setMergedOpen(true);
    }
  }, [disabled, setMergedOpen]);

  const closePanel = React.useCallback(() => {
    if (!disabled) {
      setMergedOpen(false);
    }
  }, [disabled, setMergedOpen]);

  const togglePanel = React.useCallback(() => {
    if (!disabled) {
      setMergedOpen(!mergedOpen);
    }
  }, [disabled, mergedOpen, setMergedOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (target && rootRef.current?.contains(target)) {
        return;
      }

      closePanel();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePanel, isOpen]);

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget as Node | null;

      if (nextTarget && rootRef.current?.contains(nextTarget)) {
        return;
      }

      closePanel();
    },
    [closePanel],
  );

  const hasDefaultContent = !hasCustomChildren && Boolean(
    title || meta || description || items?.length || footer,
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={openPanel}
      onMouseLeave={closePanel}
      onFocusCapture={openPanel}
      onBlur={handleBlur}
    >
      <GooeyFilter id={filterId} />

      <div style={{ filter: `url(#${filterId})` }} className="relative inline-flex">
        {isOpen ? (
          <div
            aria-hidden="true"
            className="absolute bottom-full left-1/2 z-0 -translate-x-1/2"
            style={{
              height: panelOffset + 20,
              width: panelWidth + 24,
            }}
          />
        ) : null}

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              key="gooey-panel"
              initial={{
                y: 0,
                width: collapsedSize,
                height: collapsedSize,
                borderRadius: collapsedSize / 2,
              }}
              animate={{
                y: -panelOffset,
                width: panelWidth,
                height: "auto",
                borderRadius: panelRadius,
                transition: {
                  ...SPRING_TRANSITION,
                  delay: 0.15,
                  y: {
                    ...SPRING_TRANSITION,
                    delay: 0,
                  },
                },
              }}
              exit={{
                y: 0,
                width: collapsedSize,
                height: collapsedSize,
                borderRadius: collapsedSize / 2,
                transition: {
                  ...SPRING_TRANSITION,
                  y: {
                    ...SPRING_TRANSITION,
                    delay: 0.15,
                  },
                },
              }}
              className={cn(
                "absolute bottom-0 left-1/2 overflow-hidden border border-white/10 bg-black text-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]",
                "-translate-x-1/2",
                panelClassName,
              )}
            >
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                className={cn("grid gap-3 p-4", contentClassName)}
              >
                {hasCustomChildren ? children : null}

                {hasDefaultContent ? (
                  <>
                    {title || meta || description ? (
                      <div className="grid gap-2">
                        {(title || meta) && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm tracking-tight text-white/55">
                              {title}
                            </span>
                            {meta ? (
                              <span className="text-right text-sm tracking-tight text-white/55">
                                {meta}
                              </span>
                            ) : null}
                          </div>
                        )}
                        {description ? (
                          <p className="text-xs leading-5 text-white/45">
                            {description}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {items?.map((item, index) => (
                      <React.Fragment key={item.id ?? index}>
                        {renderItem ? renderItem(item, index) : <DefaultItemRow item={item} />}
                      </React.Fragment>
                    ))}

                    {footer ? (
                      <div
                        className={cn(
                          items?.length ? "border-t border-white/10 pt-3" : "pt-1",
                        )}
                      >
                        {footer}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          ref={triggerRef}
          data-gooey-trigger="true"
          type="button"
          aria-label={triggerAriaLabel}
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={togglePanel}
          className={cn(
            "relative z-10 flex cursor-pointer items-center justify-center rounded-full bg-black text-white transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70",
            "disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
          style={{
            width: collapsedSize,
            height: collapsedSize,
          }}
        >
          {trigger ?? <NextMark />}
        </button>
      </div>
    </div>
  );
}

export default GooeyHoverCard;
