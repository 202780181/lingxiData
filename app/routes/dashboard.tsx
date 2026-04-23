import type { Route } from "./+types/dashboard";
import { Navigate } from "react-router";
import {
  DashboardLayout,
  getDashboardMeta,
  loadDashboardPageData,
} from "@/pages/dashboard";
import { WORKSPACE_ONBOARDING_ROUTE } from "@/lib/auth-redirect";
import { needsWorkspaceOnboarding, useAppCurrentUser } from "@/lib/current-user";

export function meta(_args: Route.MetaArgs) {
  return getDashboardMeta();
}

export default function DashboardRoute() {
  const currentUser = useAppCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (needsWorkspaceOnboarding(currentUser)) {
    return <Navigate to={WORKSPACE_ONBOARDING_ROUTE} replace />;
  }

  return <DashboardLayout data={loadDashboardPageData(currentUser)} />;
}
