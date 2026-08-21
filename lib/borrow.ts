// Shared helpers for interpreting a BorrowRequest's due date, used by both
// the student and staff/admin views so "overdue" means the same thing
// everywhere in the app.

export type DueDateLike = {
  status: string;
  dueDate: Date | string | null;
};

export function isOverdue(request: DueDateLike, now: Date = new Date()): boolean {
  if (request.status !== "APPROVED" || !request.dueDate) return false;
  return new Date(request.dueDate) < now;
}

export function daysUntilDue(dueDate: Date | string, now: Date = new Date()): number {
  const due = new Date(dueDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((due.getTime() - now.getTime()) / msPerDay);
}
