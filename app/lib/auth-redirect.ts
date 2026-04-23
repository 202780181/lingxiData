import type { CurrentUserResponse } from "@/lib/app-api";
import { needsWorkspaceOnboarding } from "@/lib/current-user";

const LAST_NON_AUTH_PATH_STORAGE_KEY = "lingxi:last-non-auth-path";
const LOGIN_ROUTE_BYPASS_QUERY_PARAM = "reason";
const LOGIN_ROUTE_BYPASS_QUERY_VALUE = "logout";
export const WORKSPACE_ONBOARDING_ROUTE = "/onboarding/workspace";

const nonRedirectPathnames = new Set([
  "/login",
  "/register",
  WORKSPACE_ONBOARDING_ROUTE,
]);

function getPathnameFromHref(path: string) {
  try {
    return new URL(path, "https://lingxi.local").pathname;
  } catch {
    return path;
  }
}

export function rememberLastNonAuthPath(path: string) {
  if (typeof window === "undefined" || !path.trim()) {
    return;
  }

  window.sessionStorage.setItem(LAST_NON_AUTH_PATH_STORAGE_KEY, path);
}

export function getLastNonAuthPath() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(LAST_NON_AUTH_PATH_STORAGE_KEY);
}

export function shouldRememberPath(pathname: string) {
  return !nonRedirectPathnames.has(pathname);
}

export function buildLocationHref({
  pathname,
  search,
  hash,
}: {
  pathname: string;
  search?: string;
  hash?: string;
}) {
  return `${pathname}${search ?? ""}${hash ?? ""}`;
}

export function shouldBypassLoginRedirect(url: URL) {
  return (
    url.searchParams.get(LOGIN_ROUTE_BYPASS_QUERY_PARAM) ===
    LOGIN_ROUTE_BYPASS_QUERY_VALUE
  );
}

export function shouldBypassLoginRedirectFromSearch(search: string) {
  return (
    new URLSearchParams(search).get(LOGIN_ROUTE_BYPASS_QUERY_PARAM) ===
    LOGIN_ROUTE_BYPASS_QUERY_VALUE
  );
}

export function getLoginRedirectTarget(fallbackPath = "/dashboard") {
  const rememberedPath = getLastNonAuthPath();

  if (rememberedPath && !nonRedirectPathnames.has(getPathnameFromHref(rememberedPath))) {
    return rememberedPath;
  }

  return fallbackPath;
}

export function getAuthenticatedRedirectTarget(
  currentUser: CurrentUserResponse,
  fallbackPath = "/dashboard",
) {
  if (needsWorkspaceOnboarding(currentUser)) {
    return WORKSPACE_ONBOARDING_ROUTE;
  }

  return getLoginRedirectTarget(fallbackPath);
}

export function getLoginBypassHref() {
  return `/login?${LOGIN_ROUTE_BYPASS_QUERY_PARAM}=${LOGIN_ROUTE_BYPASS_QUERY_VALUE}`;
}
