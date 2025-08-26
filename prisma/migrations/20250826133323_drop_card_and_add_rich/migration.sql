/*
  Warnings:

  - The values [CARD] on the enum `MESSAGE_TYPE` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cardButton2Action` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardButton2Label` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardButton2Link` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardButton3Action` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardButton3Label` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardButton3Link` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardButtonAction` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardButtonLabel` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardImage` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardImageUrl` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardLink` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardSubtitle` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `cardTitle` on the `Message` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MESSAGE_TYPE_new" AS ENUM ('TEXT', 'RICH');
ALTER TABLE "public"."Message" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Message" ALTER COLUMN "type" TYPE "public"."MESSAGE_TYPE_new" USING ("type"::text::"public"."MESSAGE_TYPE_new");
ALTER TYPE "public"."MESSAGE_TYPE" RENAME TO "MESSAGE_TYPE_old";
ALTER TYPE "public"."MESSAGE_TYPE_new" RENAME TO "MESSAGE_TYPE";
DROP TYPE "public"."MESSAGE_TYPE_old";
ALTER TABLE "public"."Message" ALTER COLUMN "type" SET DEFAULT 'TEXT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "cardButton2Action",
DROP COLUMN "cardButton2Label",
DROP COLUMN "cardButton2Link",
DROP COLUMN "cardButton3Action",
DROP COLUMN "cardButton3Label",
DROP COLUMN "cardButton3Link",
DROP COLUMN "cardButtonAction",
DROP COLUMN "cardButtonLabel",
DROP COLUMN "cardImage",
DROP COLUMN "cardImageUrl",
DROP COLUMN "cardLink",
DROP COLUMN "cardSubtitle",
DROP COLUMN "cardTitle",
ADD COLUMN     "cta2Action" TEXT,
ADD COLUMN     "cta2Label" TEXT,
ADD COLUMN     "cta2Url" TEXT,
ADD COLUMN     "cta3Action" TEXT,
ADD COLUMN     "cta3Label" TEXT,
ADD COLUMN     "cta3Url" TEXT,
ADD COLUMN     "ctaAction" TEXT,
ADD COLUMN     "ctaLabel" TEXT,
ADD COLUMN     "ctaUrl" TEXT,
ADD COLUMN     "richTitle" TEXT;
