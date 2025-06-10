import { jest } from '@jest/globals';
import request from 'supertest';
import ultraRoutes from '../routes/ultra.js';
import ultraService from '../services/ultra.js';
import { createTestApp, testData, testUtils } from './setup.js';

const app = createTestApp(ultraRoutes, '/ultra');

describe('Ultra API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ultraService.getQuote = jest.fn();
    ultraService.executeSwap = jest.fn();
    ultraService.getSwapHistory = jest.fn();
    ultraService.getSwapStatus = jest.fn();
  });

  describe('POST /ultra/quote', () => {
    const validPayload = {
      inputToken: testData.validTokens.SOL,
      outputToken: testData.validTokens.USDC,
      amount: testData.validAmounts.SOL,
      slippage: 1
    };

    it('should return a quote successfully', async () => {
      const mockResponse = {
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        amount: testData.validAmounts.SOL,
        estimatedOutput: testData.validAmounts.USDC,
        price: '100',
        priceImpact: '0.1',
        route: [],
        otherAmountThreshold: null,
        swapMode: 'ExactIn'
      };
      ultraService.getQuote.mockResolvedValue(mockResponse);
      const response = await request(app)
        .post('/ultra/quote')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(ultraService.getQuote).toHaveBeenCalledWith(
        validPayload.inputToken,
        validPayload.outputToken,
        validPayload.amount,
        validPayload.slippage
      );
    });

    it('should validate input token format', async () => {
      const response = await request(app)
        .post('/ultra/quote')
        .send({
          ...validPayload,
          inputToken: 'invalid-token'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid input token address format'
      });
    });

    it('should validate output token format', async () => {
      const response = await request(app)
        .post('/ultra/quote')
        .send({
          ...validPayload,
          outputToken: 'invalid-token'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid output token address format'
      });
    });

    it('should validate amount is positive', async () => {
      const invalidPayload = {
        ...validPayload,
        amount: '-1'
      };
      const response = await request(app)
        .post('/ultra/quote')
        .send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Amount must be a positive number'
      });
    });

    it('should validate slippage range', async () => {
      const invalidPayload = {
        ...validPayload,
        slippage: 101
      };
      const response = await request(app)
        .post('/ultra/quote')
        .send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Slippage must be a number between 0 and 100'
      });
    });

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/ultra/quote')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ 
        status: 'error', 
        message: expect.stringContaining('Missing required parameters') 
      });
    });

    it('should handle service errors', async () => {
      ultraService.getQuote.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .post('/ultra/quote')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ 
        status: 'error', 
        message: 'Service error' 
      });
    });
  });

  describe('POST /ultra/swap', () => {
    const validPayload = {
      inputToken: testData.validTokens.SOL,
      outputToken: testData.validTokens.USDC,
      amount: testData.validAmounts.SOL,
      slippage: 1,
      userPublicKey: testData.validSolanaAddress,
      wrapUnwrapSOL: true
    };

    it('should execute a swap successfully', async () => {
      const mockResponse = {
        transactionId: testUtils.generateTransactionId(),
        status: 'pending',
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        amount: testData.validAmounts.SOL,
        estimatedOutput: testData.validAmounts.USDC,
        price: '100',
        priceImpact: '0.1'
      };
      ultraService.executeSwap.mockResolvedValue(mockResponse);
      const response = await request(app)
        .post('/ultra/swap')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(ultraService.executeSwap).toHaveBeenCalledWith(
        validPayload.inputToken,
        validPayload.outputToken,
        validPayload.amount,
        validPayload.slippage,
        validPayload.userPublicKey,
        validPayload.wrapUnwrapSOL
      );
    });

    it('should validate user public key format', async () => {
      const invalidPayload = {
        ...validPayload,
        userPublicKey: 'invalid-address'
      };
      const response = await request(app)
        .post('/ultra/swap')
        .send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid Solana public key format'
      });
    });

    it('should validate amount is positive', async () => {
      const invalidPayload = {
        ...validPayload,
        amount: '-1'
      };
      const response = await request(app)
        .post('/ultra/swap')
        .send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Amount must be a positive number'
      });
    });

    it('should validate slippage range', async () => {
      const invalidPayload = {
        ...validPayload,
        slippage: 101
      };
      const response = await request(app)
        .post('/ultra/swap')
        .send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Slippage must be a number between 0 and 100'
      });
    });

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/ultra/swap')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ 
        status: 'error', 
        message: expect.stringContaining('Missing required parameters') 
      });
    });

    it('should handle service errors', async () => {
      ultraService.executeSwap.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .post('/ultra/swap')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ 
        status: 'error', 
        message: 'Service error' 
      });
    });
  });

  describe('GET /ultra/history', () => {
    const validQuery = {
      userPublicKey: testData.validSolanaAddress,
      limit: 10,
      offset: 0
    };

    it('should get swap history successfully', async () => {
      const mockResponse = {
        swaps: [
          {
            transactionId: testUtils.generateTransactionId(),
            status: 'completed',
            inputToken: testData.validTokens.SOL,
            outputToken: testData.validTokens.USDC,
            amount: testData.validAmounts.SOL,
            outputAmount: testData.validAmounts.USDC,
            price: '100',
            priceImpact: '0.1',
            timestamp: testUtils.createMockDate()
          }
        ],
        total: 1
      };
      ultraService.getSwapHistory.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/ultra/history')
        .query(validQuery);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(ultraService.getSwapHistory).toHaveBeenCalledWith(
        validQuery.userPublicKey,
        validQuery.limit,
        validQuery.offset
      );
    });

    it('should validate user public key format', async () => {
      const response = await request(app)
        .get('/ultra/history')
        .query({
          ...validQuery,
          userPublicKey: 'invalid-address'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid Solana public key format'
      });
    });

    it('should validate limit and offset are positive', async () => {
      const response = await request(app)
        .get('/ultra/history')
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

    it('should handle service errors', async () => {
      ultraService.getSwapHistory.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get('/ultra/history')
        .query(validQuery);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('GET /ultra/status/:swapId', () => {
    const swapId = testUtils.generateTransactionId();

    it('should get swap status successfully', async () => {
      const mockResponse = {
        transactionId: swapId,
        status: 'completed',
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        amount: testData.validAmounts.SOL,
        outputAmount: testData.validAmounts.USDC,
        price: '100',
        priceImpact: '0.1',
        timestamp: testUtils.createMockDate()
      };
      ultraService.getSwapStatus.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get(`/ultra/status/${swapId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(ultraService.getSwapStatus).toHaveBeenCalledWith(swapId);
    });

    it('should return 400 when swap ID is missing', async () => {
      const response = await request(app)
        .get('/ultra/status/');
      expect(response.status).toBe(404);
    });

    it('should handle service errors', async () => {
      ultraService.getSwapStatus.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get(`/ultra/status/${swapId}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });
}); 