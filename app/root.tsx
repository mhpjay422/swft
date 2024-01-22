import { cssBundleHref } from "@remix-run/css-bundle";
import tailwindStyleSheetUrl from "./styles/tailwind.css";
import {
  json,
  type DataFunctionArgs,
  type LinksFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Header } from "./components/header.tsx";
import { Footer } from "./components/footer.tsx";
import { DynamicErrorBoundary } from "./components/error-boundary.tsx";
import prismaClient from "#app/utils/db.server.ts";
import { csrf } from "./utils/csrf.server.ts";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import Sidebar from "./components/sidebar.tsx";
import { getUserId } from "./utils/auth.server.ts";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: tailwindStyleSheetUrl },
  { rel: "icon", href: "/favicon.svg" },
];

const prisma = prismaClient;

export async function loader({ request }: DataFunctionArgs) {
  const userId = await getUserId(request);
  const user = userId
    ? await prisma.user.findUniqueOrThrow({
        select: {
          id: true,
          name: true,
          username: true,
        },
        where: { id: userId },
      })
    : null;
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken();

  return json(
    {
      user,
      csrfToken,
    },

    {
      // The header is null if
      // the csrf token was previously created (before this loader was called)
      // and still valid
      headers: csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : {},
    }
  );
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="text-gray-700 h-screen overflow-hidden"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
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

function App() {
  return (
    <Document>
      <div className="h-screen">
        <Header />
        <div className="flex-grow flex flex-row min-h-screen w-screen p-0 m-0">
          <Sidebar />
          <Outlet />
        </div>
      </div>
      <Footer />
    </Document>
  );
}

export default function AppwithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      <App />
    </AuthenticityTokenProvider>
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
