-- Fix User ClerkId Constraint Issues
-- Run this script in your PostgreSQL database to diagnose and fix issues

-- 1. Check for duplicate clerkId entries
SELECT clerkId, COUNT(*) as count
FROM "User"
GROUP BY clerkId
HAVING COUNT(*) > 1;

-- 2. Check for orphaned or incomplete user records
SELECT id, clerkId, email, firstname, lastname, "createdAt"
FROM "User"
WHERE firstname IS NULL OR lastname IS NULL OR email IS NULL
ORDER BY "createdAt" DESC;

-- 3. Reset the sequence for the User table (if using autoincrement)
-- Note: Your schema uses UUID with gen_random_uuid(), so this might not be needed
-- But just in case there are any sequence issues:
-- SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id)+1, 1), false) FROM "User";

-- 4. Check for users without subscriptions (should have been created with subscription)
SELECT u.id, u.clerkId, u.email, u.firstname, u.lastname
FROM "User" u
LEFT JOIN "Subscription" s ON u.id = s.userId
WHERE s.id IS NULL;

-- 5. Create missing subscriptions for users that don't have them
INSERT INTO "Subscription" (userId, plan, "subscriptionStatus")
SELECT u.id, 'FREE', NULL
FROM "User" u
LEFT JOIN "Subscription" s ON u.id = s.userId
WHERE s.id IS NULL;

-- 6. Check the database constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'User' 
    AND tc.constraint_type = 'UNIQUE';

-- 7. Show recent user creation activity
SELECT id, clerkId, email, firstname, lastname, "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10; 