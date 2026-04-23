import type { Route } from "./+types/login";
import { Navigate, useLocation } from "react-router";

import {
  getAuthenticatedRedirectTarget,
  shouldBypassLoginRedirectFromSearch,
} from "@/lib/auth-redirect";
import { useAppCurrentUser } from "@/lib/current-user";
import { getLoginMeta, LoginPage } from "@/pages/login";

export function meta(_args: Route.MetaArgs) {
  return getLoginMeta();
}

export default function LoginRoute() {
  const location = useLocation();
  const currentUser = useAppCurrentUser();

  if (currentUser && !shouldBypassLoginRedirectFromSearch(location.search)) {
    return <Navigate to={getAuthenticatedRedirectTarget(currentUser)} replace />;
  }

  return <LoginPage />;
}
