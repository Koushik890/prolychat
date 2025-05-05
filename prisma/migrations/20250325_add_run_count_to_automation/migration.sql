-- Add runCount field to Automation table
ALTER TABLE "Automation" ADD COLUMN "runCount" INTEGER NOT NULL DEFAULT 0;

-- Update existing automations to have runCount = max(dmCount, commentCount)
UPDATE "Automation" a
SET "runCount" = GREATEST(
  COALESCE((SELECT "dmCount" FROM "Listener" WHERE "automationId" = a.id), 0),
  COALESCE((SELECT "commentCount" FROM "Listener" WHERE "automationId" = a.id), 0)
)
WHERE EXISTS (SELECT 1 FROM "Listener" WHERE "automationId" = a.id); 