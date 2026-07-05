-- CreateEnum
CREATE TYPE "OauthProvider" AS ENUM ('GITHUB');

-- CreateTable
CREATE TABLE "OauthAccount" (
    "providerId" TEXT NOT NULL,
    "provider" "OauthProvider" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "OauthAccount_pkey" PRIMARY KEY ("providerId","provider")
);

-- AddForeignKey
ALTER TABLE "OauthAccount" ADD CONSTRAINT "OauthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
