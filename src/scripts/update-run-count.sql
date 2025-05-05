-- SQL script to update automation counters for all records
-- Run with: npx prisma db execute --file=src/scripts/update-run-count.sql

-- First, ensure runCount is properly set based on listener counts
UPDATE "Automation" a
SET "runCount" = GREATEST(
  COALESCE((SELECT "dmCount" FROM "Listener" WHERE "automationId" = a.id), 0),
  COALESCE((SELECT "commentCount" FROM "Listener" WHERE "automationId" = a.id), 0)
)
WHERE EXISTS (SELECT 1 FROM "Listener" WHERE "automationId" = a.id);

-- Ensure all Listeners have at least dmCount and commentCount initialized
-- This prevents NULL values which can cause issues
UPDATE "Listener" l
SET 
  "dmCount" = COALESCE(l."dmCount", 0),
  "commentCount" = COALESCE(l."commentCount", 0)
WHERE l."dmCount" IS NULL OR l."commentCount" IS NULL;

-- Show results after update
SELECT 
  a.id, 
  a.name, 
  a."runCount", 
  l."dmCount", 
  l."commentCount",
  a."active"
FROM "Automation" a
LEFT JOIN "Listener" l ON a.id = l."automationId"
ORDER BY a."runCount" DESC; 