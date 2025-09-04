import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  NavLink,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import "./tailwind.css";
import { getSessionUser } from "./services/session.server";

// PUBLIC_INTERFACE
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// PUBLIC_INTERFACE
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  // Read theme preference from cookie or system
  const cookieTheme = request.headers.get("Cookie")?.match(/theme=(light|dark)/)?.[1];
  const theme = cookieTheme ?? "light";
  return json({ user, theme });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const isDark = data.theme === "dark";

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="flex min-h-screen">
          {/* Fixed Sidebar */}
          <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-[var(--secondary)] dark:bg-gray-900">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <NavLink to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-[var(--primary)]" />
                <div className="text-lg font-semibold">Notes</div>
              </NavLink>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <NavLink
                to="/app"
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                All Notes
              </NavLink>
              <NavLink
                to="/app/new"
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                New Note
              </NavLink>
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
              <p className="mb-1">Logged in as</p>
              <p className="truncate">{data.user ? data.user.email : "Guest"}</p>
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 flex flex-col">
            {/* Top App Bar */}
            <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-950/70 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      const el = document.getElementById("mobile-drawer");
                      if (el) el.classList.toggle("hidden");
                    }}
                    aria-label="Open navigation"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                      <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
                    </svg>
                  </button>
                  <NavLink to="/" className="md:hidden font-semibold">
                    Notes
                  </NavLink>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  {data.user ? (
                    <form method="post" action="/logout">
                      <button
                        className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-white hover:opacity-90"
                        type="submit"
                      >
                        Logout
                      </button>
                    </form>
                  ) : (
                    <NavLink
                      to="/login"
                      className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-white hover:opacity-90"
                    >
                      Login
                    </NavLink>
                  )}
                </div>
              </div>

              {/* Mobile Drawer */}
              <div id="mobile-drawer" className="md:hidden hidden border-t border-gray-200 dark:border-gray-800">
                <nav className="p-2">
                  <NavLink
                    to="/app"
                    className="block rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => document.getElementById("mobile-drawer")?.classList.add("hidden")}
                  >
                    All Notes
                  </NavLink>
                  <NavLink
                    to="/app/new"
                    className="block rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => document.getElementById("mobile-drawer")?.classList.add("hidden")}
                  >
                    New Note
                  </NavLink>
                </nav>
              </div>
            </header>

            <main className="flex-1">{children}</main>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ThemeToggle() {
  const data = useLoaderData<typeof loader>();
  const [theme, setTheme] = useState<"light" | "dark">(data.theme === "dark" ? "dark" : "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    // Persist theme in cookie
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme]);

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
          <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-10.45-10.5 1 1 0 0 0-1.19-1.34A10 10 0 1 0 22 14.14a1 1 0 0 0-.36-1.14z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM4.22 19.78l1.79-1.79-1.8-1.79-1.79 1.8 1.8 1.78zM13 1h-2v3h2V1zm7.83 3.83l-1.79-1.8-1.8 1.79 1.79 1.8 1.8-1.8zM20 11v2h3v-2h-3zm-2.98 7.99l1.8 1.79 1.79-1.8-1.79-1.79-1.8 1.8zM12 6a6 6 0 100 12A6 6 0 0012 6z" />
        </svg>
      )}
    </button>
  );
}

// Root route just renders children (App routes)
export default function App() {
  return <Outlet />;
}
