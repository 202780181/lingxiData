import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type AppDialogSize = "compact" | "settings" | "account" | "wide";
type AppDialogAlign = "start" | "center";

interface AppDialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  size?: AppDialogSize;
  align?: AppDialogAlign;
  className?: string;
  overlayClassName?: string;
}

export function AppDialog({
  open,
  onClose,
  labelledBy,
  children,
  size = "compact",
  align = "start",
  className,
  overlayClassName,
}: AppDialogProps) {
  React.useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      data-align={align}
      className={cn("app-dialog-overlay", overlayClassName)}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        data-size={size}
        className={cn("app-dialog-surface", className)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>,
    document.body,
  );
}

export function AppDialogCloseButton({
  className,
  label = "关闭",
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn("app-dialog-close", className)}
      {...props}
    >
      <X className="size-5" strokeWidth={1.9} />
    </button>
  );
}
