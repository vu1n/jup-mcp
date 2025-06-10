import { jest } from '@jest/globals';
import request from 'supertest';
import recurringRoutes from '../routes/recurring.js';
import recurringService from '../services/recurring.js';
import { createTestApp, testData, testUtils } from './setup.js';

const app = createTestApp(recurringRoutes, '/recurring');

describe('Recurring API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recurringService.createRecurringPayment = jest.fn();
    recurringService.getRecurringPayments = jest.fn();
    recurringService.updateRecurringPayment = jest.fn();
    recurringService.cancelRecurringPayment = jest.fn();
  });

  describe('POST /recurring/create', () => {
    const validPayload = {
      inputToken: testData.validTokens.SOL,
      outputToken: testData.validTokens.USDC,
      amount: testData.validAmounts.SOL,
      frequency: 'daily',
      startDate: testUtils.createMockDate(),
      endDate: testUtils.createMockDate(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      userPublicKey: testData.validSolanaAddress
    };

    it('should create a recurring payment successfully', async () => {
      const mockResponse = {
        id: testUtils.generateTransactionId(),
        status: 'active',
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        amount: testData.validAmounts.SOL,
        frequency: 'daily',
        startDate: validPayload.startDate,
        endDate: validPayload.endDate,
        userPublicKey: testData.validSolanaAddress,
        createdAt: testUtils.createMockDate()
      };
      recurringService.createRecurringPayment.mockResolvedValue(mockResponse);
      const response = await request(app)
        .post('/recurring/create')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(recurringService.createRecurringPayment).toHaveBeenCalledWith(
        validPayload.inputToken,
        validPayload.outputToken,
        validPayload.amount,
        validPayload.frequency,
        validPayload.startDate,
        validPayload.endDate,
        validPayload.userPublicKey
      );
    });

    it('should validate input token format', async () => {
      const response = await request(app)
        .post('/recurring/create')
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
        .post('/recurring/create')
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
        .post('/recurring/create')
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

    it('should validate frequency value', async () => {
      const response = await request(app)
        .post('/recurring/create')
        .send({
          ...validPayload,
          frequency: 'invalid-frequency'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid frequency value. Must be one of: daily, weekly, monthly'
      });
    });

    it('should validate start date is before end date', async () => {
      const response = await request(app)
        .post('/recurring/create')
        .send({
          ...validPayload,
          startDate: testUtils.createMockDate(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          endDate: testUtils.createMockDate(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Start date must be before end date'
      });
    });

    it('should validate user public key format', async () => {
      const response = await request(app)
        .post('/recurring/create')
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

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/recurring/create')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: expect.stringContaining('Missing required parameters')
      });
    });

    it('should handle service errors', async () => {
      recurringService.createRecurringPayment.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .post('/recurring/create')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('GET /recurring/list', () => {
    const validQuery = {
      userPublicKey: testData.validSolanaAddress,
      limit: 10,
      offset: 0,
      status: 'active'
    };

    it('should get recurring payments successfully', async () => {
      const mockResponse = {
        payments: [
          {
            id: testUtils.generateTransactionId(),
            status: 'active',
            inputToken: testData.validTokens.SOL,
            outputToken: testData.validTokens.USDC,
            amount: testData.validAmounts.SOL,
            frequency: 'daily',
            startDate: testUtils.createMockDate(),
            endDate: testUtils.createMockDate(Date.now() + 30 * 24 * 60 * 60 * 1000),
            userPublicKey: testData.validSolanaAddress,
            createdAt: testUtils.createMockDate()
          }
        ],
        total: 1
      };
      recurringService.getRecurringPayments.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/recurring/list')
        .query(validQuery);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(recurringService.getRecurringPayments).toHaveBeenCalledWith(
        validQuery.userPublicKey,
        validQuery.limit,
        validQuery.offset,
        validQuery.status
      );
    });

    it('should validate user public key format', async () => {
      const response = await request(app)
        .get('/recurring/list')
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
        .get('/recurring/list')
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
        .get('/recurring/list')
        .query({
          ...validQuery,
          status: 'invalid-status'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid status value. Must be one of: active, completed, cancelled'
      });
    });

    it('should handle service errors', async () => {
      recurringService.getRecurringPayments.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .get('/recurring/list')
        .query(validQuery);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });

    it('should return empty list when no payments found', async () => {
      const mockResponse = {
        payments: [],
        total: 0
      };
      recurringService.getRecurringPayments.mockResolvedValue(mockResponse);
      const response = await request(app)
        .get('/recurring/list')
        .query(validQuery);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });
  });

  describe('PUT /recurring/update', () => {
    const paymentId = testUtils.generateTransactionId();
    const validPayload = {
      id: paymentId,
      amount: testData.validAmounts.SOL,
      frequency: 'weekly',
      endDate: testUtils.createMockDate(Date.now() + 60 * 24 * 60 * 60 * 1000)
    };

    it('should update recurring payment successfully', async () => {
      const mockResponse = {
        id: paymentId,
        status: 'active',
        inputToken: testData.validTokens.SOL,
        outputToken: testData.validTokens.USDC,
        amount: validPayload.amount,
        frequency: validPayload.frequency,
        startDate: testUtils.createMockDate(),
        endDate: validPayload.endDate,
        userPublicKey: testData.validSolanaAddress,
        updatedAt: testUtils.createMockDate()
      };
      recurringService.updateRecurringPayment.mockResolvedValue(mockResponse);
      const response = await request(app)
        .put('/recurring/update')
        .send(validPayload);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(recurringService.updateRecurringPayment).toHaveBeenCalledWith(
        paymentId,
        validPayload.amount,
        validPayload.frequency,
        validPayload.endDate
      );
    });

    it('should validate amount is positive', async () => {
      const response = await request(app)
        .put('/recurring/update')
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

    it('should validate frequency value', async () => {
      const response = await request(app)
        .put('/recurring/update')
        .send({
          ...validPayload,
          frequency: 'invalid-frequency'
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid frequency value. Must be one of: daily, weekly, monthly'
      });
    });

    it('should validate end date is in the future', async () => {
      const response = await request(app)
        .put('/recurring/update')
        .send({
          ...validPayload,
          endDate: testUtils.createMockDate(Date.now() - 24 * 60 * 60 * 1000) // yesterday
        });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'End date must be in the future'
      });
    });

    it('should return 404 when payment not found', async () => {
      recurringService.updateRecurringPayment.mockResolvedValue(null);
      const response = await request(app)
        .put('/recurring/update')
        .send(validPayload);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Recurring payment not found'
      });
    });

    it('should handle service errors', async () => {
      recurringService.updateRecurringPayment.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .put('/recurring/update')
        .send(validPayload);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('DELETE /recurring/cancel/:id', () => {
    const paymentId = testUtils.generateTransactionId();

    it('should cancel recurring payment successfully', async () => {
      const mockResponse = {
        id: paymentId,
        status: 'cancelled',
        cancelledAt: testUtils.createMockDate()
      };
      recurringService.cancelRecurringPayment.mockResolvedValue(mockResponse);
      const response = await request(app)
        .delete(`/recurring/cancel/${paymentId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(recurringService.cancelRecurringPayment).toHaveBeenCalledWith(paymentId);
    });

    it('should return 404 when payment not found', async () => {
      recurringService.cancelRecurringPayment.mockResolvedValue(null);
      const response = await request(app)
        .delete(`/recurring/cancel/${paymentId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Recurring payment not found'
      });
    });

    it('should handle service errors', async () => {
      recurringService.cancelRecurringPayment.mockRejectedValue(new Error('Service error'));
      const response = await request(app)
        .delete(`/recurring/cancel/${paymentId}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service error'
      });
    });
  });
}); 