-- AlterEnum
ALTER TYPE "ConversationType" ADD VALUE 'SELF';

-- CreateTable
CREATE TABLE "DM" (
    "conversationId" INTEGER NOT NULL,
    "userId1" INTEGER NOT NULL,
    "userId2" INTEGER NOT NULL,

    CONSTRAINT "DM_pkey" PRIMARY KEY ("conversationId")
);

-- CreateTable
CREATE TABLE "SelfChat" (
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SelfChat_pkey" PRIMARY KEY ("conversationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DM_userId1_userId2_key" ON "DM"("userId1", "userId2");

-- CreateIndex
CREATE UNIQUE INDEX "SelfChat_userId_key" ON "SelfChat"("userId");

-- AddForeignKey
ALTER TABLE "DM" ADD CONSTRAINT "DM_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DM" ADD CONSTRAINT "DM_userId1_fkey" FOREIGN KEY ("userId1") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DM" ADD CONSTRAINT "DM_userId2_fkey" FOREIGN KEY ("userId2") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelfChat" ADD CONSTRAINT "SelfChat_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelfChat" ADD CONSTRAINT "SelfChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
