import { jest } from '@jest/globals';
import request from 'supertest';
import tokenRoutes from '../routes/token.js';
import tokenService from '../services/token.js';
import { createTestApp, testData, testUtils } from './setup.js';

const app = createTestApp(tokenRoutes, '/token');

describe('Token API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.getTokenInfo = jest.fn();
    tokenService.getTokenList = jest.fn();
  });

  describe('GET /token/info/:tokenAddress', () => {
    it('should return token info successfully', async () => {
      const mockResponse = {
        address: testData.validTokens.SOL,
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        logoURI: 'https://example.com/sol.png',
        tags: ['native'],
        verified: true
      };
      tokenService.getTokenInfo.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get(`/token/info/${testData.validTokens.SOL}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(tokenService.getTokenInfo).toHaveBeenCalledWith(testData.validTokens.SOL);
    });

    it('should validate token address format', async () => {
      const response = await request(app)
        .get('/token/info/invalid-address');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid token address format'
      });
    });

    it('should return 404 when token is not found', async () => {
      tokenService.getTokenInfo.mockResolvedValue(null);
      const response = await request(app)
        .get(`/token/info/${testData.validTokens.SOL}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Token not found'
      });
    });

    it('should handle service errors', async () => {
      tokenService.getTokenInfo.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get(`/token/info/${testData.validTokens.SOL}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('GET /token/list', () => {
    const validQuery = {
      limit: 10,
      offset: 0,
      search: 'SOL',
      tags: ['native'],
      verified: true
    };

    it('should return token list successfully', async () => {
      const mockResponse = {
        tokens: [
          {
            address: testData.validTokens.SOL,
            name: 'Solana',
            symbol: 'SOL',
            decimals: 9,
            logoURI: 'https://example.com/sol.png',
            tags: ['native'],
            verified: true
          },
          {
            address: testData.validTokens.USDC,
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: 'https://example.com/usdc.png',
            tags: ['stablecoin'],
            verified: true
          }
        ],
        total: 2
      };
      tokenService.getTokenList.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/token/list')
        .query(validQuery);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(tokenService.getTokenList).toHaveBeenCalledWith(
        validQuery.limit,
        validQuery.offset,
        validQuery.search,
        validQuery.tags,
        validQuery.verified
      );
    });

    it('should validate limit and offset are positive', async () => {
      const response = await request(app)
        .get('/token/list')
        .query({
          ...validQuery,
          limit: -1,
          offset: -1
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Limit and offset must be positive numbers'
      });
    });

    it('should validate maximum limit', async () => {
      const response = await request(app)
        .get('/token/list')
        .query({
          ...validQuery,
          limit: 1001
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Maximum limit is 1000'
      });
    });

    it('should validate search parameter format', async () => {
      const response = await request(app)
        .get('/token/list')
        .query({
          ...validQuery,
          search: { invalid: 'format' }
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Search parameter must be a string'
      });
    });

    it('should validate tags is an array', async () => {
      const response = await request(app)
        .get('/token/list')
        .query({
          ...validQuery,
          tags: 'native'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Tags must be an array'
      });
    });

    it('should validate verified is boolean', async () => {
      const response = await request(app)
        .get('/token/list')
        .query({
          ...validQuery,
          verified: 'true'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Verified must be a boolean'
      });
    });

    it('should handle service errors', async () => {
      tokenService.getTokenList.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get('/token/list')
        .query(validQuery);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });

    it('should return empty list when no tokens match criteria', async () => {
      const mockResponse = {
        tokens: [],
        total: 0
      };
      tokenService.getTokenList.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/token/list')
        .query(validQuery);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });
  });
}); 