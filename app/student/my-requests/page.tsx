import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { requestRenewalAction } from "@/lib/actions";
import { isOverdue, daysUntilDue } from "@/lib/borrow";
import {
  PageHeader,
  TableCard,
  StatusBadge,
  Chip,
  MobileCardList,
  MobileCard,
  MobileCardRow,
  MobileCardEmpty,
  TableEmptyRow,
  buttonStyles,
} from "@/components/ui";
import { ActionButton } from "@/components/ActionButton";
import { BookCover } from "@/components/BookCover";
import { EmptyShelfIllustration } from "@/components/illustrations";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function dueDateNote(dueDate: Date, overdue: boolean) {
  const days = daysUntilDue(dueDate);
  if (overdue) {
    const overdueDays = Math.abs(days);
    return `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`;
  }
  if (days <= 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export default async function MyRequestsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const requests = await prisma.borrowRequest.findMany({
    where: { studentId: session.user.id },
    include: { book: true },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My books"
        description="Track the status of your requests, what you currently have out, and request more time when you need it."
      />

      <TableCard>
        {(() => {
          const rows = requests.map((req, index) => {
            const overdue = isOverdue(req);
            const isApproved = req.status === "APPROVED";

            const dueDate = req.dueDate ? (
              <div>
                <p>{formatDate(req.dueDate)}</p>
                {isApproved && (
                  <p
                    className={`text-xs ${
                      overdue ? "text-rose-400" : "text-slate-500"
                    }`}
                  >
                    {dueDateNote(req.dueDate, overdue)}
                  </p>
                )}
              </div>
            ) : (
              "—"
            );

            const status = (
              <StatusBadge
                status={overdue ? "OVERDUE" : req.status}
                label={overdue ? "Overdue" : req.status}
              />
            );

            const renewal = !isApproved ? (
              <span className="text-slate-500">—</span>
            ) : req.renewalRequested ? (
              <Chip tone="accent">Renewal pending</Chip>
            ) : req.renewalCount >= 1 ? (
              <span className="text-xs text-slate-400">
                Renewal already used for this checkout
              </span>
            ) : (
              <ActionButton
                action={requestRenewalAction.bind(null, req.id)}
                successMessage="Renewal requested — staff will review it shortly."
                pendingLabel="Requesting..."
                className={buttonStyles.accentSm}
              >
                Request renewal
              </ActionButton>
            );

            const rowDelay = { animationDelay: `${Math.min(index, 12) * 45}ms` };

            return {
              key: req.id,
              tr: (
                <tr
                  key={req.id}
                  className="animate-fade-in-row hover:bg-white/5"
                  style={rowDelay}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BookCover id={req.book.id} title={req.book.title} size="xs" />
                      <div>
                        <p className="font-medium text-slate-100">{req.book.title}</p>
                        <p className="text-xs text-slate-400">{req.book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatDate(req.requestedAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{dueDate}</td>
                  <td className="px-4 py-3">{status}</td>
                  <td className="px-4 py-3 text-right">{renewal}</td>
                </tr>
              ),
              card: (
                <MobileCard
                  key={req.id}
                  className="animate-fade-slide-up"
                  style={rowDelay}
                >
                  <div className="flex items-center gap-3">
                    <BookCover id={req.book.id} title={req.book.title} size="xs" />
                    <div>
                      <p className="font-medium text-slate-100">{req.book.title}</p>
                      <p className="text-xs text-slate-400">{req.book.author}</p>
                    </div>
                  </div>
                  <MobileCardRow label="Requested">
                    {formatDate(req.requestedAt)}
                  </MobileCardRow>
                  <MobileCardRow label="Due date">{dueDate}</MobileCardRow>
                  <MobileCardRow label="Status">{status}</MobileCardRow>
                  <div className="flex justify-end pt-1">{renewal}</div>
                </MobileCard>
              ),
            };
          });

          return (
            <>
              <div className="hidden sm:block">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-white/[0.03] text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Requested</th>
                      <th className="px-4 py-3">Due date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Renewal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((row) => row.tr)}
                    {requests.length === 0 && (
                      <TableEmptyRow colSpan={5}>
                        <EmptyShelfIllustration className="mx-auto mb-2 h-16 w-20" />
                        You haven&apos;t requested any books yet.
                      </TableEmptyRow>
                    )}
                  </tbody>
                </table>
              </div>
              <MobileCardList>
                {rows.map((row) => row.card)}
                {requests.length === 0 && (
                  <MobileCardEmpty>
                    <EmptyShelfIllustration className="mx-auto mb-2 h-16 w-20" />
                    You haven&apos;t requested any books yet.
                  </MobileCardEmpty>
                )}
              </MobileCardList>
            </>
          );
        })()}
      </TableCard>
    </div>
  );
}
