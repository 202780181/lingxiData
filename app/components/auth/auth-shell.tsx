import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";

import { AppApiError } from "@/lib/app-api";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  mode: "login" | "register";
  title: string;
  helperText: string;
  helperActionLabel: string;
  helperActionTo: string;
  emailHint: string;
  children: React.ReactNode;
}

interface AuthInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon?: LucideIcon;
  error?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  endAdornment?: React.ReactNode;
}

const authFontFamily =
  "Outfit, Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";

const authBrandName = "灵犀数据";

export function AuthShell({
  mode,
  title,
  helperText,
  helperActionLabel,
  helperActionTo,
  emailHint,
  children,
}: AuthShellProps) {
  return (
    <main
      className="is-oversea relative min-h-svh overflow-hidden bg-[#f7f7f9] text-[#06061f]"
      style={{ fontFamily: authFontFamily }}
      data-auth-mode={mode}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/auth/pixso-oversea-bg.svg')" }}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[394px] lg:block">
        <img
          src="/auth/pixso-oversea-left.png"
          alt=""
          className="absolute bottom-0 left-0 w-[618px] max-w-[45vw] select-none"
        />
        <img
          src="/auth/pixso-oversea-right.png"
          alt=""
          className="absolute bottom-0 right-0 w-[618px] max-w-[45vw] select-none"
        />
      </div>

      <Link
        to="/"
        className="absolute left-5 top-6 z-20 inline-flex items-center gap-3 md:left-[30px] md:top-[30px]"
        aria-label="返回首页"
      >
        <div className="grid size-9 place-items-center rounded-[12px] bg-[linear-gradient(135deg,#586dff_0%,#22c3ff_48%,#2dd4bf_100%)] shadow-[0_12px_26px_rgba(71,114,255,0.22)]">
          <div className="flex items-end gap-[2px]">
            <span className="h-3 w-1.5 rounded-full bg-white/92" />
            <span className="h-4.5 w-1.5 rounded-full bg-white/78" />
            <span className="h-3.5 w-1.5 rounded-full bg-white/62" />
          </div>
        </div>
        <span className="text-[20px] font-semibold tracking-[-0.03em] text-[#06061f]">
          {authBrandName}
        </span>
      </Link>

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1440px] items-center justify-center px-5 py-24 sm:px-8 lg:px-12 xl:px-[88px]">
        <section className="login-pixso--container__right login-pixso--container__right_oversea relative z-10 w-full max-w-[474px] rounded-[12px] bg-white shadow-[0_8px_16px_rgba(31,19,135,0.04),0_0_2px_rgba(17,30,58,0.2)]">
          <div className="px-6 py-8 sm:px-[58px] sm:py-[50px]">
            <div className="oversideSignin-page--wrapper mx-auto w-full max-w-[358px]">
              <h1 className="oversea-page--title text-center text-[28px] font-semibold leading-[35px] tracking-[-0.02em] text-[#06061f]">
                {title}
              </h1>

              <div className="oversea-page-tips mt-3 flex items-center justify-center text-[14px] leading-[18px]">
                <span className="text-[#8f959e]">{helperText}</span>
                <Link
                  to={helperActionTo}
                  className="ml-1 font-medium text-[#635bff] transition-colors hover:text-[#534cf0]"
                >
                  {helperActionLabel}
                </Link>
              </div>

              <div className="oversea-page-tips-email mt-[14px] text-center text-[14px] leading-5 text-[#8f959e]">
                {emailHint}
              </div>

              <div className="mt-[14px]">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthInput({
  icon: Icon,
  error = false,
  wrapperClassName,
  inputClassName,
  endAdornment,
  disabled,
  ...props
}: AuthInputProps) {
  return (
    <div
      className={cn(
        "group/auth relative flex h-10 items-center rounded-[8px] border bg-white transition-[border-color,box-shadow,background-color]",
        error
          ? "border-rose-300 shadow-[0_0_0_3px_rgba(251,113,133,0.08)]"
          : "border-black/10 hover:border-black/15 focus-within:border-[#635bff] focus-within:shadow-[0_0_0_3px_rgba(99,91,255,0.12)]",
        disabled ? "cursor-not-allowed bg-[#f7f7fa] opacity-70" : "cursor-text",
        wrapperClassName,
      )}
    >
      {Icon ? (
        <div className="pl-[14px] text-[#a2a4a8] transition-colors group-focus-within/auth:text-[#635bff]">
          <Icon className="size-4" strokeWidth={1.9} />
        </div>
      ) : null}

      <input
        disabled={disabled}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-[#06061f] outline-none placeholder:text-[#b0b3bc] disabled:cursor-not-allowed",
          Icon ? "pl-2.5" : "pl-[14px]",
          endAdornment ? "pr-11" : "pr-[14px]",
          inputClassName,
        )}
        {...props}
      />

      {endAdornment ? (
        <div className="absolute inset-y-0 right-2 flex items-center">
          {endAdornment}
        </div>
      ) : null}
    </div>
  );
}

export function AuthPasswordInput(
  props: Omit<AuthInputProps, "type" | "endAdornment">,
) {
  const [visible, setVisible] = React.useState(false);

  return (
    <AuthInput
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="flex size-7 items-center justify-center rounded-[6px] text-[#a2a4a8] transition-colors hover:bg-black/[0.04] hover:text-[#60636b]"
          aria-label={visible ? "隐藏密码" : "显示密码"}
        >
          {visible ? (
            <Eye className="size-4" strokeWidth={1.9} />
          ) : (
            <EyeOff className="size-4" strokeWidth={1.9} />
          )}
        </button>
      }
    />
  );
}

export function AuthMessage({
  tone = "info",
  className,
  children,
}: {
  tone?: "error" | "info" | "success";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[8px] border px-3 py-2.5 text-[12px] leading-[18px]",
        tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-sky-200 bg-sky-50 text-sky-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof AppApiError) {
    switch (error.code) {
      case "INVALID_REQUEST":
        return "提交信息不完整或格式不正确，请检查后重试。";
      case "INVALID_VERIFICATION_CODE":
        return "邮箱验证码不正确或已过期，请重新获取。";
      case "UNAUTHORIZED":
        return "邮箱、密码或验证码不正确，请重新输入。";
      case "RATE_LIMITED":
        return "操作过于频繁，请稍后再试。";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "请求失败，请稍后重试。";
}
