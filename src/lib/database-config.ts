/**
 * Database Configuration for PostgreSQL Connection Management
 * 
 * This configuration is specifically designed to handle connection termination issues
 * such as E57P01 (terminating connection due to administrator command) that occur
 * with PostgreSQL databases, especially with cloud providers like Neon, Supabase, etc.
 */

export const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL
  
  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Parse the URL to add connection parameters
  const url = new URL(baseUrl)
  
  // Add connection pool parameters to prevent connection termination
  const params = new URLSearchParams(url.search)
  
  // Connection pool settings
  params.set('connection_limit', '5')       // Limit concurrent connections
  params.set('pool_timeout', '20')          // Pool timeout in seconds
  params.set('connect_timeout', '30')       // Connection timeout in seconds
  
  // PostgreSQL specific parameters for connection stability
  params.set('statement_timeout', '60000')   // 60 second statement timeout
  params.set('idle_in_transaction_session_timeout', '300000') // 5 minute idle timeout
  params.set('tcp_keepalives_idle', '600')   // 10 minutes
  params.set('tcp_keepalives_interval', '30') // 30 seconds
  params.set('tcp_keepalives_count', '3')    // 3 retries
  
  // SSL settings (required for most cloud providers)
  params.set('sslmode', 'require')
  
  // Application name for connection tracking
  	params.set('application_name', 'prolychat')
  
  url.search = params.toString()
  return url.toString()
}

export const getDirectUrl = () => {
  const directUrl = process.env.DIRECT_URL
  
  if (!directUrl) {
    // Fallback to DATABASE_URL if DIRECT_URL is not set
    return getDatabaseUrl()
  }
  
  // Add connection parameters to direct URL as well
  const url = new URL(directUrl)
  const params = new URLSearchParams(url.search)
  
  // Direct connection settings (for migrations)
  params.set('connect_timeout', '30')
  params.set('statement_timeout', '120000')  // Longer timeout for migrations
  params.set('sslmode', 'require')
  	params.set('application_name', 'prolychat-direct')
  
  url.search = params.toString()
  return url.toString()
}

export const getShadowDatabaseUrl = () => {
  const shadowUrl = process.env.SHADOW_DATABASE_URL
  
  if (!shadowUrl) {
    // Generate shadow database URL from main database URL
    const mainUrl = process.env.DATABASE_URL
    if (!mainUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    const url = new URL(mainUrl)
    // Add '_shadow' suffix to the database name
    const pathParts = url.pathname.split('/')
    if (pathParts.length > 1) {
      pathParts[1] = pathParts[1] + '_shadow'
      url.pathname = pathParts.join('/')
    }
    
    // Add connection parameters
    const params = new URLSearchParams(url.search)
    params.set('connect_timeout', '30')
    params.set('sslmode', 'require')
    	params.set('application_name', 'prolychat-shadow')
    
    url.search = params.toString()
    return url.toString()
  }
  
  return shadowUrl
}

/**
 * Connection retry configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 150,
  maxDelay: 800,
  exponentialBase: 1.5
}

/**
 * Error codes that indicate connection termination and should trigger a retry
 */
export const CONNECTION_ERROR_CODES = [
  'P1001', // Can't reach database server
  'P1002', // Database server was reached but timed out
  'P1017', // Server has closed the connection
  'P1013', // The provided database string is invalid
  'E57P01', // PostgreSQL: terminating connection due to administrator command
  'ECONNRESET', // Connection reset by peer
  'ETIMEDOUT', // Connection timeout
  'ENOTFOUND', // DNS lookup failed
  'ECONNREFUSED' // Connection refused
]

/**
 * Check if an error is a connection error that should trigger a retry
 */
export const isConnectionError = (error: any): boolean => {
  if (!error) return false
  
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code || ''
  
  // Check error codes
  if (CONNECTION_ERROR_CODES.some(code => errorCode.includes(code))) {
    return true
  }
  
  // Check error messages
  const connectionErrorPatterns = [
    'terminating connection due to administrator command',
    'server has closed the connection',
    'connection terminated',
    'connection reset',
    'connection refused',
    'timeout',
    'econnreset',
    'etimedout',
    'enotfound',
    'econnrefused'
  ]
  
  return connectionErrorPatterns.some(pattern => errorMessage.includes(pattern))
}

/**
 * Calculate retry delay with exponential backoff
 */
export const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.exponentialBase, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
} 