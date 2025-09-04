import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { apiCreateNote } from "../services/api.server";
import { getSessionUser } from "../services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (!user) {
    return redirect("/login");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const title = String(form.get("title") || "");
  const content = String(form.get("content") || "");
  const tags = String(form.get("tags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title && !content) {
    return json({ error: "Please provide a title or content" }, { status: 400 });
  }

  const note = await apiCreateNote(request, { title, content, tags });
  return redirect(`/app/${note.id}`);
}

export default function NewNote() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <div className="p-4 max-w-3xl mx-auto w-full">
      <h1 className="text-xl font-semibold mb-4">Create Note</h1>
      <Form method="post" replace className="space-y-3">
        <input
          name="title"
          placeholder="Title"
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
        />
        <textarea
          name="content"
          placeholder="Write your note..."
          rows={12}
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
        />
        <input
          name="tags"
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
            {busy ? "Creating..." : "Create"}
          </button>
        </div>
      </Form>
    </div>
  );
}
