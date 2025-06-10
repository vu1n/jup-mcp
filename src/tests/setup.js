import { jest } from '@jest/globals';
import express from 'express';
import dotenv from 'dotenv';
import { ValidationError, NotFoundError, UnauthorizedError, ServiceError } from '../utils/errors.js';
import qs from 'qs';

// Load environment variables from .env.test if it exists
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Create a test app factory
export const createTestApp = (routes, basePath = '/') => {
  const app = express();
  // Use qs for robust query parsing so array parameters (even with a single element)
  // are correctly parsed as JavaScript arrays. This is required for tests that
  // expect ?tags=native (coming from query({ tags: ['native'] })) to arrive as
  // [ 'native' ] instead of the default string.
  app.set('query parser', str => qs.parse(str, { comma: false, allowDots: false }));
  app.use(express.json());

  // Handle JSON parsing errors
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request body format'
      });
    }
    next(err);
  });

  app.use(basePath, routes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof ValidationError) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }

    if (err instanceof NotFoundError) {
      return res.status(404).json({
        status: 'error',
        message: err.message
      });
    }

    if (err instanceof UnauthorizedError) {
      return res.status(401).json({
        status: 'error',
        message: err.message
      });
    }

    if (err instanceof ServiceError) {
      return res.status(err.status).json({
        status: 'error',
        message: err.message
      });
    }

    // Treat any other error as a ServiceError
    if (err instanceof Error) {
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Internal server error'
      });
    }

    // Default error handler
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error'
    });
  });

  return app;
};

// Mock logger to prevent console output during tests
jest.mock('../utils/logger.js', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
  stream: {
    write: jest.fn(),
  },
}));

// Common test data
export const testData = {
  validSolanaAddress: '4Nd1m5Qw2pA4Q2Qk5Qw2pA4Q2Qk5Qw2pA4Q2Qk5Qw2pA',
  validTokens: {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
  validAmounts: {
    SOL: '1000000000', // 1 SOL in lamports
    USDC: '1000000',   // 1 USDC in decimals
  },
  validFrequencies: ['daily', 'weekly', 'monthly', 'yearly'],
};

// Common test utilities
export const testUtils = {
  // Generate a random Solana address for testing
  generateSolanaAddress: () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate a random payment ID for testing
  generatePaymentId: () => {
    return `payment_${Math.random().toString(36).substring(2, 15)}`;
  },

  // Generate a random transaction ID for testing
  generateTransactionId: () => {
    return `tx_${Math.random().toString(36).substring(2, 15)}`;
  },

  // Create a mock date for testing.
  // Accepts either:
  //   • a number representing days from now (e.g. 7)
  //   • a millisecond offset (e.g. Date.now() + 7*24*60*60*1000).
  // Detect large numbers (>= 86_400_000) and treat them as an absolute
  // millisecond timestamp. Otherwise interpret the argument as a day offset.
  createMockDate: (offset = 0) => {
    const date = new Date();

    // If caller passed a big number (likely `Date.now() + ms`) treat it as a
    // millisecond timestamp rather than a day count.
    if (typeof offset === 'number' && Math.abs(offset) >= 86_400_000) {
      const future = new Date(offset);
      return isNaN(future.getTime()) ? new Date().toISOString() : future.toISOString();
    }

    // Otherwise treat as days delta.
    date.setDate(date.getDate() + Number(offset));
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  },
};

// Common test matchers
expect.extend({
  toBeValidSolanaAddress(received) {
    const pass = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(received);
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid Solana address`,
      pass,
    };
  },

  toBeValidAmount(received) {
    const pass = !isNaN(received) && Number(received) > 0;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid amount`,
      pass,
    };
  },

  toBeValidFrequency(received) {
    const pass = testData.validFrequencies.includes(received);
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid frequency`,
      pass,
    };
  },
});

// Global setup and teardown
beforeAll(() => {
  // Add any global setup here
});

afterAll(() => {
  // Add any global cleanup here
  jest.clearAllMocks();
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
}); 