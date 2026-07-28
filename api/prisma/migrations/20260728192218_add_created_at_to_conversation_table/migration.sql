/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "createdAt";
