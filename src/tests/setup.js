import { jest } from '@jest/globals';
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env.test if it exists
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Create a test app factory
export const createTestApp = (routes, basePath = '/') => {
  const app = express();
  app.use(express.json());
  app.use(basePath, routes);
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

  // Create a mock date for testing
  createMockDate: (daysFromNow = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + Number(daysFromNow));
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