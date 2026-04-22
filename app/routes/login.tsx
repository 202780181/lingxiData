import type { Route } from "./+types/login";
import { getLoginMeta, LoginPage } from "@/pages/login";

export function meta(_args: Route.MetaArgs) {
  return getLoginMeta();
}

export default function LoginRoute() {
  return <LoginPage />;
}
