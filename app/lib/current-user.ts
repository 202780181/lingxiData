import { useRouteLoaderData } from "react-router";

import type { CurrentUserResponse, LoginSession } from "@/lib/app-api";

export interface AppCurrentUserState {
  currentUser: CurrentUserResponse | null;
}

export function useAppCurrentUser() {
  const data = useRouteLoaderData("root") as AppCurrentUserState | undefined;
  return data?.currentUser ?? null;
}

export function needsWorkspaceOnboarding(
  currentUser: CurrentUserResponse | null | undefined,
) {
  return Boolean(currentUser?.session.onboarding_required);
}

export function getUserDisplayName(session: LoginSession) {
  const trimmedName = session.name.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const emailName = session.email.trim().split("@")[0];
  return emailName || "灵犀用户";
}

export function getUserRoleLabel(session: LoginSession) {
  if (session.platform_roles.includes("platform_admin")) {
    return "平台管理员";
  }

  if (session.active_role === "owner") {
    return "工作区所有者";
  }

  if (session.active_role === "member") {
    return "工作区成员";
  }

  return "普通用户";
}

export function getUserInitials(value: string) {
  const compactValue = value.trim();

  if (!compactValue) {
    return "LX";
  }

  const asciiTokens = compactValue
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "");

  if (asciiTokens.length > 0 && asciiTokens.every(Boolean)) {
    return asciiTokens.join("");
  }

  return compactValue.slice(0, 2).toUpperCase();
}
