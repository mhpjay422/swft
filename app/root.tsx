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
} from "@remix-run/react";
import { DynamicErrorBoundary } from "./components/error-boundary";

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
  return (
    <DynamicErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <div>Sorry, we couldn't find the page you're looking for</div>
        ),
      }}
    />
  );
}
