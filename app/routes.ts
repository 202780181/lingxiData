import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("onboarding/workspace", "routes/workspace-onboarding.tsx"),
  route("dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard-index.tsx"),
    route(":view", "routes/dashboard-view.tsx"),
  ]),
] satisfies RouteConfig;
