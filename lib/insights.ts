// Aggregate insight queries used by the admin/staff dashboards.
// Kept separate from lib/actions.ts since these are read-only reports
// rather than mutations tied to a form submission.

import { prisma } from "@/lib/prisma";

export type MostBorrowedBook = {
  bookId: string;
  title: string;
  author: string;
  count: number;
};

export async function getMostBorrowedBooks(
  limit: number = 5
): Promise<MostBorrowedBook[]> {
  const grouped = await prisma.borrowRequest.groupBy({
    by: ["bookId"],
    _count: { bookId: true },
    orderBy: { _count: { bookId: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const books = await prisma.book.findMany({
    where: { id: { in: grouped.map((g) => g.bookId) } },
    select: { id: true, title: true, author: true },
  });
  const bookById = new Map(books.map((book) => [book.id, book]));

  return grouped
    .map((g) => {
      const book = bookById.get(g.bookId);
      if (!book) return null;
      return {
        bookId: g.bookId,
        title: book.title,
        author: book.author,
        count: g._count.bookId,
      };
    })
    .filter((entry): entry is MostBorrowedBook => entry !== null);
}

export type DailyBorrowActivity = {
  date: string; // ISO yyyy-mm-dd
  count: number;
};

// Borrow requests submitted per day over the last 7 days (inclusive of
// today), for the small dashboard sparkline. Grouped in JS after a single
// fetch rather than a bespoke SQL query.
export async function getBorrowActivityLast7Days(): Promise<
  DailyBorrowActivity[]
> {
  const totalDays = 7;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (totalDays - 1));

  const requests = await prisma.borrowRequest.findMany({
    where: { requestedAt: { gte: since } },
    select: { requestedAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const request of requests) {
    const key = request.requestedAt.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}
