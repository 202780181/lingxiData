import type { Route } from "./+types/register";
import { getRegisterMeta, RegisterPage } from "@/pages/register";

export function meta(_args: Route.MetaArgs) {
  return getRegisterMeta();
}

export default function RegisterRoute() {
  return <RegisterPage />;
}
