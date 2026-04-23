import type { Route } from "./+types/workspace-onboarding";
import { Navigate } from "react-router";

import { getAuthenticatedRedirectTarget } from "@/lib/auth-redirect";
import { needsWorkspaceOnboarding, useAppCurrentUser } from "@/lib/current-user";
import {
  getWorkspaceOnboardingMeta,
  WorkspaceOnboardingPage,
} from "@/pages/workspace-onboarding";

export function meta(_args: Route.MetaArgs) {
  return getWorkspaceOnboardingMeta();
}

export default function WorkspaceOnboardingRoute() {
  const currentUser = useAppCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!needsWorkspaceOnboarding(currentUser)) {
    return (
      <Navigate
        to={getAuthenticatedRedirectTarget(currentUser, "/dashboard")}
        replace
      />
    );
  }

  return <WorkspaceOnboardingPage />;
}
