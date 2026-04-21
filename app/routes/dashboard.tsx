import type { Route } from "./+types/dashboard";
import {
  DashboardLayout,
  getDashboardMeta,
  loadDashboardPageData,
} from "@/pages/dashboard";

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  return loadDashboardPageData();
}

export function meta({ data }: Route.MetaArgs) {
  return getDashboardMeta(data);
}

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  return <DashboardLayout data={loaderData} />;
}
