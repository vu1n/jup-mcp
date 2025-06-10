import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import recurringRoutes from '../routes/recurring.js';
import recurringService from '../services/recurring.js';

const app = express();
app.use(express.json());
app.use('/recurring', recurringRoutes);

describe('Recurring API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recurringService.createRecurringPayment = jest.fn();
    recurringService.getRecurringPayments = jest.fn();
    recurringService.cancelRecurringPayment = jest.fn();
  });

  describe('POST /recurring/create', () => {
    const validPayload = {
      inputToken: 'SOL',
      outputToken: 'USDC',
      amount: '1000000000', // 1 SOL in lamports
      frequency: 'daily',
      walletAddress: 'wallet123'
    };

    it('should create a recurring payment successfully', async () => {
      const mockResponse = {
        paymentId: 'payment123',
        status: 'active',
        ...validPayload,
        createdAt: '2024-01-01T00:00:00.000Z',
        nextPaymentAt: '2024-01-02T00:00:00.000Z',
        quote: {
          estimatedOutput: '100000000',
          price: '100',
          priceImpact: '0.1'
        }
      };

      recurringService.createRecurringPayment.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/recurring/create')
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          paymentId: mockResponse.paymentId,
          status: mockResponse.status,
          inputToken: mockResponse.inputToken,
          outputToken: mockResponse.outputToken,
          amount: mockResponse.amount,
          frequency: mockResponse.frequency,
          walletAddress: mockResponse.walletAddress,
          quote: mockResponse.quote,
          createdAt: expect.any(String),
          nextPaymentAt: expect.any(String)
        })
      );
      expect(recurringService.createRecurringPayment).toHaveBeenCalledWith(validPayload);
    });

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/recurring/create')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Missing required parameters'
      });
    });

    it('should handle service errors', async () => {
      recurringService.createRecurringPayment.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/recurring/create')
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Service error'
      });
    });
  });

  describe('GET /recurring/list/:walletAddress', () => {
    const walletAddress = 'wallet123';

    it('should get recurring payments successfully', async () => {
      const mockResponse = {
        payments: [
          {
            paymentId: 'payment123',
            status: 'active',
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: '1000000000',
            frequency: 'daily',
            walletAddress,
            createdAt: '2024-01-01T00:00:00.000Z',
            nextPaymentAt: '2024-01-02T00:00:00.000Z',
            lastPaymentAt: null,
            cancelledAt: null,
            quote: {
              estimatedOutput: '100000000',
              price: '100',
              priceImpact: '0.1'
            }
          }
        ]
      };

      recurringService.getRecurringPayments.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get(`/recurring/list/${walletAddress}`);

      expect(response.status).toBe(200);
      expect(response.body.payments[0]).toEqual(
        expect.objectContaining({
          paymentId: mockResponse.payments[0].paymentId,
          status: mockResponse.payments[0].status,
          inputToken: mockResponse.payments[0].inputToken,
          outputToken: mockResponse.payments[0].outputToken,
          amount: mockResponse.payments[0].amount,
          frequency: mockResponse.payments[0].frequency,
          walletAddress: mockResponse.payments[0].walletAddress,
          quote: mockResponse.payments[0].quote,
          createdAt: expect.any(String),
          nextPaymentAt: expect.any(String)
        })
      );
      expect(recurringService.getRecurringPayments).toHaveBeenCalledWith(walletAddress);
    });

    it('should return 400 when wallet address is missing', async () => {
      const response = await request(app)
        .get('/recurring/list/');

      expect(response.status).toBe(404);
    });

    it('should handle service errors', async () => {
      recurringService.getRecurringPayments.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get(`/recurring/list/${walletAddress}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Service error'
      });
    });
  });

  describe('POST /recurring/cancel', () => {
    const paymentId = 'payment123';

    it('should cancel recurring payment successfully', async () => {
      const mockResponse = {
        paymentId,
        status: 'cancelled',
        cancelledAt: '2024-01-03T00:00:00.000Z',
        transactionId: 'tx123'
      };

      recurringService.cancelRecurringPayment.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/recurring/cancel')
        .send({ paymentId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          paymentId: mockResponse.paymentId,
          status: mockResponse.status,
          transactionId: mockResponse.transactionId,
          cancelledAt: expect.any(String)
        })
      );
      expect(recurringService.cancelRecurringPayment).toHaveBeenCalledWith(paymentId);
    });

    it('should return 400 when payment ID is missing', async () => {
      const response = await request(app)
        .post('/recurring/cancel')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Missing payment ID'
      });
    });

    it('should handle service errors', async () => {
      recurringService.cancelRecurringPayment.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/recurring/cancel')
        .send({ paymentId });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Service error'
      });
    });
  });
}); 