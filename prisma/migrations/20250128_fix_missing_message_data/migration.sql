-- Migration to fix missing message data for existing listeners
-- This addresses the bug where the previous migration removed the Listener.message column
-- but didn't migrate existing data to the new Message table

-- Insert default message data for any listeners that don't have message data
INSERT INTO "Message" (
    "listenerId", 
    "type", 
    "textContent", 
    "createdAt", 
    "updatedAt"
)
SELECT 
    l.id,
    'TEXT' as type,
    'Hello! Thanks for your message.' as "textContent",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM "Listener" l
LEFT JOIN "Message" m ON l.id = m."listenerId"
WHERE m."listenerId" IS NULL;

-- Update listener status to indicate they need reconfiguration
UPDATE "Listener" 
SET status = 'UNCONFIGURED', 
    "updatedAt" = NOW()
WHERE id IN (
    SELECT l.id 
    FROM "Listener" l
    LEFT JOIN "Message" m ON l.id = m."listenerId"
    WHERE m."listenerId" IS NULL
); 