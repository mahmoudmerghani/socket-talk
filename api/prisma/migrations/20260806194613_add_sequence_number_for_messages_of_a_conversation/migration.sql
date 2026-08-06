/*
  Warnings:

  - A unique constraint covering the columns `[conversationId,sequenceNumber]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequenceNumber` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "sequenceCounter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "sequenceNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_conversationId_sequenceNumber_key" ON "Message"("conversationId", "sequenceNumber");
