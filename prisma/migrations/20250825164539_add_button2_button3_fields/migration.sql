/*
  Warnings:

  - You are about to drop the column `message` on the `Listener` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ContactStatus" AS ENUM ('Subscribed', 'Paused', 'Report');

-- AlterEnum
ALTER TYPE "public"."ACTION_TYPE" ADD VALUE 'CARD';

-- DropForeignKey
ALTER TABLE "public"."Dms" DROP CONSTRAINT "Dms_automationId_fkey";

-- AlterTable
ALTER TABLE "public"."Listener" DROP COLUMN "message";

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "cardButton2Action" TEXT,
ADD COLUMN     "cardButton2Label" TEXT,
ADD COLUMN     "cardButton2Link" TEXT,
ADD COLUMN     "cardButton3Action" TEXT,
ADD COLUMN     "cardButton3Label" TEXT,
ADD COLUMN     "cardButton3Link" TEXT;

-- AlterTable
ALTER TABLE "public"."Trigger" ALTER COLUMN "config" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "instagramId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."ContactStatus" NOT NULL DEFAULT 'Subscribed',
    "subscribed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pauseDuration" TEXT,
    "isPausedForever" BOOLEAN NOT NULL DEFAULT false,
    "pauseEndTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profilePictureUrl" TEXT,
    "username" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "public"."Contact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_instagramId_key" ON "public"."Contact"("userId", "instagramId");

-- AddForeignKey
ALTER TABLE "public"."Dms" ADD CONSTRAINT "Dms_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "public"."Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
