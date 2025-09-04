import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { apiDeleteNote, apiGetNote, apiUpdateNote } from "../services/api.server";
import { getSessionUser } from "../services/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (!user) return redirect("/login");
  const id = params.id!;
  const note = await apiGetNote(request, id);
  return json({ note });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id!;
  const form = await request.formData();
  const intent = String(form.get("_intent") || "update");

  if (intent === "delete") {
    await apiDeleteNote(request, id);
    return redirect("/app");
  }

  const title = String(form.get("title") || "");
  const content = String(form.get("content") || "");
  const tags = String(form.get("tags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title && !content) {
    return json({ error: "Please provide a title or content" }, { status: 400 });
  }

  await apiUpdateNote(request, id, { title, content, tags });
  return redirect(`/app/${id}`);
}

export default function NoteDetail() {
  const { note } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <div className="p-4 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Edit Note</h1>
        <Form method="post">
          <input type="hidden" name="_intent" value="delete" />
          <button
            className="rounded border border-red-500 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/10"
            type="submit"
          >
            Delete
          </button>
        </Form>
      </div>
      <Form method="post" replace className="space-y-3">
        <input
          name="title"
          defaultValue={note.title}
          placeholder="Title"
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
        />
        <textarea
          name="content"
          defaultValue={note.content}
          placeholder="Write your note..."
          rows={12}
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
        />
        <input
          name="tags"
          defaultValue={note.tags?.join(", ")}
          placeholder="Tags (comma separated)"
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
        />
        {actionData?.error && (
          <p className="text-sm text-red-600">{actionData.error}</p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-[var(--primary)] px-3 py-2 text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}
