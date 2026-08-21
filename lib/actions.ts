"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function revalidateShared(paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

// ---------- Staff management (ADMIN only) ----------

export async function createStaffAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, passwordHash, role: "STAFF" },
  });

  revalidatePath("/admin/staff");
}

export async function updateStaffAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!id || !name || !email) {
    throw new Error("Missing required fields.");
  }

  const data: {
    name: string;
    email: string;
    passwordHash?: string;
  } = { name, email };

  if (password) {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({ where: { id }, data });

  revalidatePath("/admin/staff");
}

export async function toggleStaffActiveAction(
  id: string,
  active: boolean
): Promise<void> {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath("/admin/staff");
}

// ---------- Inventory management (ADMIN + STAFF) ----------

async function resolveCategory(categoryName: string) {
  const trimmed = categoryName.trim();
  if (!trimmed) return null;
  return prisma.category.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
}

async function resolveTags(tagsRaw: string) {
  const names = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const tags = [];
  for (const name of names) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags.push(tag);
  }
  return tags;
}

export async function createBookAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim();
  const isbn = String(formData.get("isbn") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const coverColor = String(formData.get("coverColor") || "#6366f1");
  const totalCopies = Math.max(1, Number(formData.get("totalCopies") || 1));
  const categoryName = String(formData.get("category") || "");
  const tagsRaw = String(formData.get("tags") || "");

  if (!title || !author) {
    throw new Error("Title and author are required.");
  }

  const category = await resolveCategory(categoryName);
  const tags = await resolveTags(tagsRaw);

  await prisma.book.create({
    data: {
      title,
      author,
      isbn: isbn || null,
      description: description || null,
      coverColor,
      totalCopies,
      availableCopies: totalCopies,
      categoryId: category?.id,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id })),
      },
    },
  });

  revalidateShared(["/admin/inventory", "/staff/inventory", "/student"]);
}

export async function updateBookAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim();
  const isbn = String(formData.get("isbn") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const coverColor = String(formData.get("coverColor") || "#6366f1");
  const totalCopies = Math.max(1, Number(formData.get("totalCopies") || 1));
  const categoryName = String(formData.get("category") || "");
  const tagsRaw = String(formData.get("tags") || "");

  if (!id || !title || !author) {
    throw new Error("Title and author are required.");
  }

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) throw new Error("Book not found.");

  const issuedCount = existing.totalCopies - existing.availableCopies;
  const newAvailable = Math.max(0, totalCopies - issuedCount);

  const category = await resolveCategory(categoryName);
  const tags = await resolveTags(tagsRaw);

  await prisma.$transaction([
    prisma.bookTag.deleteMany({ where: { bookId: id } }),
    prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        isbn: isbn || null,
        description: description || null,
        coverColor,
        totalCopies,
        availableCopies: newAvailable,
        categoryId: category?.id ?? null,
        tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
      },
    }),
  ]);

  revalidateShared(["/admin/inventory", "/staff/inventory", "/student"]);
}

export async function deleteBookAction(id: string): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  await prisma.book.delete({ where: { id } });
  revalidateShared(["/admin/inventory", "/staff/inventory", "/student"]);
}

// ---------- Borrow requests ----------

export async function requestBookAction(bookId: string): Promise<void> {
  const session = await requireRole(["STUDENT"]);

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found.");
  if (book.availableCopies < 1) {
    throw new Error("No copies currently available.");
  }

  const existingPending = await prisma.borrowRequest.findFirst({
    where: {
      bookId,
      studentId: session.user.id,
      status: "PENDING",
    },
  });
  if (existingPending) {
    throw new Error("You already have a pending request for this book.");
  }

  await prisma.borrowRequest.create({
    data: {
      bookId,
      studentId: session.user.id,
      status: "PENDING",
    },
  });

  revalidateShared([
    "/student",
    "/student/my-requests",
    "/admin/requests",
    "/staff/requests",
  ]);
}

export async function approveRequestAction(requestId: string): Promise<void> {
  const session = await requireRole(["ADMIN", "STAFF"]);

  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
    include: { book: true },
  });
  if (!request || request.status !== "PENDING") {
    throw new Error("Request is no longer pending.");
  }
  if (request.book.availableCopies < 1) {
    throw new Error("No copies currently available to issue.");
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  await prisma.$transaction([
    prisma.borrowRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        decidedAt: new Date(),
        dueDate,
        approvedById: session.user.id,
      },
    }),
    prisma.book.update({
      where: { id: request.bookId },
      data: { availableCopies: { decrement: 1 } },
    }),
  ]);

  revalidateShared([
    "/admin/requests",
    "/staff/requests",
    "/admin/borrowed",
    "/staff/borrowed",
    "/student",
    "/student/my-requests",
  ]);
}

export async function rejectRequestAction(requestId: string): Promise<void> {
  const session = await requireRole(["ADMIN", "STAFF"]);

  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.status !== "PENDING") {
    throw new Error("Request is no longer pending.");
  }

  await prisma.borrowRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      decidedAt: new Date(),
      approvedById: session.user.id,
    },
  });

  revalidateShared([
    "/admin/requests",
    "/staff/requests",
    "/student",
    "/student/my-requests",
  ]);
}

export async function markReturnedAction(requestId: string): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);

  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.status !== "APPROVED") {
    throw new Error("This book isn't currently marked as issued.");
  }

  await prisma.$transaction([
    prisma.borrowRequest.update({
      where: { id: requestId },
      data: { status: "RETURNED", returnedAt: new Date() },
    }),
    prisma.book.update({
      where: { id: request.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);

  revalidateShared([
    "/admin/borrowed",
    "/staff/borrowed",
    "/student",
    "/student/my-requests",
  ]);
}

// ---------- Renewals ----------
// A student who currently has a book checked out can ask for more time
// instead of it just going overdue with no recourse. Staff/admin review
// the request the same way they review a new borrow request. Each
// checkout allows at most one approved renewal, which pushes the due
// date out by another 14 days.

const MAX_RENEWALS_PER_CHECKOUT = 1;
const RENEWAL_EXTENSION_DAYS = 14;

export async function requestRenewalAction(requestId: string): Promise<void> {
  const session = await requireRole(["STUDENT"]);

  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.studentId !== session.user.id) {
    throw new Error("Request not found.");
  }
  if (request.status !== "APPROVED") {
    throw new Error("Only a book you currently have checked out can be renewed.");
  }
  if (request.renewalRequested) {
    throw new Error("A renewal is already pending for this book.");
  }
  if (request.renewalCount >= MAX_RENEWALS_PER_CHECKOUT) {
    throw new Error("This checkout has already used its renewal.");
  }

  await prisma.borrowRequest.update({
    where: { id: requestId },
    data: { renewalRequested: true },
  });

  revalidateShared([
    "/student",
    "/student/my-requests",
    "/admin/borrowed",
    "/staff/borrowed",
  ]);
}

export async function approveRenewalAction(requestId: string): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);

  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.status !== "APPROVED" || !request.renewalRequested) {
    throw new Error("No pending renewal for this book.");
  }

  const base = request.dueDate && request.dueDate > new Date() ? request.dueDate : new Date();
  const newDueDate = new Date(base);
  newDueDate.setDate(newDueDate.getDate() + RENEWAL_EXTENSION_DAYS);

  await prisma.borrowRequest.update({
    where: { id: requestId },
    data: {
      dueDate: newDueDate,
      renewalRequested: false,
      renewalCount: { increment: 1 },
    },
  });

  revalidateShared([
    "/admin/borrowed",
    "/staff/borrowed",
    "/student",
    "/student/my-requests",
  ]);
}

export async function rejectRenewalAction(requestId: string): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);

  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || !request.renewalRequested) {
    throw new Error("No pending renewal for this book.");
  }

  await prisma.borrowRequest.update({
    where: { id: requestId },
    data: { renewalRequested: false },
  });

  revalidateShared([
    "/admin/borrowed",
    "/staff/borrowed",
    "/student",
    "/student/my-requests",
  ]);
}
