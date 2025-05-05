# Database Maintenance Scripts

This directory contains scripts for maintaining and fixing database issues.

## Handling Orphaned Dms Records

When automations are deleted, their associated chat history records in the `Dms` table should also be deleted to maintain referential integrity. The script `clean_orphaned_dms.sql` addresses this issue in two ways:

1. It deletes any existing orphaned Dms records where the associated automation no longer exists
2. It adds a CASCADE constraint to ensure that when automations are deleted in the future, their associated Dms records are automatically deleted

### How to Apply This Fix

Run the following command from the project root:

```bash
npx prisma db execute --file=src/scripts/clean_orphaned_dms.sql
```

### Verifying the Fix

After running the script, you can verify that the fix was applied successfully by checking that:

1. There are no more orphaned Dms records
2. The CASCADE constraint has been added

Run this SQL query to check for orphaned records:

```sql
SELECT COUNT(*) FROM "Dms" 
WHERE "automationId" IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM "Automation" 
  WHERE "Automation"."id" = "Dms"."automationId"
);
```

The result should be 0.

### Schema Changes

The Prisma schema (`prisma/schema.prisma`) has also been updated to include the `onDelete: Cascade` directive for the Dms model's relation to Automation. This ensures that new migrations will maintain this behavior.

```prisma
model Dms {
  id           String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  automationId String?     @db.Uuid
  createdAt    DateTime    @default(now())
  senderId     String?
  reciever     String?
  message      String?
  Automation   Automation? @relation(fields: [automationId], references: [id], onDelete: Cascade)
}
```

This change ensures that when an automation is deleted, all related chat history is also deleted, preventing orphaned records and maintaining data integrity. 