-- CreateEnum
CREATE TYPE "CooldownType" AS ENUM ('DAILY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooldown" (
    "type" "CooldownType" NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("type","userId")
);

-- AddForeignKey
ALTER TABLE "Cooldown" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
