import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import tokenRoutes from '../routes/token.js';
import tokenService from '../services/token.js';

const app = express();
app.use(express.json());
app.use('/token', tokenRoutes);

describe('Token API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.getTokenInfo = jest.fn();
    tokenService.getTokenList = jest.fn();
  });

  describe('GET /token/info/:address', () => {
    it('should return token info', async () => {
      const mockResponse = {
        address: 'SOL',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://example.com/logo.png',
        tags: ['defi']
      };
      tokenService.getTokenInfo.mockResolvedValue(mockResponse);
      const response = await request(app).get('/token/info/SOL');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(tokenService.getTokenInfo).toHaveBeenCalledWith('SOL');
    });

    it('should handle service errors', async () => {
      tokenService.getTokenInfo.mockRejectedValue(new Error('Service error'));
      const response = await request(app).get('/token/info/SOL');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'Service error' });
    });
  });

  describe('GET /token/list', () => {
    it('should return a list of tokens', async () => {
      const mockResponse = {
        tokens: [
          { address: 'SOL', symbol: 'SOL', name: 'Solana', decimals: 9 },
          { address: 'USDC', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
        ],
        pagination: { total: 2 }
      };
      tokenService.getTokenList.mockResolvedValue(mockResponse);
      const response = await request(app).get('/token/list');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(tokenService.getTokenList).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      tokenService.getTokenList.mockRejectedValue(new Error('Service error'));
      const response = await request(app).get('/token/list');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'Service error' });
    });
  });
}); 