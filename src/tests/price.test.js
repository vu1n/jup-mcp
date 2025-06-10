import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import priceRoutes from '../routes/price.js';
import priceService from '../services/price.js';

const app = express();
app.use(express.json());
app.use('/price', priceRoutes);

describe('Price API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    priceService.getPrice = jest.fn();
  });

  describe('GET /price', () => {
    it('should return the price for a token pair', async () => {
      const mockResponse = {
        tokenA: 'SOL',
        tokenB: 'USDC',
        price: '100',
        timestamp: 1234567890,
        vsToken: 'USDC'
      };
      priceService.getPrice.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/price?tokenA=SOL&tokenB=USDC');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(priceService.getPrice).toHaveBeenCalledWith('SOL', 'USDC');
    });

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app).get('/price');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ status: 'error', message: expect.stringContaining('required') });
    });

    it('should handle service errors', async () => {
      priceService.getPrice.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get('/price?tokenA=SOL&tokenB=USDC');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'Service error' });
    });
  });
}); 