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

interface AuthInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  icon?: LucideIcon;
  error?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  endAdornment?: React.ReactNode;
}

interface AuthEmailInputProps extends Omit<
  AuthInputProps,
  "type" | "value" | "onChange"
> {
  value: string;
  onValueChange: (value: string) => void;
}

const authFontFamily =
  "Outfit, Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";

const authBrandName = "灵犀数据";

const emailDomainSuggestions = [
  { domain: "qq.com", label: "QQ 邮箱" },
  { domain: "gmail.com", label: "Google 邮箱" },
  { domain: "outlook.com", label: "微软邮箱" },
  { domain: "hotmail.com", label: "微软邮箱" },
  { domain: "live.com", label: "微软邮箱" },
  { domain: "163.com", label: "网易邮箱" },
  { domain: "126.com", label: "网易邮箱" },
  { domain: "yeah.net", label: "网易邮箱" },
  { domain: "aliyun.com", label: "阿里邮箱" },
] as const;

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
        className="absolute left-4 top-5 z-20 inline-flex items-center gap-2.5 md:left-6 md:top-6"
        aria-label="返回首页"
      >
        <div className="grid size-8 place-items-center rounded-[10px] bg-[linear-gradient(135deg,#586dff_0%,#22c3ff_48%,#2dd4bf_100%)] shadow-[0_10px_22px_rgba(71,114,255,0.2)]">
          <div className="flex items-end gap-[2px]">
            <span className="h-3 w-1.5 rounded-full bg-white/92" />
            <span className="h-4.5 w-1.5 rounded-full bg-white/78" />
            <span className="h-3.5 w-1.5 rounded-full bg-white/62" />
          </div>
        </div>
        <span className="text-[var(--app-auth-brand-size)] font-semibold tracking-[-0.03em] text-[#06061f]">
          {authBrandName}
        </span>
      </Link>

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1440px] items-center justify-center px-5 py-20 sm:px-8 lg:px-12 xl:px-20">
        <section className="login-pixso--container__right login-pixso--container__right_oversea relative z-10 w-full max-w-[var(--app-auth-card-width)] rounded-[var(--app-radius-panel)] bg-white shadow-[0_10px_24px_rgba(31,19,135,0.04),0_0_2px_rgba(17,30,58,0.18)]">
          <div className="px-6 py-7 sm:px-10 sm:py-9">
            <div className="oversideSignin-page--wrapper mx-auto w-full max-w-[340px]">
              <h1 className="oversea-page--title text-center text-[var(--app-auth-title-size)] font-semibold leading-[30px] tracking-[-0.02em] text-[#06061f]">
                {title}
              </h1>

              <div className="oversea-page-tips mt-2.5 flex items-center justify-center text-[var(--app-auth-helper-size)] leading-5">
                <span className="text-[#8f959e]">{helperText}</span>
                <Link
                  to={helperActionTo}
                  className="ml-1 font-medium text-[#635bff] transition-colors hover:text-[#534cf0]"
                >
                  {helperActionLabel}
                </Link>
              </div>

              <div className="oversea-page-tips-email mt-3 text-center text-[var(--app-auth-helper-size)] leading-5 text-[#8f959e]">
                {emailHint}
              </div>

              <div className="mt-3.5">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    {
      icon: Icon,
      error = false,
      wrapperClassName,
      inputClassName,
      endAdornment,
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <div
        className={cn(
          "group/auth relative flex h-[var(--app-auth-input-height)] items-center rounded-[var(--app-radius-control)] border bg-white transition-[border-color,box-shadow,background-color]",
          error
            ? "border-rose-300 shadow-[0_0_0_3px_rgba(251,113,133,0.08)]"
            : "border-black/10 hover:border-black/15 focus-within:border-[#635bff] focus-within:shadow-[0_0_0_3px_rgba(99,91,255,0.12)]",
          disabled
            ? "cursor-not-allowed bg-[#f7f7fa] opacity-70"
            : "cursor-text",
          wrapperClassName,
        )}
      >
        {Icon ? (
          <div className="pl-3.5 text-[#a2a4a8] transition-colors group-focus-within/auth:text-[#635bff]">
            <Icon className="size-4" strokeWidth={1.9} />
          </div>
        ) : null}

        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-[#06061f] outline-none placeholder:text-[#b0b3bc] disabled:cursor-not-allowed",
            Icon ? "pl-2.5" : "pl-3.5",
            endAdornment ? "pr-10" : "pr-3.5",
            inputClassName,
          )}
          {...props}
        />

        {endAdornment ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            {endAdornment}
          </div>
        ) : null}
      </div>
    );
  },
);

export function AuthEmailInput({
  value,
  onValueChange,
  disabled,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: AuthEmailInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();
  const [isFocused, setIsFocused] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [suppressSuggestions, setSuppressSuggestions] = React.useState(false);

  const suggestions = React.useMemo(
    () => buildEmailSuggestions(value),
    [value],
  );
  const hasExactSuggestionMatch = React.useMemo(
    () =>
      suggestions.some(
        (suggestion) =>
          suggestion.value.toLowerCase() === value.trim().toLowerCase(),
      ),
    [suggestions, value],
  );

  React.useEffect(() => {
    if (!isFocused || disabled) {
      setIsOpen(false);
      return;
    }

    if (suppressSuggestions) {
      return;
    }

    setIsOpen(suggestions.length > 0 && !hasExactSuggestionMatch);
  }, [
    disabled,
    hasExactSuggestionMatch,
    isFocused,
    suggestions.length,
    suppressSuggestions,
  ]);

  React.useEffect(() => {
    if (!suggestions.length) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => Math.min(current, suggestions.length - 1));
  }, [suggestions]);

  function applySuggestion(nextValue: string) {
    onValueChange(nextValue);
    setSuppressSuggestions(true);
    setIsOpen(false);
    setActiveIndex(0);

    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextValue.length, nextValue.length);
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSuppressSuggestions(false);
    onValueChange(event.target.value);
  }

  function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    setIsOpen(false);
    onBlur?.(event);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);

    if (event.defaultPrevented || !suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length,
      );
      return;
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      applySuggestion(suggestions[activeIndex].value);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <AuthInput
        {...props}
        ref={inputRef}
        type="text"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          isOpen ? `${listboxId}-option-${activeIndex}` : undefined
        }
      />

      {isOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_12px_24px_rgba(12,18,28,0.1)]">
          <ul id={listboxId} role="listbox" className="py-1">
            {suggestions.map((suggestion, index) => {
              const isActive = index === activeIndex;

              return (
                <li key={suggestion.domain} role="presentation">
                  <button
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors",
                      isActive ? "bg-[#f3f2ff]" : "hover:bg-[#f7f7fb]",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      applySuggestion(suggestion.value);
                    }}
                  >
                    <span className="min-w-0 truncate text-[14px] font-medium text-[#06061f]">
                      {suggestion.value}
                    </span>
                    <span className="shrink-0 text-[11px] text-[#8f959e]">
                      {suggestion.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
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
          className="flex size-[26px] items-center justify-center rounded-[6px] text-[#a2a4a8] transition-colors hover:bg-black/[0.04] hover:text-[#60636b]"
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

function buildEmailSuggestions(value: string) {
  const trimmedValue = value.trim();
  const atIndex = trimmedValue.indexOf("@");

  if (atIndex <= 0) {
    return [];
  }

  const localPart = trimmedValue.slice(0, atIndex);
  const domainQuery = trimmedValue.slice(atIndex + 1).toLowerCase();

  if (!localPart || /\s/.test(localPart) || /\s/.test(domainQuery)) {
    return [];
  }

  return emailDomainSuggestions
    .filter((item) => item.domain.startsWith(domainQuery))
    .map((item) => ({
      ...item,
      value: `${localPart}@${item.domain}`,
    }));
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
        "rounded-[10px] border px-3 py-2 text-[12px] leading-[18px]",
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
    const normalizedMessage = error.message.trim().toLowerCase();

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
        if (
          normalizedMessage === "invalid email or password" ||
          normalizedMessage === "invalid credentials"
        ) {
          return "用户名或密码错误";
        }

        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "请求失败，请稍后重试。";
}
