import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { apiLogin } from "../services/api.server";
import { commitAuthCookie, getSessionUser } from "../services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (user) return redirect("/app");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }
  const { token, userId } = await apiLogin(request, email, password);
  const setCookie = await commitAuthCookie({ token, email, userId });
  return redirect("/app", {
    headers: { "Set-Cookie": setCookie },
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-2 text-2xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        Sign in to manage your notes.
      </p>
      <Form method="post" className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
        />
        {actionData?.error && (
          <p className="text-sm text-red-600">{actionData.error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-[var(--primary)] px-3 py-2 text-white disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </Form>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-[var(--primary)] underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
