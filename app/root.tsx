import { cssBundleHref } from "@remix-run/css-bundle";
import tailwindStyleSheetUrl from "./styles/tailwind.css";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: tailwindStyleSheetUrl },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "SWFT" },
    { name: "description", content: "Organize your projects SWFTly" },
  ];
};

export function ErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center bg-destructive p-20 text-h2 text-destructive-foreground">
      There was an error! Error Message: {error.message}
    </div>
  );
}
