-- CreateEnum for MESSAGE_TYPE
CREATE TYPE "MESSAGE_TYPE" AS ENUM ('TEXT', 'CARD');

-- CreateTable for Message
CREATE TABLE "Message" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listenerId" UUID NOT NULL,
    "type" "MESSAGE_TYPE" NOT NULL DEFAULT 'TEXT',
    "textContent" TEXT,
    "cardTitle" TEXT,
    "cardSubtitle" TEXT,
    "cardButtonLabel" TEXT,
    "cardImage" BYTEA,
    "cardImageUrl" TEXT,
    "cardButtonAction" TEXT,
    "cardLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "Message" ADD CONSTRAINT "Message_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique index for one-to-one relationship
CREATE UNIQUE INDEX "Message_listenerId_key" ON "Message"("listenerId");

-- Create index for faster queries
CREATE INDEX "Message_type_idx" ON "Message"("type");
CREATE INDEX "Message_listenerId_idx" ON "Message"("listenerId"); 