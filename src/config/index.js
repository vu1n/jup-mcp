import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',

  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000'],

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100
  },

  // jup.ag API configuration
  jupAgApi: {
    baseUrl: process.env.JUP_AG_API_URL || 'https://quote-api.jup.ag/v6',
    timeout: parseInt(process.env.JUP_AG_API_TIMEOUT || '5000', 10)
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  // Security
  security: {
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    helmetEnabled: process.env.HELMET_ENABLED !== 'false'
  }
};

export { config }; 