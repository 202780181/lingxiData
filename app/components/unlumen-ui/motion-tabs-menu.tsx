"use client";

import * as React from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Variants,
} from "motion/react";

import { cn } from "@/lib/utils";

export interface MotionTabsMenuItem {
  key: React.Key;
  icon: React.ReactNode;
  label?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

type MotionTabsMenuSemanticDOM =
  | "root"
  | "card"
  | "contentViewport"
  | "contentPanel"
  | "tabList"
  | "tabButton"
  | "tabSurface";

export interface MotionTabsMenuProps {
  items: MotionTabsMenuItem[];
  activeKey?: React.Key;
  defaultActiveKey?: React.Key;
  onChange?: (activeKey: React.Key) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsedWidth?: number;
  expandedWidth?: number;
  frameHeight?: number | string;
  collapseOnClickOutside?: boolean;
  className?: string;
  style?: React.CSSProperties;
  classNames?: Partial<Record<MotionTabsMenuSemanticDOM, string>>;
  styles?: Partial<Record<MotionTabsMenuSemanticDOM, React.CSSProperties>>;
}

const springTransition = {
  type: "spring",
  stiffness: 265,
  damping: 24,
  mass: 0.88,
} as const;

const contentSpring = {
  type: "spring",
  stiffness: 215,
  damping: 24,
  mass: 0.9,
} as const;

const contentVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 24 : -24,
    y: 0,
    rotateY: direction >= 0 ? -16 : 16,
    scale: 0.988,
    filter: "blur(3px)",
    transformPerspective: 900,
    transformOrigin: direction >= 0 ? "100% 50%" : "0% 50%",
  }),
  active: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",
    transition: {
      x: {
        ...contentSpring,
        stiffness: 245,
        damping: 26,
      },
      rotateY: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      scale: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      filter: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -22 : 22,
    y: 0,
    rotateY: direction >= 0 ? 14 : -14,
    scale: 0.988,
    filter: "blur(3px)",
    transformPerspective: 900,
    transformOrigin: direction >= 0 ? "0% 50%" : "100% 50%",
    transition: {
      x: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
      rotateY: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
      filter: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
    },
  }),
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function keyToString(key: React.Key) {
  return String(key);
}

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
  const mergedValueRef = React.useRef(mergedValue);

  React.useEffect(() => {
    mergedValueRef.current = mergedValue;
  }, [mergedValue]);

  const setValue = React.useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      if (!Object.is(mergedValueRef.current, nextValue)) {
        onChange?.(nextValue);
      }
    },
    [isControlled, onChange],
  );

  return [mergedValue, setValue] as const;
}

function useMeasuredHeight<T extends HTMLElement>() {
  const [node, setNode] = React.useState<T | null>(null);
  const [height, setHeight] = React.useState(0);

  const ref = React.useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!node) {
      return;
    }

    const updateHeight = () => {
      setHeight(node.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node]);

  return { height, ref };
}

export function MotionTabsMenu({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  open,
  defaultOpen = false,
  onOpenChange,
  collapsedWidth = 212,
  expandedWidth = 288,
  frameHeight = 240,
  collapseOnClickOutside = true,
  className,
  style,
  classNames,
  styles,
}: MotionTabsMenuProps) {
  const normalizedItems = React.useMemo(
    () => items.map((item) => ({ ...item, __key: keyToString(item.key) })),
    [items],
  );

  const fallbackActiveKey = normalizedItems[0]?.key;

  const [mergedActiveKey, setMergedActiveKey] = useControllableState<
    React.Key | undefined
  >({
    value: activeKey,
    defaultValue: defaultActiveKey ?? fallbackActiveKey,
    onChange: (nextActiveKey) => {
      if (nextActiveKey !== undefined) {
        onChange?.(nextActiveKey);
      }
    },
  });

  const [mergedOpen, setMergedOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [hoveredKey, setHoveredKey] = React.useState<React.Key | null>(null);
  const [direction, setDirection] = React.useState(1);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { height: contentHeight, ref: contentRef } =
    useMeasuredHeight<HTMLDivElement>();

  const instanceId = React.useId();
  const safeActiveKey =
    normalizedItems.find((item) => item.__key === keyToString(mergedActiveKey ?? ""))?.key ??
    fallbackActiveKey;

  const activeIndex = normalizedItems.findIndex(
    (item) => item.__key === keyToString(safeActiveKey ?? ""),
  );

  const activeItem = normalizedItems.find(
    (item) => item.__key === keyToString(safeActiveKey ?? ""),
  );

  React.useEffect(() => {
    if (!collapseOnClickOutside) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMergedOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [collapseOnClickOutside, setMergedOpen]);

  React.useEffect(() => {
    if (mergedOpen) {
      setHoveredKey(null);
    }
  }, [mergedOpen]);

  React.useEffect(() => {
    if (!normalizedItems.length) {
      return;
    }

    const hasActiveItem = normalizedItems.some(
      (item) => item.__key === keyToString(safeActiveKey ?? ""),
    );

    if (!hasActiveItem && fallbackActiveKey !== undefined) {
      setMergedActiveKey(fallbackActiveKey);
    }
  }, [fallbackActiveKey, normalizedItems, safeActiveKey, setMergedActiveKey]);

  const handleSelect = (nextKey: React.Key) => {
    const nextIndex = normalizedItems.findIndex(
      (item) => item.__key === keyToString(nextKey),
    );

    if (nextIndex === -1) {
      return;
    }

    const nextItem = normalizedItems[nextIndex];

    if (nextItem?.disabled) {
      return;
    }

    if (!mergedOpen) {
      if (activeIndex !== -1 && activeIndex !== nextIndex) {
        setDirection(nextIndex > activeIndex ? 1 : -1);
      }

      setHoveredKey(null);
      setMergedActiveKey(nextKey);
      setMergedOpen(true);
      return;
    }

    if (keyToString(nextKey) === keyToString(safeActiveKey ?? "")) {
      return;
    }

    setDirection(nextIndex > activeIndex ? 1 : -1);
    setMergedActiveKey(nextKey);
  };

  if (!normalizedItems.length || safeActiveKey === undefined || !activeItem) {
    return null;
  }

  return (
    <div
      className={cn("relative w-full px-1", className, classNames?.root)}
      style={{
        height: typeof frameHeight === "number" ? `${frameHeight}px` : frameHeight,
        ...style,
        ...styles?.root,
      }}
    >
      <motion.div
        ref={containerRef}
        className={cn(
          "absolute bottom-0 left-1/2 origin-bottom -translate-x-1/2 overflow-hidden rounded-[1.7rem] border border-white/90 bg-[#fbfbf8]/98 px-3.5 py-3 shadow-[0_18px_42px_-34px_rgba(17,24,39,0.12)] backdrop-blur-xl",
          classNames?.card,
        )}
        animate={{ width: mergedOpen ? expandedWidth : collapsedWidth }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 28,
          mass: 0.9,
        }}
        style={{ willChange: "width", ...styles?.card }}
      >
        <motion.div
          animate={{
            height: mergedOpen ? contentHeight : 0,
            opacity: mergedOpen ? 1 : 0,
            marginBottom: mergedOpen ? 12 : 0,
          }}
          transition={{
            height: contentSpring,
            marginBottom: contentSpring,
            opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
          }}
          className={cn(
            "relative origin-bottom overflow-hidden",
            classNames?.contentViewport,
          )}
          style={styles?.contentViewport}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            {mergedOpen ? (
              <motion.div
                key={keyToString(safeActiveKey)}
                ref={contentRef}
                variants={contentVariants}
                initial="initial"
                animate="active"
                exit="exit"
                custom={direction}
                className={cn("min-h-[8.75rem] px-0.5", classNames?.contentPanel)}
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  ...styles?.contentPanel,
                }}
              >
                {activeItem.children}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <LayoutGroup id={`${instanceId}-motion-tabs-menu`}>
          <div className="w-full">
            <motion.div
              layout
              onMouseLeave={() => {
                if (!mergedOpen) {
                  setHoveredKey(null);
                }
              }}
              className={cn(
                "relative z-10 flex min-h-[2.25rem] w-full items-center justify-between",
                classNames?.tabList,
              )}
              role="tablist"
              style={styles?.tabList}
            >
              {normalizedItems.map((item) => {
                const isSelected = item.__key === keyToString(safeActiveKey);
                const isActive = mergedOpen && isSelected;
                const isHovered =
                  !mergedOpen && hoveredKey !== null &&
                  item.__key === keyToString(hoveredKey);
                const showSurface = isActive || isHovered;
                const isExpandedTab = isActive && item.label != null;

                return (
                  <motion.button
                    layout="position"
                    key={item.__key}
                    type="button"
                    role="tab"
                    disabled={item.disabled}
                    aria-selected={isSelected}
                    onMouseEnter={() => {
                      if (!mergedOpen && !item.disabled) {
                        setHoveredKey(item.key);
                      }
                    }}
                    onFocus={() => {
                      if (!mergedOpen && !item.disabled) {
                        setHoveredKey(item.key);
                      }
                    }}
                    onBlur={() => {
                      if (!mergedOpen) {
                        setHoveredKey(null);
                      }
                    }}
                    whileTap={item.disabled ? undefined : { scale: 0.97, y: 0.5 }}
                    transition={springTransition}
                    onClick={() => handleSelect(item.key)}
                    className={cn(
                      "relative flex items-center rounded-full text-[0.78rem] font-semibold tracking-tight transition-colors duration-300 disabled:pointer-events-none disabled:opacity-45",
                      isExpandedTab
                        ? "h-[2.25rem] px-3"
                        : "h-[2.25rem] w-[2.25rem] justify-center px-0",
                      isActive || isHovered
                        ? "text-neutral-800"
                        : "text-neutral-500 hover:text-neutral-700",
                      classNames?.tabButton,
                    )}
                    style={styles?.tabButton}
                  >
                    {showSurface ? (
                      <motion.span
                        layoutId={`${instanceId}-tab-surface`}
                        className={cn(
                          "absolute inset-0 rounded-full bg-[#efefec] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
                          classNames?.tabSurface,
                        )}
                        transition={{
                          ...springTransition,
                          stiffness: 290,
                          damping: 24,
                        }}
                        style={styles?.tabSurface}
                      />
                    ) : null}

                    <span
                      className={cn(
                        "relative inline-flex items-center justify-center",
                        isExpandedTab && "gap-1.5",
                      )}
                    >
                      {item.icon}

                      <AnimatePresence initial={false}>
                        {isExpandedTab ? (
                          <motion.span
                            initial={{ width: 0, opacity: 0, x: -4 }}
                            animate={{
                              width: "auto",
                              opacity: 1,
                              x: 0,
                              transition: {
                                ...contentSpring,
                                delay: 0.05,
                              },
                            }}
                            exit={{
                              width: 0,
                              opacity: 0,
                              x: -2,
                              transition: {
                                duration: 0.18,
                                ease: [0.4, 0, 0.2, 1],
                              },
                            }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
