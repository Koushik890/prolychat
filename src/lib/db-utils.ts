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
  maxRetries = 0,
  initialDelay = 10
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      // Check if error is a connection error
      const isConnectionError = 
        error.code === 'P1001' || 
        error.message?.includes("Can't reach database server") ||
        error.message?.includes("Connection timed out") ||
        error.message?.includes("terminating connection due to administrator command") ||
        error.message?.includes("E57P01")
      
      // If it's not a connection-related error or we've exhausted retries, rethrow immediately
      if (!isConnectionError || attempt >= maxRetries) {
        throw error
      }
      
      // Minimal delay for connection errors only
      await new Promise(resolve => setTimeout(resolve, initialDelay))
    }
  }

  // This should never be reached
  throw new Error('Retry logic error')
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
  $queryRaw: async (
    query: Prisma.Sql | TemplateStringsArray,
    ...values: any[]
  ): Promise<any> => {
    return executeWithRetry(() => client.$queryRaw(query, ...values))
  },
  

}

// Example usage:
// import { db } from './db-utils'
// 
// // Instead of:
// // const user = await prisma.user.findUnique({ where: { id } })
// 
// // Use:
// const user = await db.findUnique(prisma.user, { where: { id } }) 