import { Users, BookOpen, Inbox, Clock, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isOverdue } from "@/lib/borrow";
import { getMostBorrowedBooks, getBorrowActivityLast7Days } from "@/lib/insights";
import { PageHeader, StatCard } from "@/components/ui";
import { MostBorrowedWidget } from "@/components/MostBorrowedWidget";
import { BorrowActivityChart } from "@/components/BorrowActivityChart";

export default async function AdminOverviewPage() {
  const [staffCount, bookCount, pendingCount, issued, mostBorrowed, activity] =
    await Promise.all([
      prisma.user.count({ where: { role: "STAFF" } }),
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
    { label: "Staff members", value: staffCount, href: "/admin/staff", icon: Users, tone: "indigo" as const },
    { label: "Books in inventory", value: bookCount, href: "/admin/inventory", icon: BookOpen, tone: "indigo" as const },
    { label: "Pending requests", value: pendingCount, href: "/admin/requests", icon: Inbox, tone: "amber" as const },
    { label: "Books checked out", value: issued.length, href: "/admin/borrowed", icon: Clock, tone: "emerald" as const },
    { label: "Overdue", value: overdueCount, href: "/admin/borrowed", icon: AlertTriangle, tone: "red" as const },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin overview"
        description="A quick snapshot of the library right now."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
