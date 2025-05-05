/**
 * Utilities for reliable database operations with Neon's serverless database
 * Provides retry mechanisms and error handling for transient connection issues
 */

import { client, executeWithRetry } from './prisma'
import { Prisma } from '@prisma/client'

/**
 * Executes a database operation with automatic retries for handling transient connection issues
 * Particularly useful for serverless databases like Neon that may need time to "wake up"
 * 
 * @param operation - Function that performs the database operation
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @param initialDelay - Initial delay between retries in ms (default: 300ms)
 * @returns Result of the database operation
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 5,
  initialDelay = 300
): Promise<T> {
  let lastError: Error | null = null
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If not the first attempt, log retry information
      if (attempt > 0) {
        console.log(`Database retry attempt ${attempt}/${maxRetries} after ${delay}ms delay`)
      }
      
      // Execute the database operation
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Check if error is a connection error (P1001) or a timeout error
      // Also check for E57P01 error (terminating connection due to administrator command)
      const isConnectionError = 
        error.code === 'P1001' || 
        error.message?.includes("Can't reach database server") ||
        error.message?.includes("Connection timed out") ||
        error.message?.includes("terminating connection due to administrator command") ||
        error.message?.includes("E57P01")
      
      // If it's not a connection-related error or we've exhausted retries, rethrow
      if (!isConnectionError || attempt >= maxRetries) {
        throw error
      }
      
      // Special handling for E57P01 errors (admin termination)
      if (error.message?.includes("terminating connection due to administrator command") || 
          error.message?.includes("E57P01")) {
        console.warn(`Database connection terminated by administrator (attempt ${attempt+1}/${maxRetries+1}). This is common with serverless databases that scale down.`)
        
        // For admin termination, use a longer delay before retrying
        delay = Math.max(delay * 2, 1000)
      } else {
        // Log the connection error
        console.warn(`Database connection error (attempt ${attempt+1}/${maxRetries+1}): ${error.message}`)
        
        // Wait before retrying with exponential backoff
        delay *= 1.5 // Exponential backoff
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw lastError
}

/**
 * Helper functions for common database operations with retry logic built in
 */
export const db = {
  /**
   * Find a unique record with retry logic for connection issues
   */
  findUnique: async <T, A>(
    model: any,
    args: A
  ): Promise<T | null> => {
    return executeWithRetry(() => model.findUnique(args))
  },
  
  /**
   * Find first matching record with retry logic for connection issues
   */
  findFirst: async <T, A>(
    model: any,
    args: A
  ): Promise<T | null> => {
    return executeWithRetry(() => model.findFirst(args))
  },
  
  /**
   * Find many records with retry logic for connection issues
   */
  findMany: async <T, A>(
    model: any,
    args: A
  ): Promise<T[]> => {
    return executeWithRetry(() => model.findMany(args))
  },
  
  /**
   * Create a record with retry logic for connection issues
   */
  create: async <T, A>(
    model: any,
    args: A
  ): Promise<T> => {
    return executeWithRetry(() => model.create(args))
  },
  
  /**
   * Update a record with retry logic for connection issues
   */
  update: async <T, A>(
    model: any,
    args: A
  ): Promise<T> => {
    return executeWithRetry(() => model.update(args))
  },
  
  /**
   * Delete a record with retry logic for connection issues
   */
  delete: async <T, A>(
    model: any,
    args: A
  ): Promise<T> => {
    return executeWithRetry(() => model.delete(args))
  },
  
  /**
   * Execute a raw query with retry logic
   */
  $queryRaw: async <T>(
    query: Prisma.Sql | TemplateStringsArray,
    ...values: any[]
  ): Promise<T> => {
    return executeWithRetry(() => client.$queryRaw<T>(query, ...values))
  },
  
  /**
   * Run a transaction with retry logic for connection issues
   */
  $transaction: async <T>(
    fn: (prisma: typeof client) => Promise<T>
  ): Promise<T> => {
    return executeWithRetry(() => client.$transaction(fn))
  }
}

// Example usage:
// import { db } from './db-utils'
// 
// // Instead of:
// // const user = await prisma.user.findUnique({ where: { id } })
// 
// // Use:
// const user = await db.findUnique(prisma.user, { where: { id } }) 