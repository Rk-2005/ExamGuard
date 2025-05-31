/*
  Warnings:

  - Added the required column `duration` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Made the column `submittedAt` on table `TestAttempt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "duration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TestAttempt" ALTER COLUMN "submittedAt" SET NOT NULL,
ALTER COLUMN "submittedAt" SET DEFAULT CURRENT_TIMESTAMP;
