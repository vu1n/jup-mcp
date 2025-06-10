module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: '*', // Configure this based on your needs
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },

  // jup.ag API configuration
  jupAg: {
    baseUrl: 'https://quote-api.jup.ag/v6',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000 // 1 second
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    timestamp: true
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Cache configuration
  cache: {
    enabled: true,
    ttl: 60, // 60 seconds
    maxSize: 1000 // maximum number of items in cache
  }
}; 