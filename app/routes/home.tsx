import type { Route } from "./+types/home";
import { getHomeMeta, HomePage, loadHomePageData } from "@/pages/home";

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  return loadHomePageData();
}

export function meta({ data }: Route.MetaArgs) {
  return getHomeMeta(data);
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage data={loaderData} />;
}
