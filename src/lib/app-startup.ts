import { performDatabaseCleanup } from './db-cleanup';

let startupTasksExecuted = false;

/**
 * Runs startup tasks for the application. This function should only be called once
 * during application initialization.
 */
export async function executeStartupTasks(): Promise<void> {
  if (startupTasksExecuted) {
    console.log('Startup tasks already executed, skipping');
    return;
  }
  
  try {
    console.log('Executing application startup tasks...');
    
    // Run database cleanup to remove orphaned records
    console.log('Running database cleanup task...');
    const cleanupResult = await performDatabaseCleanup();
    
    if (cleanupResult.success) {
      console.log('Database cleanup completed successfully:', cleanupResult.results);
    } else {
      console.error('Database cleanup encountered errors:', cleanupResult.results.error);
    }
    
    // Add other startup tasks here as needed
    
    // Schedule periodic cleanup - every 24 hours
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Only schedule if running in a server environment
    if (typeof window === 'undefined') {
      console.log(`Scheduling periodic database cleanup every ${CLEANUP_INTERVAL / (60 * 60 * 1000)} hours`);
      setInterval(async () => {
        console.log('Running scheduled database cleanup...');
        try {
          const result = await performDatabaseCleanup();
          console.log('Scheduled database cleanup result:', result);
        } catch (error) {
          console.error('Error during scheduled database cleanup:', error);
        }
      }, CLEANUP_INTERVAL);
    }
    
    startupTasksExecuted = true;
    console.log('Application startup tasks completed successfully');
  } catch (error) {
    console.error('Error during application startup tasks:', error);
  }
} 