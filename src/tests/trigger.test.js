import { jest } from '@jest/globals';
import request from 'supertest';
import triggerRoutes from '../routes/trigger.js';
import triggerService from '../services/trigger.js';
import { createTestApp, testData, testUtils } from './setup.js';

const app = createTestApp(triggerRoutes, '/trigger');

describe('Trigger API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    triggerService.createTriggerOrder = jest.fn();
    triggerService.getTriggerOrders = jest.fn();
    triggerService.updateTriggerOrder = jest.fn();
    triggerService.cancelTriggerOrder = jest.fn();
  });

  describe('POST /trigger/create', () => {
    const validPayload = {
      inputToken: testData.validTokens.SOL,
      outputToken: testData.validTokens.USDC,
      amount: testData.validAmounts.SOL,
      triggerPrice: '100',
      triggerType: 'above',
      userPublicKey: testData.validSolanaAddress,
      expiryDate: testUtils.createMockDate(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    it('should create a trigger order successfully', async () => {
      const mockResponse = {
        id: testUtils.generateTransactionId(),
        status: 'active',
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        amount: testData.validAmounts.SOL,
        triggerPrice: '100',
        triggerType: 'above',
        userPublicKey: testData.validSolanaAddress,
        expiryDate: validPayload.expiryDate,
        createdAt: testUtils.createMockDate()
      };
      triggerService.createTriggerOrder.mockResolvedValue(mockResponse);
      const response = await request(app)
        .post('/trigger/create')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(triggerService.createTriggerOrder).toHaveBeenCalledWith(
        validPayload.inputToken,
        validPayload.outputToken,
        validPayload.amount,
        validPayload.triggerPrice,
        validPayload.triggerType,
        validPayload.userPublicKey,
        validPayload.expiryDate
      );
    });

    it('should validate input token format', async () => {
      const response = await request(app)
        .post('/trigger/create')
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
        .post('/trigger/create')
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
      const response = await request(app)
        .post('/trigger/create')
        .send({
          ...validPayload,
          amount: '-1'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Amount must be a positive number'
      });
    });

    it('should validate trigger price is positive', async () => {
      const response = await request(app)
        .post('/trigger/create')
        .send({
          ...validPayload,
          triggerPrice: '-1'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Trigger price must be a positive number'
      });
    });

    it('should validate trigger type', async () => {
      const response = await request(app)
        .post('/trigger/create')
        .send({
          ...validPayload,
          triggerType: 'invalid-type'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid trigger type. Must be one of: above, below'
      });
    });

    it('should validate user public key format', async () => {
      const response = await request(app)
        .post('/trigger/create')
        .send({
          ...validPayload,
          userPublicKey: 'invalid-address'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid Solana public key format'
      });
    });

    it('should validate expiry date is in the future', async () => {
      const response = await request(app)
        .post('/trigger/create')
        .send({
          ...validPayload,
          expiryDate: testUtils.createMockDate(Date.now() - 24 * 60 * 60 * 1000) // yesterday
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Expiry date must be in the future'
      });
    });

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/trigger/create')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: expect.stringContaining('Missing required parameters')
      });
    });

    it('should handle service errors', async () => {
      triggerService.createTriggerOrder.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .post('/trigger/create')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('GET /trigger/list', () => {
    const validQuery = {
      userPublicKey: testData.validSolanaAddress,
      limit: 10,
      offset: 0,
      status: 'active'
    };

    it('should get trigger orders successfully', async () => {
      const mockResponse = {
        orders: [
          {
            id: testUtils.generateTransactionId(),
            status: 'active',
            inputToken: testData.validTokens.SOL,
            outputToken: testData.validTokens.USDC,
            amount: testData.validAmounts.SOL,
            triggerPrice: '100',
            triggerType: 'above',
            userPublicKey: testData.validSolanaAddress,
            expiryDate: testUtils.createMockDate(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: testUtils.createMockDate()
          }
        ],
        total: 1
      };
      triggerService.getTriggerOrders.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/trigger/list')
        .query(validQuery);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(triggerService.getTriggerOrders).toHaveBeenCalledWith(
        validQuery.userPublicKey,
        validQuery.limit,
        validQuery.offset,
        validQuery.status
      );
    });

    it('should validate user public key format', async () => {
      const response = await request(app)
        .get('/trigger/list')
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
        .get('/trigger/list')
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

    it('should validate status value', async () => {
      const response = await request(app)
        .get('/trigger/list')
        .query({
          ...validQuery,
          status: 'invalid-status'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid status value. Must be one of: active, triggered, expired, cancelled'
      });
    });

    it('should handle service errors', async () => {
      triggerService.getTriggerOrders.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get('/trigger/list')
        .query(validQuery);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });

    it('should return empty list when no orders found', async () => {
      const mockResponse = {
        orders: [],
        total: 0
      };
      triggerService.getTriggerOrders.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/trigger/list')
        .query(validQuery);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });
  });

  describe('PUT /trigger/update', () => {
    const orderId = testUtils.generateTransactionId();
    const validPayload = {
      id: orderId,
      triggerPrice: '110',
      expiryDate: testUtils.createMockDate(Date.now() + 60 * 24 * 60 * 60 * 1000)
    };

    it('should update trigger order successfully', async () => {
      const mockResponse = {
        id: orderId,
        status: 'active',
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        amount: testData.validAmounts.SOL,
        triggerPrice: validPayload.triggerPrice,
        triggerType: 'above',
        userPublicKey: testData.validSolanaAddress,
        expiryDate: validPayload.expiryDate,
        updatedAt: testUtils.createMockDate()
      };
      triggerService.updateTriggerOrder.mockResolvedValue(mockResponse);
      const response = await request(app)
        .put('/trigger/update')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(triggerService.updateTriggerOrder).toHaveBeenCalledWith(
        orderId,
        validPayload.triggerPrice,
        validPayload.expiryDate
      );
    });

    it('should validate trigger price is positive', async () => {
      const response = await request(app)
        .put('/trigger/update')
        .send({
          ...validPayload,
          triggerPrice: '-1'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Trigger price must be a positive number'
      });
    });

    it('should validate expiry date is in the future', async () => {
      const response = await request(app)
        .put('/trigger/update')
        .send({
          ...validPayload,
          expiryDate: testUtils.createMockDate(Date.now() - 24 * 60 * 60 * 1000) // yesterday
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Expiry date must be in the future'
      });
    });

    it('should return 404 when order not found', async () => {
      triggerService.updateTriggerOrder.mockResolvedValue(null);
      const response = await request(app)
        .put('/trigger/update')
        .send(validPayload);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Trigger order not found'
      });
    });

    it('should handle service errors', async () => {
      triggerService.updateTriggerOrder.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .put('/trigger/update')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('DELETE /trigger/cancel/:id', () => {
    const orderId = testUtils.generateTransactionId();

    it('should cancel trigger order successfully', async () => {
      const mockResponse = {
        id: orderId,
        status: 'cancelled',
        cancelledAt: testUtils.createMockDate()
      };
      triggerService.cancelTriggerOrder.mockResolvedValue(mockResponse);
      const response = await request(app)
        .delete(`/trigger/cancel/${orderId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(triggerService.cancelTriggerOrder).toHaveBeenCalledWith(orderId);
    });

    it('should return 404 when order not found', async () => {
      triggerService.cancelTriggerOrder.mockResolvedValue(null);
      const response = await request(app)
        .delete(`/trigger/cancel/${orderId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Trigger order not found'
      });
    });

    it('should handle service errors', async () => {
      triggerService.cancelTriggerOrder.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .delete(`/trigger/cancel/${orderId}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });
}); 