import { prisma } from "@/lib/prisma";
import { approveRequestAction, rejectRequestAction } from "@/lib/actions";
import {
  PageHeader,
  TableCard,
  StatusBadge,
  MobileCardList,
  MobileCard,
  MobileCardRow,
  MobileCardEmpty,
  TableEmptyRow,
  buttonStyles,
} from "@/components/ui";
import { ActionButton } from "@/components/ActionButton";
import { BookCover } from "@/components/BookCover";
import { AllCaughtUpIllustration } from "@/components/illustrations";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export async function RequestsManager() {
  const requests = await prisma.borrowRequest.findMany({
    where: { status: "PENDING" },
    include: { book: true, student: true },
    orderBy: { requestedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requests"
        description="Review pending borrow requests and assign books to students."
      />

      <TableCard>
        {(() => {
          const rows = requests.map((req, index) => {
            const availability =
              req.book.availableCopies > 0 ? (
                <StatusBadge
                  status="AVAILABLE"
                  label={`${req.book.availableCopies} available`}
                />
              ) : (
                <StatusBadge status="UNAVAILABLE" label="None available" />
              );

            const actions = (
              <>
                <ActionButton
                  action={approveRequestAction.bind(null, req.id)}
                  disabled={req.book.availableCopies < 1}
                  successMessage="Book assigned to student."
                  pendingLabel="Assigning..."
                  className={buttonStyles.primarySm}
                >
                  Assign book
                </ActionButton>
                <ActionButton
                  action={rejectRequestAction.bind(null, req.id)}
                  successMessage="Request rejected."
                  pendingLabel="Rejecting..."
                  className={buttonStyles.secondarySm}
                >
                  Reject
                </ActionButton>
              </>
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
                    {formatDate(req.requestedAt)}
                  </td>
                  <td className="px-4 py-3">{availability}</td>
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
                  <MobileCardRow label="Requested">
                    {formatDate(req.requestedAt)}
                  </MobileCardRow>
                  <MobileCardRow label="Availability">{availability}</MobileCardRow>
                  <div className="flex flex-wrap gap-2 pt-1">{actions}</div>
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
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Requested</th>
                      <th className="px-4 py-3">Availability</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((row) => row.tr)}
                    {requests.length === 0 && (
                      <TableEmptyRow colSpan={5}>
                        <AllCaughtUpIllustration className="mx-auto mb-2 h-16 w-20" />
                        No pending requests right now.
                      </TableEmptyRow>
                    )}
                  </tbody>
                </table>
              </div>
              <MobileCardList>
                {rows.map((row) => row.card)}
                {requests.length === 0 && (
                  <MobileCardEmpty>
                    <AllCaughtUpIllustration className="mx-auto mb-2 h-16 w-20" />
                    No pending requests right now.
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
