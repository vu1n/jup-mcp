import { jest } from '@jest/globals';
import request from 'supertest';
import priceRoutes from '../routes/price.js';
import priceService from '../services/price.js';
import { createTestApp, testData, testUtils } from './setup.js';

const app = createTestApp(priceRoutes, '/price');

describe('Price API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    priceService.getPrice = jest.fn();
    priceService.getPrices = jest.fn();
  });

  describe('GET /price/:inputToken/:outputToken', () => {
    it('should return price successfully', async () => {
      const mockResponse = {
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        price: '100',
        timestamp: testUtils.createMockDate()
      };
      priceService.getPrice.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get(`/price/${testData.validTokens.SOL}/${testData.validTokens.USDC}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(priceService.getPrice).toHaveBeenCalledWith(
        testData.validTokens.SOL,
        testData.validTokens.USDC
      );
    });

    it('should validate input token format', async () => {
      const response = await request(app)
        .get(`/price/invalid-token/${testData.validTokens.USDC}`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid input token address format'
      });
    });

    it('should validate output token format', async () => {
      const response = await request(app)
        .get(`/price/${testData.validTokens.SOL}/invalid-token`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid output token address format'
      });
    });

    it('should return 404 when price is not available', async () => {
      priceService.getPrice.mockResolvedValue(null);
      const response = await request(app)
        .get(`/price/${testData.validTokens.SOL}/${testData.validTokens.USDC}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Price not available'
      });
    });

    it('should handle service errors', async () => {
      priceService.getPrice.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get(`/price/${testData.validTokens.SOL}/${testData.validTokens.USDC}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('POST /price/batch', () => {
    const validPayload = {
      pairs: [
        {
          inputToken: testData.validTokens.SOL,
          outputToken: testData.validTokens.USDC
        },
        {
          inputToken: testData.validTokens.USDC,
          outputToken: testData.validTokens.SOL
        }
      ]
    };

    it('should return prices for multiple pairs successfully', async () => {
      const mockResponse = {
        prices: [
          {
            inputToken: testData.validTokens.SOL,
            outputToken: testData.validTokens.USDC,
            price: '100',
            timestamp: testUtils.createMockDate()
          },
          {
            inputToken: testData.validTokens.USDC,
            outputToken: testData.validTokens.SOL,
            price: '0.01',
            timestamp: testUtils.createMockDate()
          }
        ]
      };
      priceService.getPrices.mockResolvedValue(mockResponse);
      const response = await request(app)
        .post('/price/batch')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(priceService.getPrices).toHaveBeenCalledWith(validPayload.pairs);
    });

    it('should validate pairs array is not empty', async () => {
      const response = await request(app)
        .post('/price/batch')
        .send({ pairs: [] });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Pairs array cannot be empty'
      });
    });

    it('should validate pairs array length', async () => {
      const response = await request(app)
        .post('/price/batch')
        .send({
          pairs: Array(101).fill({
            inputToken: testData.validTokens.SOL,
            outputToken: testData.validTokens.USDC
          })
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Maximum 100 pairs allowed per request'
      });
    });

    it('should validate input token format in pairs', async () => {
      const response = await request(app)
        .post('/price/batch')
        .send({
          pairs: [
            {
              inputToken: 'invalid-token',
              outputToken: testData.validTokens.USDC
            }
          ]
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid input token address format in pair 0'
      });
    });

    it('should validate output token format in pairs', async () => {
      const response = await request(app)
        .post('/price/batch')
        .send({
          pairs: [
            {
              inputToken: testData.validTokens.SOL,
              outputToken: 'invalid-token'
            }
          ]
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid output token address format in pair 0'
      });
    });

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/price/batch')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: expect.stringContaining('Missing required parameters')
      });
    });

    it('should handle service errors', async () => {
      priceService.getPrices.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .post('/price/batch')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });

    it('should return partial results when some prices are not available', async () => {
      const mockResponse = {
        prices: [
          {
            inputToken: testData.validTokens.SOL,
            outputToken: testData.validTokens.USDC,
            price: '100',
            timestamp: testUtils.createMockDate()
          },
          null
        ]
      };
      priceService.getPrices.mockResolvedValue(mockResponse);
      const response = await request(app)
        .post('/price/batch')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    it('should validate request body format', async () => {
      const response = await request(app)
        .post('/price/batch')
        .send('invalid-json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid request body format'
      });
    });

    it('should validate for duplicate pairs', async () => {
      const response = await request(app)
        .post('/price/batch')
        .send({
          pairs: [
            {
              inputToken: testData.validTokens.SOL,
              outputToken: testData.validTokens.USDC
            },
            {
              inputToken: testData.validTokens.SOL,
              outputToken: testData.validTokens.USDC
            }
          ]
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Duplicate pairs are not allowed'
      });
    });
  });
}); 