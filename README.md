# AJ

A full-stack library management app built with Next.js (App Router), Prisma + PostgreSQL, and NextAuth. Supports three roles: **Admin**, **Staff**, and **Student**.

Can Access Using :- https://library-management-system-advanced.vercel.app/login

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Demo logins](#demo-logins)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [How borrowing works](#how-borrowing-works)
- [Troubleshooting](#troubleshooting)
- [Deploying](#deploying)

## Features

**Admin portal**
- Manage staff accounts: create, edit, and deactivate/reactivate staff logins.
- Full inventory control: add, edit, and delete books, including category and tags.
- Review and act on borrow requests: assign (approve) or reject.
- See every book currently checked out, with due dates and overdue/renewal flags, and mark books as returned.
- Review and approve or deny renewal requests, extending a due date by 14 days.
- Dashboard stat cards include a live overdue-books count alongside inventory and request totals.

**Staff portal**
- Everything above except staff account management (admin-only).

**Student portal**
- Sign up for an account, or log in if you already have one.
- Browse the full catalog; search by title/author, or filter by category and tag.
- Request to borrow any book with available copies.
- Track the status of every request (pending / approved / rejected / returned), including days left or days overdue on anything currently checked out.
- Request a renewal on a book that's currently checked out (one renewal per checkout, extends the due date 14 days once staff approve it).

Borrowing is a **request → staff approval** workflow, not instant self-checkout: a student requests a book, staff or admin approves it (which issues the book and sets a 14-day due date) or rejects it, and marks it returned once the book comes back. A student can also ask for a one-time renewal on a book they hold, which staff/admin approve or deny from the same Books Taken page.

Every list and management screen (Books Taken, Requests, Inventory, Staff) renders as a proper card layout on narrow/mobile screens instead of a cramped table, so the full experience — including every action button — works on a phone, not just a desktop browser.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Routes are protected via `proxy.ts` — Next 16's replacement for `middleware.ts`. |
| Language | TypeScript | |
| Styling | Tailwind CSS v4 | |
| Database | PostgreSQL | |
| ORM | Prisma 7 | Uses the driver-adapter setup (`@prisma/adapter-pg`). Generated client lives in `app/generated/prisma` (gitignored — regenerated automatically via the `postinstall` script). |
| Auth | NextAuth v4 | Credentials provider (email + password, hashed with bcrypt), JWT session carrying the user's role. |

All create/update/delete/approve/reject/return actions are Next.js **Server Actions** in `lib/actions.ts`. Each one independently re-checks the caller's role server-side — route protection in `proxy.ts` is a UX convenience, not the only security boundary.

## Getting started

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via a `postinstall` hook.

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to a PostgreSQL connection string (a local instance, or a free hosted one — see [Deploying](#deploying)).

Generate a real secret instead of the placeholder:

```bash
openssl rand -base64 32
```

Set `NEXTAUTH_URL` to the exact address you'll open in your browser (e.g. `http://localhost:3000` locally, or your deployed domain in production).

### 3. Set up the database

```bash
npx prisma migrate deploy
npm run db:seed
```

This applies the schema and seeds three demo accounts plus a full sample catalog.

### 4. Run the app

```bash
npm run dev
```

Open the app at whatever address you set `NEXTAUTH_URL` to.

## Demo logins

| Role    | Email                  | Password     |
|---------|-------------------------|---------------|
| Admin   | admin@library.com       | Admin@123     |
| Staff   | staff@library.com       | Staff@123     |
| Student | student@library.com     | Student@123   |

Students can also sign up for their own account from `/signup`.

## Project structure

```
app/
  admin/          Admin-only pages (staff, inventory, requests, borrowed books)
  staff/          Staff-only pages (inventory, requests, borrowed books)
  student/        Student pages (browse/search/filter, my requests)
  login/, signup/ Auth pages
  api/            NextAuth route handler + signup endpoint
components/       Shared UI (dashboard shell, inventory/requests/borrowed managers, shared primitives)
lib/              Prisma client, auth config, session helpers, server actions
prisma/           Schema, migrations, seed script
proxy.ts          Route protection (Next.js 16's replacement for middleware.ts)
```

Inventory, request-approval, and borrowed-book management are each implemented once as a shared component and rendered from both the admin and staff route trees, so there's a single source of truth for that logic even though admin and staff see it at different URLs.

## Data model

Defined in `prisma/schema.prisma`:

- **User** — `role` is one of `ADMIN` / `STAFF` / `STUDENT`; `active` lets admins deactivate staff without deleting history.
- **Book** — belongs to one `Category`, has many `Tag`s via the `BookTag` join table; tracks `totalCopies` vs `availableCopies`.
- **Category**, **Tag** — simple lookup tables, created on the fly when an admin/staff member types a new category or tag name.
- **BorrowRequest** — the request lifecycle: `PENDING` → `APPROVED` (with a `dueDate` set 14 days out) or `REJECTED`, and `APPROVED` → `RETURNED`. Also tracks `renewalRequested` and `renewalCount`, capped at one renewal per checkout.

## How borrowing works

1. A logged-in student clicks "Request to borrow" on a book with `availableCopies > 0`. This creates a `BorrowRequest` with status `PENDING`.
2. An admin or staff member sees it under Requests, and either:
   - **Assigns** it — sets status to `APPROVED`, decrements the book's `availableCopies`, and sets a due date 14 days out, or
   - **Rejects** it — sets status to `REJECTED`.
3. While a book is checked out, the student can request a renewal from "My Books" (once per checkout). Staff/admin see a "Renewal requested" flag on the Books Taken page and can approve it (pushing the due date 14 days from whichever is later — today or the current due date) or deny it.
4. Once the book is returned, staff/admin click "Mark returned" on the Books Taken page — sets status to `RETURNED` and increments `availableCopies` back.
5. Students can see all of this — due dates, days remaining or overdue, and renewal status — on their "My Books" page at any time.

## Troubleshooting

**`npm install` fails with a PowerShell "running scripts is disabled" error (Windows).**
This is a Windows security setting, unrelated to the project. Either run the command from Command Prompt instead of PowerShell, or run this once in PowerShell to allow scripts for your account: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

**Login says "Invalid email or password" even with the right credentials, or the sign-in button just hangs.**
This almost always means `NEXTAUTH_URL` doesn't match the address you're actually using in the browser. NextAuth bakes `NEXTAUTH_URL` into the client bundle as the base URL for *every* auth request. Fix: set `NEXTAUTH_URL` in `.env` to exactly the address in your browser's address bar, then restart the server (env vars are only read at startup).

**The `User` table doesn't exist / login always fails with no accounts found.**
Migrations haven't been applied, or the database is empty. Run `npx prisma migrate deploy` followed by `npm run db:seed`.

## Deploying

A common free path: [Neon](https://neon.tech) for a hosted Postgres database, and [Vercel](https://vercel.com) for the app itself.

1. Create a free Neon project and copy its connection string.
2. Push this repo to GitHub.
3. Import the repo in Vercel, and set these environment variables in the project settings: `DATABASE_URL` (the Neon connection string), `NEXTAUTH_SECRET` (a fresh `openssl rand -base64 32`), and `NEXTAUTH_URL` (your Vercel deployment URL).
4. Run `npx prisma migrate deploy` and `npm run db:seed` once against the Neon database (e.g. from your machine with `DATABASE_URL` pointed at Neon) before or after the first deploy.
