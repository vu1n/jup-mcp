import { jest } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './setup.js';
import swapRoutes from '../routes/swap.js';
import swapService from '../services/swap.js';

const app = createTestApp(swapRoutes, '/swap');

describe('Swap API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    swapService.getTokens = jest.fn();
    swapService.getTransactions = jest.fn();
  });

  describe('GET /swap/tokens', () => {
    it('should return a list of tokens', async () => {
      const mockResponse = {
        tokens: [
          { address: 'SOL', symbol: 'SOL', name: 'Solana', decimals: 9 },
          { address: 'USDC', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
        ]
      };
      swapService.getTokens.mockResolvedValue(mockResponse);
      const response = await request(app).get('/swap/tokens');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(swapService.getTokens).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      swapService.getTokens.mockRejectedValue(new Error('Service error'));
      const response = await request(app).get('/swap/tokens');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'Service error' });
    });
  });

  describe('GET /swap/transactions', () => {
    it('should return a list of transactions', async () => {
      const mockResponse = {
        transactions: [],
        pagination: { limit: 10, offset: 0, total: 0 }
      };
      swapService.getTransactions.mockResolvedValue(mockResponse);
      const response = await request(app).get('/swap/transactions');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(swapService.getTransactions).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      swapService.getTransactions.mockRejectedValue(new Error('Service error'));
      const response = await request(app).get('/swap/transactions');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'Service error' });
    });
  });
}); 