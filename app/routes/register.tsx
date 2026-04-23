import type { Route } from "./+types/register";
import { Navigate } from "react-router";

import { getAuthenticatedRedirectTarget } from "@/lib/auth-redirect";
import { useAppCurrentUser } from "@/lib/current-user";
import { getRegisterMeta, RegisterPage } from "@/pages/register";

export function meta(_args: Route.MetaArgs) {
  return getRegisterMeta();
}

export default function RegisterRoute() {
  const currentUser = useAppCurrentUser();

  if (currentUser) {
    return <Navigate to={getAuthenticatedRedirectTarget(currentUser)} replace />;
  }

  return <RegisterPage />;
}
