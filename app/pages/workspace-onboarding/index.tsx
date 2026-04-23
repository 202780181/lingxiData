import * as React from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";

import {
  AuthInput,
  AuthMessage,
  getAuthErrorMessage,
} from "@/components/auth/auth-shell";
import {
  createOnboardingWorkspace,
  getCurrentUser,
  type CreateOnboardingWorkspacePayload,
} from "@/lib/app-api";
import { getAuthenticatedRedirectTarget } from "@/lib/auth-redirect";
import { getUserDisplayName, useAppCurrentUser } from "@/lib/current-user";

interface WorkspaceOnboardingPageData {
  seo: {
    title: string;
    description: string;
  };
}

const workspaceOnboardingPageData: WorkspaceOnboardingPageData = {
  seo: {
    title: "创建工作区",
    description: "首次进入灵犀数据前，请先创建你的工作区。",
  },
};

const onboardingFontFamily =
  "Outfit, Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";

function buildDefaultWorkspaceName(displayName: string) {
  const normalizedDisplayName = displayName.trim();
  return normalizedDisplayName ? `${normalizedDisplayName}的工作区` : "我的工作区";
}

function normalizeWorkspaceSlug(value: string) {
  return value.trim().replace(/\s+/g, "-");
}

export function WorkspaceOnboardingPage() {
  const navigate = useNavigate();
  const currentUser = useAppCurrentUser();
  const displayName = React.useMemo(
    () =>
      currentUser ? getUserDisplayName(currentUser.session) : "灵犀用户",
    [currentUser],
  );
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [workspaceSlug, setWorkspaceSlug] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    setWorkspaceName((currentValue) => {
      if (currentValue.trim()) {
        return currentValue;
      }

      return buildDefaultWorkspaceName(displayName);
    });
  }, [displayName]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workspaceName.trim()) {
      setErrorMessage("请先填写工作区名称。");
      return;
    }

    const payload: CreateOnboardingWorkspacePayload = {
      name: workspaceName.trim(),
    };
    const normalizedSlug = normalizeWorkspaceSlug(workspaceSlug);

    if (normalizedSlug) {
      payload.slug = normalizedSlug;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createOnboardingWorkspace(payload);
      setSuccessMessage("工作区创建成功，正在进入控制台。");

      const refreshedCurrentUser = await getCurrentUser().catch(() => null);

      if (refreshedCurrentUser) {
        navigate(
          getAuthenticatedRedirectTarget(refreshedCurrentUser, "/dashboard"),
          {
            replace: true,
          },
        );
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="relative min-h-svh overflow-hidden bg-[#f7f7f9] text-[#06061f]"
      style={{ fontFamily: onboardingFontFamily }}
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
          灵犀数据
        </span>
      </Link>

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1440px] items-center justify-center px-5 py-24 sm:px-8 lg:px-12 xl:px-[88px]">
        <section className="relative z-10 w-full max-w-[474px] rounded-[12px] bg-white shadow-[0_8px_16px_rgba(31,19,135,0.04),0_0_2px_rgba(17,30,58,0.2)]">
          <div className="px-6 py-8 sm:px-[58px] sm:py-[50px]">
            <div className="mx-auto w-full max-w-[358px]">
              <div className="space-y-3 text-center">
                <span className="inline-flex rounded-full bg-[#f3f2ff] px-3 py-1 text-[12px] font-medium text-[#635bff]">
                  Workspace Onboarding
                </span>
                <h1 className="text-[28px] font-semibold leading-[35px] tracking-[-0.02em] text-[#06061f]">
                  先创建你的工作区
                </h1>
                <p className="text-[14px] leading-6 text-[#8f959e]">
                  {displayName}，首次进入系统前需要先完成工作区初始化，创建后就能直接进入 Dashboard。
                </p>
              </div>

              <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
                <AuthInput
                  type="text"
                  autoComplete="organization"
                  aria-label="工作区名称"
                  placeholder="工作区名称"
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                />

                <AuthInput
                  type="text"
                  autoComplete="off"
                  aria-label="工作区标识"
                  placeholder="工作区标识（可选）"
                  value={workspaceSlug}
                  onChange={(event) => setWorkspaceSlug(event.target.value)}
                />

                <p className="px-1 text-[12px] leading-5 text-[#8f959e]">
                  标识可选，不填时由系统自动生成。若填写，空格会自动转换成连字符。
                </p>

                {successMessage ? <AuthMessage>{successMessage}</AuthMessage> : null}
                {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[#635bff] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#534cf0] disabled:cursor-not-allowed disabled:bg-[#c6c2ff]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      创建中
                    </>
                  ) : (
                    <>
                      创建工作区
                      <ArrowRight className="size-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function getWorkspaceOnboardingMeta() {
  return [
    { title: workspaceOnboardingPageData.seo.title },
    { name: "description", content: workspaceOnboardingPageData.seo.description },
  ];
}
