/**
 * Script to update existing automation records with runCount field
 * 
 * This script:
 * 1. Retrieves all automations and their listeners
 * 2. Calculates the run count based on max(dmCount, commentCount)
 * 3. Updates each automation with the calculated runCount
 * 
 * Run with: npx ts-node src/scripts/update-run-count.ts
 */

// Using require instead of import for CommonJS compatibility
const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

// Simple retry function since we don't have access to withDatabaseRetry
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) throw error;
      console.log(`Retrying operation, attempt ${retries}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 500 * retries));
    }
  }
  throw new Error('Should not reach here');
}

async function updateRunCounts() {
  try {
    console.log('Fetching automations...');
    
    // Get all automations with their listeners
    const automations = await withRetry(() => 
      client.automation.findMany({
        include: {
          listener: true
        }
      })
    ) as any[];
    
    console.log(`Found ${automations.length} automations to update`);
    
    let updatedCount = 0;
    
    // Process each automation
    for (const automation of automations) {
      const listener = automation.listener;
      if (!listener) continue;
      
      // Calculate the run count using the same logic from before
      const dmCount = listener.dmCount || 0;
      const commentCount = listener.commentCount || 0;
      const runCount = Math.max(dmCount, commentCount);
      
      // Skip if runCount is already set and equal
      if (automation.runCount === runCount) {
        console.log(`Automation ${automation.id} already has correct runCount of ${runCount}`);
        continue;
      }
      
      // Update the automation with the calculated runCount
      await withRetry(() => 
        client.automation.update({
          where: { id: automation.id },
          data: { runCount }
        })
      );
      
      console.log(`Updated automation ${automation.id}: runCount = ${runCount}`);
      updatedCount++;
    }
    
    console.log(`Successfully updated ${updatedCount} automation records`);
    
  } catch (error) {
    console.error('Error updating run counts:', error);
  } finally {
    await client.$disconnect();
  }
}

// Run the function
updateRunCounts()
  .then(() => console.log('Done!'))
  .catch(console.error); 