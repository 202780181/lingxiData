import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--app-radius-control)] border border-transparent bg-clip-padding text-[14px] leading-5 font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-white/45 bg-[linear-gradient(135deg,rgba(14,165,233,0.88),rgba(37,99,235,0.82))] text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)] backdrop-blur-xl hover:brightness-105",
        outline:
          "border-white/55 bg-white/30 text-slate-800 shadow-[0_14px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:bg-white/42 hover:text-slate-950 aria-expanded:bg-white/42 aria-expanded:text-slate-950 dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:bg-white/12",
        secondary:
          "border-white/40 bg-white/18 text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:bg-white/28 aria-expanded:bg-white/28 aria-expanded:text-slate-900 dark:border-white/10 dark:bg-white/6 dark:text-white",
        ghost:
          "border-transparent bg-transparent hover:border-white/40 hover:bg-white/18 hover:text-slate-900 hover:backdrop-blur-xl aria-expanded:border-white/40 aria-expanded:bg-white/18 aria-expanded:text-slate-900 dark:hover:bg-white/8 dark:hover:text-white",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[var(--app-control-height)] gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-7 gap-1 rounded-[var(--app-radius-control)] px-2 text-[12px] leading-4 in-data-[slot=button-group]:rounded-[var(--app-radius-control)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[var(--app-control-height-sm)] gap-1 rounded-[var(--app-radius-control)] px-2.5 text-[12px] leading-4 in-data-[slot=button-group]:rounded-[var(--app-radius-control)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        icon: "size-[var(--app-control-height)]",
        "icon-xs":
          "size-7 rounded-[var(--app-radius-control)] in-data-[slot=button-group]:rounded-[var(--app-radius-control)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-[var(--app-control-height-sm)] rounded-[var(--app-radius-control)] in-data-[slot=button-group]:rounded-[var(--app-radius-control)]",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
