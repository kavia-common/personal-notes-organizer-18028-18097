import { redirect } from "@remix-run/node";
import { destroyAuthCookie } from "../services/session.server";

export async function action() {
  const clear = await destroyAuthCookie();
  return redirect("/login", { headers: { "Set-Cookie": clear } });
}

export default function Logout() {
  return null;
}
