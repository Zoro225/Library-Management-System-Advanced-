-- AlterTable
ALTER TABLE "BorrowRequest" ADD COLUMN     "renewalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "renewalRequested" BOOLEAN NOT NULL DEFAULT false;
