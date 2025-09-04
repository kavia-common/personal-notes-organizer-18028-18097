import { getConfig } from "./config.server";
import { getAuthToken } from "./session.server";

export type Note = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = {
  title: string;
  content: string;
  tags?: string[];
};

// PUBLIC_INTERFACE
export async function apiLogin(_request: Request, email: string, password: string) {
  const { NOTES_API_URL } = getConfig();
  const res = await fetch(NOTES_API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Response("Invalid credentials", { status: 401 });
  }
  return (await res.json()) as { token: string; userId: string; email: string };
}

// PUBLIC_INTERFACE
export async function apiRegister(email: string, password: string) {
  const { NOTES_API_URL } = getConfig();
  const res = await fetch(NOTES_API_URL + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Response("Registration failed", { status: res.status });
  }
  return (await res.json()) as { id: string; email: string };
}

// PUBLIC_INTERFACE
export async function apiListNotes(
  request: Request,
  query?: { search?: string; tag?: string }
) {
  const { NOTES_API_URL } = getConfig();
  const token = await getAuthToken(request);

  const url = new URL(NOTES_API_URL + "/notes");
  if (query?.search) url.searchParams.set("search", query.search);
  if (query?.tag) url.searchParams.set("tag", query.tag);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: token ? "Bearer " + token : "",
    },
  });
  if (!res.ok) throw new Response("Failed to fetch notes", { status: res.status });
  return (await res.json()) as Note[];
}

// PUBLIC_INTERFACE
export async function apiGetNote(request: Request, id: string) {
  const { NOTES_API_URL } = getConfig();
  const token = await getAuthToken(request);
  const res = await fetch(NOTES_API_URL + "/notes/" + encodeURIComponent(id), {
    headers: { Authorization: token ? "Bearer " + token : "" },
  });
  if (!res.ok) throw new Response("Failed to fetch note", { status: res.status });
  return (await res.json()) as Note;
}

// PUBLIC_INTERFACE
export async function apiCreateNote(request: Request, input: NoteInput) {
  const { NOTES_API_URL } = getConfig();
  const token = await getAuthToken(request);
  const res = await fetch(NOTES_API_URL + "/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? "Bearer " + token : "",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Response("Failed to create note", { status: res.status });
  return (await res.json()) as Note;
}

// PUBLIC_INTERFACE
export async function apiUpdateNote(request: Request, id: string, input: NoteInput) {
  const { NOTES_API_URL } = getConfig();
  const token = await getAuthToken(request);
  const res = await fetch(NOTES_API_URL + "/notes/" + encodeURIComponent(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? "Bearer " + token : "",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Response("Failed to update note", { status: res.status });
  return (await res.json()) as Note;
}

// PUBLIC_INTERFACE
export async function apiDeleteNote(request: Request, id: string) {
  const { NOTES_API_URL } = getConfig();
  const token = await getAuthToken(request);
  const res = await fetch(NOTES_API_URL + "/notes/" + encodeURIComponent(id), {
    method: "DELETE",
    headers: { Authorization: token ? "Bearer " + token : "" },
  });
  if (!res.ok) throw new Response("Failed to delete note", { status: res.status });
  return { success: true };
}
