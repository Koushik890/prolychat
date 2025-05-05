-- Count orphaned Dms records
SELECT COUNT(*) AS "Orphaned Dms Records Count"
FROM "Dms"
WHERE "automationId" IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM "Automation" 
  WHERE "Automation"."id" = "Dms"."automationId"
);

-- Verify that the CASCADE constraint exists
SELECT con.conname AS "Constraint Name",
       con.contype AS "Constraint Type", 
       pg_get_constraintdef(con.oid) AS "Constraint Definition"
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'Dms' 
  AND con.conname = 'Dms_automationId_fkey';

-- The above should return a row with 'CASCADE' in the definition if properly set 