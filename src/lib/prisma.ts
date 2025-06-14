import { PrismaClient } from "@prisma/client";
import { 
  isConnectionError, 
  getRetryDelay, 
  RETRY_CONFIG,
  getDatabaseUrl 
} from "./database-config";

declare global {
    var prisma: PrismaClient | undefined
}

/**
 * Helper function to execute Prisma queries with automatic retry for connection errors
 * Specifically handles E57P01 errors (terminating connection due to administrator command)
 */
export async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = RETRY_CONFIG.maxRetries): Promise<T> {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      // Enhanced error logging
      console.error('Database operation failed:', {
        attempt: retries + 1,
        maxRetries,
        errorCode: error?.code,
        errorMessage: error?.message,
        timestamp: new Date().toISOString()
      });
      
      // Check if we've reached max retries
      if (retries >= maxRetries) {
        console.error('Max retries reached, throwing error');
        throw error;
      }
      
      // Check if it's a connection error that should trigger a retry
      if (isConnectionError(error)) {
        console.log(`Database connection error detected, retrying (${retries + 1}/${maxRetries})...`);
        retries++;
        
        // Calculate backoff delay
        const backoffTime = getRetryDelay(retries);
        console.log(`Waiting ${backoffTime}ms before retry...`);
        
        await new Promise(r => setTimeout(r, backoffTime)); 
        continue;
      }
      
      // Re-throw other errors immediately
      console.error('Non-connection error, not retrying:', error.message);
      throw error;
    }
  }
}

/**
 * Configure PrismaClient with explicit connection management and retry logic
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: getDatabaseUrl() // Use our optimized database URL
      }
    }
  })

  return client
}

// Use globalThis to store the client instance in development to prevent hot-reload issues
export const client = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = client

// Add a utility for testing connection health
export const testConnection = async (): Promise<boolean> => {
  try {
    await client.$queryRaw`SELECT 1`
    console.log('Database connection test successful')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

// Add a utility for graceful shutdown
export const disconnectPrisma = async (): Promise<void> => {
  try {
    await client.$disconnect()
    console.log('Prisma client disconnected successfully')
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error)
  }
}

// Export a wrapped client with automatic retry for common operations
export const prismaWithRetry = {
  // Wrap common Prisma operations with retry logic
  async $queryRaw<T = unknown>(query: any, ...values: any[]): Promise<T> {
    return executeWithRetry(() => client.$queryRaw(query, ...values))
  },
  
  async $executeRaw(query: any, ...values: any[]): Promise<number> {
    return executeWithRetry(() => client.$executeRaw(query, ...values))
  },
  
  async $transaction<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return executeWithRetry(() => client.$transaction(fn))
  },
  
  // Expose the original client for direct access when needed
  client: client
}

// Keep the original client export for backward compatibility
export default client