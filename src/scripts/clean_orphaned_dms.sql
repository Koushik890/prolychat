-- First delete orphaned Dms records (where automationId is not null but the automation no longer exists)
DELETE FROM "Dms"
WHERE "automationId" IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM "Automation" 
  WHERE "Automation"."id" = "Dms"."automationId"
);

-- Add the CASCADE constraint to ensure future deletions are handled properly
ALTER TABLE "Dms" 
  DROP CONSTRAINT IF EXISTS "Dms_automationId_fkey";

ALTER TABLE "Dms" 
  ADD CONSTRAINT "Dms_automationId_fkey" 
  FOREIGN KEY ("automationId") 
  REFERENCES "Automation"("id") 
  ON DELETE CASCADE;

-- Log the results
SELECT 'Orphaned Dms records deleted and CASCADE constraint added' as "Operation Completed"; 