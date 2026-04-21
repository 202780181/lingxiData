import { Navigate, useParams } from "react-router";

import { DashboardViewPage } from "@/pages/dashboard";
import { isDashboardViewKey } from "@/pages/dashboard/config";

export default function DashboardViewRoute() {
  const { view } = useParams();

  if (!isDashboardViewKey(view)) {
    return <Navigate to="/dashboard/model-plaza" replace />;
  }

  return <DashboardViewPage viewKey={view} />;
}
