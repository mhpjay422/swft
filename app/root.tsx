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
import { Header } from "./components/header";
import { Footer } from "./components/footer";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: tailwindStyleSheetUrl },
  { rel: "icon", href: "/favicon.svg" },
];

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="text-gray-700 h-screen overflow-hidden">
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Header />
      <div className="flex-grow flex flex-col min-h-screen">
        <Outlet />
      </div>
      <Footer />
    </Document>
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
    <Document>
      <DynamicErrorBoundary
        statusHandlers={{
          404: ({ params }) => (
            <div>Sorry, we couldn't find the page you're looking for</div>
          ),
        }}
      />
    </Document>
  );
}
