import * as React from "react";
import { CheckCircle2, LoaderCircle, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  AppApiError,
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
    description: "创建用户账号，完成邮箱验证码校验后即可开始初始化工作区。",
  },
};

const registerHighlights = [
  {
    title: "工作区初始化",
    description: "注册成功后进入工作区创建流程，建立你的团队空间。",
  },
  {
    title: "小红书账号绑定",
    description: "后续可通过扫码方式绑定业务账号，开始采集和发布闭环。",
  },
  {
    title: "Dashboard 与发布中心",
    description: "当前后端已经具备 Dashboard V1 和发布任务执行闭环能力。",
  },
];

function getErrorMessage(error: unknown) {
  if (error instanceof AppApiError) {
    switch (error.code) {
      case "INVALID_REQUEST":
        return "提交参数不完整或格式不正确，请检查后重试。";
      case "INVALID_VERIFICATION_CODE":
        return "邮箱验证码不正确或已过期，请重新获取。";
      case "UNAUTHORIZED":
        return "当前会话无效，请刷新后重试。";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "请求失败，请稍后重试。";
}

export function RegisterPage() {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
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
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !name.trim() || !password || !emailCode.trim()) {
      setErrorMessage("请完整填写邮箱、姓名、密码和邮箱验证码。");
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
        name: name.trim(),
        password,
        email_verification_code: emailCode.trim(),
      });

      setRegisteredUser(result);
      setStatusMessage("注册成功。当前后端注册接口不会自动登录，后续可继续接入登录页。");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh bg-[#f1f2f5] text-slate-900">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-4 py-6 md:px-6 lg:py-8">
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/72 px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur"
          >
            <div className="grid size-9 place-items-center rounded-2xl bg-[linear-gradient(135deg,#586dff_0%,#22c3ff_48%,#2dd4bf_100%)] text-white shadow-[0_12px_24px_rgba(71,114,255,0.22)]">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">灵犀数据</p>
              <p className="text-[11px] tracking-[0.16em] text-slate-500">
                USER APP REGISTER
              </p>
            </div>
          </Link>

          <Button asChild variant="outline" className="rounded-full px-5">
            <Link to="/">返回首页</Link>
          </Button>
        </header>

        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <section className="flex flex-col justify-center">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50/80 px-4 py-2 text-sm font-medium text-sky-900">
                <ShieldCheck className="size-4" />
                用户端第一阶段优先能力
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  先把账号注册打通，
                  <span className="block text-slate-500">后续登录与工作区初始化再继续接。</span>
                </h1>
                <p className="text-base leading-8 text-slate-600 md:text-lg">
                  当前页面已对接用户端 `/api/v1/app` 注册流程，支持邮箱验证码发送与注册提交。
                  后端成功注册后不会自动登录，所以这一步完成后会先给出成功提示。
                </p>
              </div>

              <div className="grid gap-3">
                {registerHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[20px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_42px_rgba(148,163,184,0.08)] backdrop-blur"
                  >
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xl rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,250,252,0.86))] p-6 shadow-[0_30px_80px_rgba(148,163,184,0.12)] backdrop-blur-xl md:p-8">
              <div className="mb-6 space-y-2">
                <p className="text-sm font-medium tracking-[0.16em] text-slate-400 uppercase">
                  Register
                </p>
                <h2 className="text-2xl font-semibold text-slate-950">创建你的用户账号</h2>
                <p className="text-sm leading-7 text-slate-500">
                  按照后端当前能力，先完成邮箱验证码校验与注册提交流程。
                </p>
              </div>

              {registeredUser ? (
                <div className="rounded-[22px] border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-950">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <div className="space-y-2">
                      <p className="text-base font-semibold">注册成功</p>
                      <p className="text-sm leading-7 text-emerald-900/80">
                        {registeredUser.name || name}，你的账号已创建完成。
                        当前后端注册接口不会自动登录，下一步建议继续实现登录页与工作区初始化。
                      </p>
                      <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-emerald-900/85">
                        <p>注册邮箱：{registeredUser.email || email}</p>
                        {registeredUser.user_id ? <p>用户 ID：{registeredUser.user_id}</p> : null}
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button asChild className="rounded-full px-5">
                          <Link to="/">返回首页</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">邮箱</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white/78 px-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      placeholder="请输入邮箱地址"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">姓名</span>
                      <input
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white/78 px-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="例如：Aaron"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">邮箱验证码</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={emailCode}
                          onChange={(event) => setEmailCode(event.target.value)}
                          className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/78 px-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                          placeholder="6 位验证码"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 shrink-0 rounded-2xl px-4"
                          disabled={sendingCode || cooldownSeconds > 0}
                          onClick={handleSendEmailCode}
                        >
                          {sendingCode ? (
                            <>
                              <LoaderCircle className="size-4 animate-spin" />
                              发送中
                            </>
                          ) : cooldownSeconds > 0 ? (
                            `${cooldownSeconds}s`
                          ) : (
                            "发送验证码"
                          )}
                        </Button>
                      </div>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">密码</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white/78 px-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="请输入密码"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">确认密码</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white/78 px-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="请再次输入密码"
                      />
                    </label>
                  </div>

                  {statusMessage ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                      {statusMessage}
                    </div>
                  ) : null}

                  {debugCode ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="font-medium">开发环境验证码</p>
                          <p className="mt-1 font-mono tracking-[0.18em]">{debugCode}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {errorMessage ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                      {errorMessage}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-2xl text-sm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        提交注册中
                      </>
                    ) : (
                      "完成注册"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function getRegisterMeta() {
  return [
    { title: registerPageData.seo.title },
    { name: "description", content: registerPageData.seo.description },
  ];
}
