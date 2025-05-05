import { client } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/db-utils'

/**
 * Cleans up orphaned Dms records where automationId is not null but the automation no longer exists
 * This is a safety measure in case the CASCADE constraint doesn't work
 */
export async function cleanupOrphanedDmsRecords(): Promise<{ deletedCount: number }> {
  try {
    // First find all Dms records with automation IDs
    const allDmsWithAutomationId = await withDatabaseRetry(() => 
      client.dms.findMany({
        where: {
          automationId: {
            not: null
          }
        },
        select: {
          id: true,
          automationId: true
        }
      })
    );
    
    console.log(`Found ${allDmsWithAutomationId.length} Dms records with automation IDs`);
    
    // Extract the unique automation IDs
    const automationIds = [...new Set(
      allDmsWithAutomationId
        .map(record => record.automationId)
        .filter(Boolean) as string[]
    )];
    
    console.log(`Found ${automationIds.length} unique automation IDs`);
    
    // Find which automation IDs actually exist
    const existingAutomations = await withDatabaseRetry(() => 
      client.automation.findMany({
        where: {
          id: {
            in: automationIds
          }
        },
        select: {
          id: true
        }
      })
    );
    
    const existingAutomationIds = new Set(existingAutomations.map(a => a.id));
    console.log(`Found ${existingAutomationIds.size} existing automations`);
    
    // Find orphaned Dms records
    const orphanedDmsRecords = allDmsWithAutomationId.filter(
      record => record.automationId && !existingAutomationIds.has(record.automationId)
    );
    
    console.log(`Found ${orphanedDmsRecords.length} orphaned Dms records to delete`);
    
    if (orphanedDmsRecords.length === 0) {
      return { deletedCount: 0 };
    }
    
    // Delete the orphaned records
    const deleteResult = await withDatabaseRetry(() => 
      client.dms.deleteMany({
        where: {
          id: {
            in: orphanedDmsRecords.map(record => record.id)
          }
        }
      })
    );
    
    console.log(`Successfully deleted ${deleteResult.count} orphaned Dms records`);
    
    return { deletedCount: deleteResult.count };
  } catch (error) {
    console.error('Error cleaning up orphaned Dms records:', error);
    throw error;
  }
}

/**
 * Cleanup function that can be called on server startup or through an admin endpoint
 */
export async function performDatabaseCleanup(): Promise<{ success: boolean; results: any }> {
  try {
    const dmsCleanupResult = await cleanupOrphanedDmsRecords();
    
    // Add other cleanup operations here as needed
    
    return {
      success: true,
      results: {
        dmsCleanup: dmsCleanupResult
      }
    };
  } catch (error) {
    console.error('Database cleanup failed:', error);
    return {
      success: false,
      results: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
} 