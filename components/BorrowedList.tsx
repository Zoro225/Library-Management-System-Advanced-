import { prisma } from "@/lib/prisma";
import {
  markReturnedAction,
  approveRenewalAction,
  rejectRenewalAction,
} from "@/lib/actions";
import { isOverdue } from "@/lib/borrow";
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

export async function BorrowedList() {
  const issued = await prisma.borrowRequest.findMany({
    where: { status: "APPROVED" },
    include: { book: true, student: true },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Books taken"
        description="Books currently issued to students. Mark as returned once they come back, or review renewal requests."
      />

      <TableCard>
        {(() => {
          const rows = issued.map((req, index) => {
            const overdue = isOverdue(req);
            const rowClassName = req.renewalRequested
              ? "bg-blue-500/10 hover:bg-blue-500/15"
              : overdue
              ? "bg-rose-500/10 hover:bg-rose-500/15"
              : "hover:bg-white/5";

            const flags = (
              <div className="flex flex-wrap gap-1.5">
                {overdue && <StatusBadge status="OVERDUE" />}
                {req.renewalRequested && (
                  <Chip tone="accent">Renewal requested</Chip>
                )}
                {!overdue && !req.renewalRequested && (
                  <span className="text-slate-500">—</span>
                )}
              </div>
            );

            const actions = (
              <>
                {req.renewalRequested && (
                  <>
                    <ActionButton
                      action={approveRenewalAction.bind(null, req.id)}
                      successMessage="Renewal approved — due date extended."
                      pendingLabel="Approving..."
                      className={buttonStyles.primarySm}
                    >
                      Approve renewal
                    </ActionButton>
                    <ActionButton
                      action={rejectRenewalAction.bind(null, req.id)}
                      successMessage="Renewal denied."
                      pendingLabel="Denying..."
                      className={buttonStyles.secondarySm}
                    >
                      Deny renewal
                    </ActionButton>
                  </>
                )}
                <ActionButton
                  action={markReturnedAction.bind(null, req.id)}
                  successMessage="Marked as returned."
                  pendingLabel="Saving..."
                  className={buttonStyles.darkSm}
                >
                  Mark returned
                </ActionButton>
              </>
            );

            const rowDelay = { animationDelay: `${Math.min(index, 12) * 45}ms` };

            return {
              key: req.id,
              tr: (
                <tr
                  key={req.id}
                  className={`animate-fade-in-row ${rowClassName}`}
                  style={rowDelay}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-100">{req.student.name}</p>
                    <p className="text-xs text-slate-400">{req.student.email}</p>
                  </td>
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
                    {req.dueDate ? formatDate(req.dueDate) : "—"}
                  </td>
                  <td className="px-4 py-3">{flags}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">{actions}</div>
                  </td>
                </tr>
              ),
              card: (
                <MobileCard
                  key={req.id}
                  className="animate-fade-slide-up"
                  style={rowDelay}
                >
                  <div>
                    <p className="font-medium text-slate-100">{req.student.name}</p>
                    <p className="text-xs text-slate-400">{req.student.email}</p>
                  </div>
                  <MobileCardRow label="Book">
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-right">
                        <p className="font-medium text-slate-100">{req.book.title}</p>
                        <p className="text-xs text-slate-400">{req.book.author}</p>
                      </div>
                      <BookCover id={req.book.id} title={req.book.title} size="xs" />
                    </div>
                  </MobileCardRow>
                  <MobileCardRow label="Due date">
                    {req.dueDate ? formatDate(req.dueDate) : "—"}
                  </MobileCardRow>
                  <MobileCardRow label="Flags">{flags}</MobileCardRow>
                  <div className="flex flex-wrap gap-2 pt-1">{actions}</div>
                </MobileCard>
              ),
            };
          });

          return (
            <>
              <div className="hidden sm:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-white/[0.03] text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Due date</th>
                      <th className="px-4 py-3">Flags</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((row) => row.tr)}
                    {issued.length === 0 && (
                      <TableEmptyRow colSpan={5}>
                        <EmptyShelfIllustration className="mx-auto mb-2 h-16 w-20" />
                        No books currently checked out.
                      </TableEmptyRow>
                    )}
                  </tbody>
                </table>
              </div>
              <MobileCardList>
                {rows.map((row) => row.card)}
                {issued.length === 0 && (
                  <MobileCardEmpty>
                    <EmptyShelfIllustration className="mx-auto mb-2 h-16 w-20" />
                    No books currently checked out.
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
