import * as React from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import {
  AuthInput,
  AuthMessage,
  AuthPasswordInput,
  AuthShell,
  getAuthErrorMessage,
} from "@/components/auth/auth-shell";
import {
  getLoginCaptcha,
  loginUser,
  type LoginCaptchaResponse,
} from "@/lib/app-api";

interface LoginPageData {
  seo: {
    title: string;
    description: string;
  };
}

const loginPageData: LoginPageData = {
  seo: {
    title: "登录灵犀数据",
    description: "通过邮箱、密码和图形验证码登录灵犀数据用户端。",
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [captchaAnswer, setCaptchaAnswer] = React.useState("");
  const [captcha, setCaptcha] = React.useState<LoginCaptchaResponse | null>(null);
  const [loadingCaptcha, setLoadingCaptcha] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadCaptcha = React.useCallback(
    async ({ preserveError = false }: { preserveError?: boolean } = {}) => {
      setLoadingCaptcha(true);

      try {
        const result = await getLoginCaptcha();
        setCaptcha(result);
        setCaptchaAnswer("");

        if (!preserveError) {
          setErrorMessage(null);
        }
      } catch (error) {
        if (!preserveError) {
          setErrorMessage(getAuthErrorMessage(error));
        }
      } finally {
        setLoadingCaptcha(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password || !captchaAnswer.trim() || !captcha?.token) {
      setErrorMessage("请完整填写邮箱、密码和图形验证码。");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await loginUser({
        email: email.trim(),
        password,
        image_captcha_token: captcha.token,
        image_captcha_answer: captchaAnswer.trim(),
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      await loadCaptcha({ preserveError: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      title="欢迎使用灵犀数据"
      helperText="还没有账号？"
      helperActionLabel="免费注册"
      helperActionTo="/register"
      emailHint="或通过邮箱登录"
    >
      <form className="space-y-[14px]" onSubmit={handleSubmit}>
        <AuthInput
          type="email"
          autoComplete="username"
          aria-label="登录邮箱"
          placeholder="邮箱"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthPasswordInput
          autoComplete="current-password"
          aria-label="登录密码"
          placeholder="请输入密码"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="grid grid-cols-[minmax(0,1fr)_118px] gap-2.5">
          <AuthInput
            type="text"
            aria-label="图形验证码"
            placeholder="图形验证码"
            value={captchaAnswer}
            onChange={(event) => setCaptchaAnswer(event.target.value)}
          />

          <button
            type="button"
            onClick={() => void loadCaptcha()}
            className="group flex h-10 items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-white px-3 transition-[border-color,background-color] hover:border-black/15 hover:bg-[#fafbff]"
            aria-label="刷新图形验证码"
          >
            <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
              {loadingCaptcha ? (
                <LoaderCircle className="size-4 animate-spin text-[#a2a4a8]" />
              ) : captcha?.image_data_url ? (
                <img
                  src={captcha.image_data_url}
                  alt="图形验证码"
                  className="h-5 w-full object-contain"
                />
              ) : (
                <span className="text-[12px] text-[#8f959e]">重新获取</span>
              )}
            </div>
            <RefreshCw className="size-3.5 shrink-0 text-[#a2a4a8] transition-colors group-hover:text-[#60636b]" />
          </button>
        </div>

        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[#635bff] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#534cf0] disabled:cursor-not-allowed disabled:bg-[#c6c2ff]"
          disabled={submitting || loadingCaptcha || !captcha}
        >
          {submitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              登录中
            </>
          ) : (
            "登录"
          )}
        </button>

        <button
          type="button"
          className="mt-[16px] inline-flex w-full items-center justify-center text-[14px] font-medium text-[#635bff] transition-colors hover:text-[#534cf0]"
        >
          忘记密码
        </button>
      </form>
    </AuthShell>
  );
}

export function getLoginMeta() {
  return [
    { title: loginPageData.seo.title },
    { name: "description", content: loginPageData.seo.description },
  ];
}
