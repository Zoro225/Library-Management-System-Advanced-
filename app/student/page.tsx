import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requestBookAction } from "@/lib/actions";
import type { Prisma } from "@/app/generated/prisma/client";
import { PageHeader, Chip, EmptyState, buttonStyles, inputStyles } from "@/components/ui";
import { ActionButton } from "@/components/ActionButton";
import { BookCover } from "@/components/BookCover";
import { NoResultsIllustration } from "@/components/illustrations";

function buildQuery(
  current: { category?: string; tag?: string; q?: string },
  overrides: { category?: string | null; tag?: string | null }
) {
  const params = new URLSearchParams();
  const category =
    overrides.category === undefined ? current.category : overrides.category;
  const tag = overrides.tag === undefined ? current.tag : overrides.tag;

  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (current.q) params.set("q", current.q);

  const qs = params.toString();
  return qs ? `/student?${qs}` : "/student";
}

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function StudentBrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const category =
    typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;
  const tag = typeof resolvedParams.tag === "string" ? resolvedParams.tag : undefined;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;

  const session = await getSession();

  const where: Prisma.BookWhereInput = {};
  if (category) where.category = { name: category };
  if (tag) where.tags = { some: { tag: { name: tag } } };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
    ];
  }

  const [books, categories, tags, myPendingRequests] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { title: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    session?.user
      ? prisma.borrowRequest.findMany({
          where: { studentId: session.user.id, status: "PENDING" },
          select: { bookId: true },
        })
      : Promise.resolve([]),
  ]);

  const pendingBookIds = new Set(myPendingRequests.map((r) => r.bookId));
  const hasFilters = Boolean(category || tag || q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse books"
        description="Search by title or author, or filter by category and tag."
      />

      <div className="space-y-4 rounded-xl border border-white/10 bg-slate-900 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <form action="/student" className="flex max-w-md gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search title or author..."
              className={`${inputStyles} pl-9`}
            />
          </div>
          <button className={buttonStyles.primary}>Search</button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildQuery({ category, tag, q }, { category: null })}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
              !category
                ? "border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                : "border-white/15 text-slate-300 hover:bg-white/10"
            }`}
          >
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildQuery({ category, tag, q }, { category: c.name })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
                category === c.name
                  ? "border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                  : "border-white/15 text-slate-300 hover:bg-white/10"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={buildQuery(
                  { category, tag, q },
                  { tag: tag === t.name ? null : t.name }
                )}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors duration-150 ${
                  tag === t.name
                    ? "border-slate-600 bg-slate-700 text-white"
                    : "border-white/15 text-slate-400 hover:bg-white/10"
                }`}
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {books.length === 0 ? (
        <EmptyState
          illustration={<NoResultsIllustration />}
          title="No books match your search."
          description={
            hasFilters
              ? "Try clearing a filter or searching for something else."
              : "There are no books in the catalog yet."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book, index) => {
            const alreadyPending = pendingBookIds.has(book.id);
            const available = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                className="animate-fade-slide-up flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-400/30 hover:shadow-lg hover:shadow-black/30"
                style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
              >
                <div className="p-4 pb-0">
                  <BookCover id={book.id} title={book.title} size="lg" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-100">
                      {book.title}
                    </p>
                    <p className="text-sm text-slate-400">{book.author}</p>
                  </div>

                  {book.description && (
                    <p className="line-clamp-2 text-sm text-slate-400">
                      {book.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {book.category && (
                      <Chip tone="accent">{book.category.name}</Chip>
                    )}
                    {book.tags.map(({ tag: t }) => (
                      <Chip key={t.id}>{t.name}</Chip>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span
                      className={`text-xs font-semibold ${
                        available ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {available
                        ? `${book.availableCopies} available`
                        : "Unavailable"}
                    </span>
                    <ActionButton
                      action={requestBookAction.bind(null, book.id)}
                      disabled={!available || alreadyPending}
                      successMessage="Request sent — staff will review it shortly."
                      pendingLabel="Requesting..."
                      className={buttonStyles.primarySm}
                    >
                      {alreadyPending
                        ? "Requested"
                        : available
                        ? "Request to borrow"
                        : "Unavailable"}
                    </ActionButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
