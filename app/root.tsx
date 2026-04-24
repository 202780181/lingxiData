import * as React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import { QuotaUpgradeDialogProvider } from "@/components/billing/quota-upgrade-dialog";
import { getCurrentUser, isAppApiError } from "@/lib/app-api";
import {
  buildLocationHref,
  rememberLastNonAuthPath,
  shouldRememberPath,
} from "@/lib/auth-redirect";
import type { AppCurrentUserState } from "@/lib/current-user";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit:wght@400;500;600;700&display=swap",
  },
];

export async function clientLoader(): Promise<AppCurrentUserState> {
  try {
    return {
      currentUser: await getCurrentUser(),
    };
  } catch (error) {
    if (isAppApiError(error) && error.code === "UNAUTHORIZED") {
      return {
        currentUser: null,
      };
    }

    throw error;
  }
}

clientLoader.hydrate = true;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-svh isolate">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();

  React.useEffect(() => {
    if (!shouldRememberPath(location.pathname)) {
      return;
    }

    rememberLastNonAuthPath(
      buildLocationHref({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      }),
    );
  }, [location.hash, location.pathname, location.search]);

  return (
    <QuotaUpgradeDialogProvider>
      <Outlet />
    </QuotaUpgradeDialogProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "页面异常";
  let details = "出现了一个未预期的错误。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "页面异常";
    details =
      error.status === 404
        ? "你访问的页面不存在。"
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
