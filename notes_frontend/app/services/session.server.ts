import { createCookie } from "@remix-run/node";

type User = { id: string; email: string };

// Simple cookie holding a bearer token and email for demo purposes.
// In a production app you'd use Remix sessionStorage and secure cookies.
const authCookie = createCookie("auth", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: ["replace-this-secret"],
  secure: false,
  maxAge: 60 * 60 * 24 * 30,
});

export async function getSessionUser(request: Request): Promise<User | null> {
  const cookie = await authCookie.parse(request.headers.get("Cookie"));
  if (cookie && cookie.token && cookie.email && cookie.userId) {
    return { id: cookie.userId as string, email: cookie.email as string };
  }
  return null;
}

export async function getAuthToken(request: Request): Promise<string | null> {
  const cookie = await authCookie.parse(request.headers.get("Cookie"));
  return cookie?.token ?? null;
}

export async function commitAuthCookie({
  token,
  email,
  userId,
}: {
  token: string;
  email: string;
  userId: string;
}) {
  return await authCookie.serialize({ token, email, userId });
}

export async function destroyAuthCookie() {
  return await authCookie.serialize("", { maxAge: 0 });
}
