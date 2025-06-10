import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import ultraRoutes from '../routes/ultra.js';
import ultraService from '../services/ultra.js';

const app = express();
app.use(express.json());
app.use('/ultra', ultraRoutes);

describe('Ultra API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ultraService.getQuote = jest.fn();
    ultraService.executeSwap = jest.fn();
  });

  describe('POST /ultra/quote', () => {
    const validPayload = {
      inputToken: 'SOL',
      outputToken: 'USDC',
      amount: '1000000000',
      slippage: 1
    };

    it('should return a quote successfully', async () => {
      const mockResponse = {
        inputToken: 'SOL',
        outputToken: 'USDC',
        amount: '1000000000',
        estimatedOutput: '100000000',
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

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/ultra/quote')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ status: 'error', message: expect.stringContaining('Missing required parameters') });
    });

    it('should handle service errors', async () => {
      ultraService.getQuote.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .post('/ultra/quote')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'Service error' });
    });
  });

  describe('POST /ultra/swap', () => {
    const validPayload = {
      inputToken: 'SOL',
      outputToken: 'USDC',
      amount: '1000000000',
      slippage: 1,
      userPublicKey: '4Nd1m5Qw2pA4Q2Qk5Qw2pA4Q2Qk5Qw2pA4Q2Qk5Qw2pA',
      wrapUnwrapSOL: true
    };

    it('should execute a swap successfully', async () => {
      const mockResponse = {
        transactionId: 'tx123',
        status: 'pending',
        inputToken: 'SOL',
        outputToken: 'USDC',
        amount: '1000000000',
        estimatedOutput: '100000000',
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

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/ultra/swap')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ status: 'error', message: expect.stringContaining('Missing required parameters') });
    });

    it('should handle service errors', async () => {
      ultraService.executeSwap.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .post('/ultra/swap')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'Service error' });
    });
  });
}); 