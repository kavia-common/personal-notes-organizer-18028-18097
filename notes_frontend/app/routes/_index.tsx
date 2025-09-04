import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const isLoggedIn = /auth=/.test(cookie);
  return redirect(isLoggedIn ? "/app" : "/login");
}

export default function Index() {
  return null;
}
