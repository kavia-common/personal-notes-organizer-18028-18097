import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { apiListNotes } from "../services/api.server";
import { getSessionUser } from "../services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const search = url.searchParams.get("q") ?? undefined;
  const tag = url.searchParams.get("tag") ?? undefined;
  const notes = await apiListNotes(request, { search, tag });
  return json({ notes, search: search ?? "", tag: tag ?? "" });
}

export default function AppIndex() {
  const { notes, search, tag } = useLoaderData<typeof loader>();
  const nav = useNavigation();
  const loading = nav.state !== "idle";

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Form method="get" className="flex-1 flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search notes..."
            defaultValue={search}
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
          />
          <input
            type="text"
            name="tag"
            placeholder="Tag"
            defaultValue={tag}
            className="w-40 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-[var(--primary)]/40"
          />
          <button className="rounded bg-[var(--primary)] px-3 py-2 text-white">Filter</button>
        </Form>
        <Link
          to="/app/new"
          className="inline-flex items-center justify-center rounded bg-[var(--accent)] px-3 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
        >
          + New Note
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notes.map((n) => (
          <Link
            key={n.id}
            to={`/app/${n.id}`}
            className="rounded border border-gray-200 dark:border-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{n.title || "Untitled"}</h3>
              <span className="text-xs text-gray-500">
                {new Date(n.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {n.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {n.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
              {n.content}
            </p>
          </Link>
        ))}
        {notes.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500">No notes found.</div>
        )}
        {loading && <div className="col-span-full text-center text-gray-500">Loading…</div>}
      </div>
    </div>
  );
}
