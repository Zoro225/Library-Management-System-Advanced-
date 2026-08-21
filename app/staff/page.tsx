import { BookOpen, Inbox, Clock, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isOverdue } from "@/lib/borrow";
import { getMostBorrowedBooks, getBorrowActivityLast7Days } from "@/lib/insights";
import { PageHeader, StatCard } from "@/components/ui";
import { MostBorrowedWidget } from "@/components/MostBorrowedWidget";
import { BorrowActivityChart } from "@/components/BorrowActivityChart";

export default async function StaffOverviewPage() {
  const [bookCount, pendingCount, issued, mostBorrowed, activity] = await Promise.all([
    prisma.book.count(),
    prisma.borrowRequest.count({ where: { status: "PENDING" } }),
    prisma.borrowRequest.findMany({
      where: { status: "APPROVED" },
      select: { status: true, dueDate: true },
    }),
    getMostBorrowedBooks(5),
    getBorrowActivityLast7Days(),
  ]);

  const overdueCount = issued.filter((request) => isOverdue(request)).length;

  const cards = [
    { label: "Books in inventory", value: bookCount, href: "/staff/inventory", icon: BookOpen, tone: "indigo" as const },
    { label: "Pending requests", value: pendingCount, href: "/staff/requests", icon: Inbox, tone: "amber" as const },
    { label: "Books checked out", value: issued.length, href: "/staff/borrowed", icon: Clock, tone: "emerald" as const },
    { label: "Overdue", value: overdueCount, href: "/staff/borrowed", icon: AlertTriangle, tone: "red" as const },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Staff overview"
        description="A quick snapshot of the library right now."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className="animate-fade-slide-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <StatCard {...card} />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MostBorrowedWidget mostBorrowed={mostBorrowed} />
        </div>
        <BorrowActivityChart data={activity} />
      </div>
    </div>
  );
}
