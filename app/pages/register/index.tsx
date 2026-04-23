import * as React from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { Link } from "react-router";

import {
  AuthInput,
  AuthMessage,
  AuthPasswordInput,
  AuthShell,
  getAuthErrorMessage,
} from "@/components/auth/auth-shell";
import {
  requestRegisterEmailCode,
  registerUser,
  type RegisterResponse,
} from "@/lib/app-api";

interface RegisterPageData {
  seo: {
    title: string;
    description: string;
  };
}

const registerPageData: RegisterPageData = {
  seo: {
    title: "注册灵犀数据",
    description: "创建用户账号，完成邮箱验证码校验后即可进入灵犀数据用户端。",
  },
};

function buildRegisterName(email: string) {
  const localPart = email.trim().split("@")[0] ?? "";
  const normalized = localPart
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "")
    .slice(0, 24);

  return normalized || "灵犀用户";
}

export function RegisterPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");
  const [cooldownSeconds, setCooldownSeconds] = React.useState(0);
  const [sendingCode, setSendingCode] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [debugCode, setDebugCode] = React.useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = React.useState<RegisterResponse | null>(
    null,
  );
  const registerName = React.useMemo(() => buildRegisterName(email), [email]);

  React.useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  async function handleSendEmailCode() {
    if (!email.trim()) {
      setErrorMessage("请先输入注册邮箱。");
      return;
    }

    setSendingCode(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setDebugCode(null);

    try {
      const result = await requestRegisterEmailCode({ email: email.trim() });

      setCooldownSeconds(
        typeof result.cooldown_seconds === "number" && result.cooldown_seconds > 0
          ? result.cooldown_seconds
          : 60,
      );
      setDebugCode(typeof result.debug_code === "string" ? result.debug_code : null);
      setStatusMessage("验证码请求已发送，请查看邮箱后继续注册。");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password || !emailCode.trim()) {
      setErrorMessage("请完整填写邮箱、密码和邮箱验证码。");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致，请重新确认。");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const result = await registerUser({
        email: email.trim(),
        name: registerName,
        password,
        email_verification_code: emailCode.trim(),
      });

      setRegisteredUser(result);
      setStatusMessage("注册成功。当前注册接口不会自动登录，请继续使用登录页进入系统。");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      mode="register"
      title="欢迎使用灵犀数据平台"
      helperText="已有账号？"
      helperActionLabel="前往登录"
      helperActionTo="/login"
      emailHint="通过邮箱创建账号"
    >
      {registeredUser ? (
        <div className="space-y-4">
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div className="space-y-2">
                <p className="text-[16px] font-semibold">注册成功</p>
                <p className="text-[13px] leading-6 text-emerald-900/80">
                  {registeredUser.name || registerName}，你的账号已经创建完成。当前注册接口不会自动登录，请继续前往登录页进入系统。
                </p>
                <div className="rounded-[8px] bg-white/80 px-4 py-3 text-[13px] leading-6 text-emerald-900/85">
                  <p>注册邮箱：{registeredUser.email || email}</p>
                  {registeredUser.user_id ? <p>用户 ID：{registeredUser.user_id}</p> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-[6px] bg-[#635bff] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#534cf0]"
            >
              前往登录
            </Link>
            <Link
              to="/"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-[6px] border border-black/10 bg-white px-4 text-[14px] font-medium text-[#60636b] transition-colors hover:bg-[#fafbff]"
            >
              返回首页
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-[14px]" onSubmit={handleSubmit}>
          <AuthInput
            type="email"
            autoComplete="email"
            aria-label="注册邮箱"
            placeholder="邮箱"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <AuthInput
            type="text"
            inputMode="numeric"
            aria-label="邮箱验证码"
            placeholder="邮箱验证码"
            value={emailCode}
            onChange={(event) => setEmailCode(event.target.value)}
            inputClassName="pr-16"
            endAdornment={
              sendingCode ? (
                <div className="flex size-8 items-center justify-center text-[#a2a4a8]">
                  <LoaderCircle className="size-4 animate-spin" />
                </div>
              ) : cooldownSeconds > 0 ? (
                <div className="min-w-[38px] text-center text-[12px] font-semibold tabular-nums text-[#8f959e]">
                  {cooldownSeconds}s
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  className="flex size-8 items-center justify-center rounded-[6px] text-[#635bff] transition-colors hover:bg-[#f3f2ff] hover:text-[#534cf0]"
                  aria-label="发送邮箱验证码"
                >
                  <ArrowRight className="size-4" strokeWidth={2.2} />
                </button>
              )
            }
          />

          <AuthPasswordInput
            autoComplete="new-password"
            aria-label="登录密码"
            placeholder="请设置密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <AuthPasswordInput
            autoComplete="new-password"
            aria-label="确认密码"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {statusMessage ? <AuthMessage>{statusMessage}</AuthMessage> : null}

          {debugCode ? (
            <AuthMessage className="border-amber-200 bg-amber-50 text-amber-900">
              <p className="font-medium">开发环境验证码</p>
              <p className="mt-1 font-mono tracking-[0.18em]">{debugCode}</p>
            </AuthMessage>
          ) : null}

          {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[#635bff] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#534cf0] disabled:cursor-not-allowed disabled:bg-[#c6c2ff]"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                注册中
              </>
            ) : (
              "立即注册"
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export function getRegisterMeta() {
  return [
    { title: registerPageData.seo.title },
    { name: "description", content: registerPageData.seo.description },
  ];
}
