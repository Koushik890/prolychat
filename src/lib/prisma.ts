import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined
}

// Connection options specifically optimized for Neon's serverless database
const connectionOptions = {
  // Maximum number of connections in the pool - reduce from 5 to 3 to prevent exhaustion
  poolSize: 3, 
  // More aggressive timeouts for better connection management
  timeout: 20, // Reduced from 30 seconds timeout
  connectionTimeout: 10000, // Reduced from 15 seconds to 10 seconds
  keepalives: 1,
  keepalivesIdle: 5,
  application_name: 'omnisocial'
}

/**
 * Helper function to execute Prisma queries with automatic retry for connection errors
 * Specifically handles E57P01 errors (terminating connection due to administrator command)
 */
export async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
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
      });
      
      // Check if we've reached max retries
      if (retries >= maxRetries) throw error;
      
      // Check if it's the specific connection error we're trying to handle
      const isConnectionError = error?.message?.includes('terminating connection due to administrator command') ||
        error?.message?.includes('E57P01') ||
        error?.code === 'P1001' ||
        error?.code === 'P1002' ||
        error?.code === 'P1017' || // Adding P1017 (Server has closed the connection)
        error?.code === 'P1013' || // Adding P1013 (The provided database string is invalid)
        error?.message?.includes('ECONNRESET') || // Reset connection errors
        error?.message?.includes('ConnectionReset') || // Windows connection reset
        (error?.message?.includes('connection') && error?.message?.includes('terminated'));
        
      if (isConnectionError) {
        console.log(`Database connection terminated, retrying (${retries + 1}/${maxRetries})...`);
        retries++;
        // Exponential backoff: wait longer between each retry but cap at 2 seconds
        const backoffTime = Math.min(500 * Math.pow(1.5, retries), 2000);
        await new Promise(r => setTimeout(r, backoffTime)); 
        continue;
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Configure PrismaClient with explicit connection management and retry logic:
 * - Shorter connection timeouts to fail fast and retry
 * - More detailed logging to troubleshoot connection issues
 * - Custom error handling and retries for transient connection failures
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // @ts-ignore - These are Prisma's internal connection options
    __internal: {
      engine: {
        connectionLimit: 3, // Reduce from 5 to prevent connection exhaustion
        retry: {
          // Enhanced retry settings for intermittent connection issues
          maxRetries: 3, // Reduced from 5 to make failures faster
          backoffDelay: 300, // Reduced from 500ms to 300ms
          isolationLevel: 'ReadCommitted',
        },
        // Pool settings for connection management
        pool: {
          min: 0, // Start with 0 connections to prevent idle connections
          max: 3, // Reduce from 5 to 3 to prevent connection exhaustion
          validateConnection: true,
          // Lower the idle timeout to release connections faster
          idleTimeoutMs: 20000, // Reduced from 30 seconds to 20 seconds
        }
      }
    }
  })

  // Add custom error handling with proper type
  // @ts-ignore - Handle Prisma event types
  client.$on('error', (e: any) => {
    console.error('Prisma Client error:', e)
    
    // Check if error is related to connection termination
    const isConnectionTermination = e?.message?.includes('terminating connection due to administrator command') ||
      e?.message?.includes('ConnectionReset') ||
      e?.message?.includes('ECONNRESET');
      
    if (isConnectionTermination) {
      console.warn('Detected connection termination - attempting to reconnect automatically')
      // Try to disconnect and reconnect on next query
      client.$disconnect().catch(err => console.error('Error disconnecting client:', err));
    }
  })

  return client
}

// Use globalThis to store the client instance in development to prevent hot-reload issues
export const client = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = client

// Add a utility for reconnecting in case of persistent issues
export const reconnectPrisma = async () => {
  try {
    await client.$disconnect()
    console.log('Prisma client disconnected')
    
    // Small delay before reconnection
    await new Promise(r => setTimeout(r, 1000))
    
    // Force a new connection 
    await client.$connect()
    console.log('Prisma client reconnected successfully')
    
    return true
  } catch (error) {
    console.error('Failed to reconnect Prisma client:', error)
    return false
  }
}

// Add a function to explicitly release connections after webhook processing
export const releaseConnections = async () => {
  try {
    // This doesn't close the client, but signals to release idle connections
    await client.$disconnect();
    return true;
  } catch (error) {
    console.error('Failed to release connections:', error);
    return false;
  }
}