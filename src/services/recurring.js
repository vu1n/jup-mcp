import axios from 'axios';
import { JUP_API_CONFIG } from '../config/api.js';
import { ServiceError, NotFoundError } from '../utils/errors.js';

class RecurringService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_CONFIG.BASE_URL,
      timeout: JUP_API_CONFIG.TIMEOUT,
      headers: JUP_API_CONFIG.HEADERS
    });
  }

  async createRecurringPayment(inputToken, outputToken, amount, frequency, userPublicKey, startDate, endDate) {
    try {
      // First get the quote
      const quoteResponse = await this.client.post(JUP_API_CONFIG.ENDPOINTS.QUOTE, {
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        slippageBps: 100, // 1% default slippage
        onlyDirectRoutes: false,
        asLegacyTransaction: false
      });

      // Create recurring payment
      const response = await this.client.post(JUP_API_CONFIG.ENDPOINTS.RECURRING, {
        userPublicKey,
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        frequency,
        startDate,
        endDate,
        quoteResponse: quoteResponse.data,
        wrapUnwrapSOL: true,
        computeUnitPriceMicroLamports: 0,
        asLegacyTransaction: false,
        useSharedAccounts: true
      });

      return {
        id: response.data.paymentId,
        status: 'active',
        inputToken,
        outputToken,
        amount,
        frequency,
        userPublicKey,
        startDate,
        endDate,
        createdAt: new Date().toISOString(),
        nextPaymentAt: response.data.nextPaymentAt,
        quote: {
          estimatedOutput: quoteResponse.data.outAmount,
          price: quoteResponse.data.price,
          priceImpact: quoteResponse.data.priceImpactPct
        }
      };
    } catch (error) {
      if (error.response) {
        throw new ServiceError(`Failed to create recurring payment: ${error.response.data.message || error.message}`, error.response.status);
      }
      throw new ServiceError(`Failed to create recurring payment: ${error.message}`);
    }
  }

  async getRecurringPayments(userPublicKey, limit, offset, status) {
    try {
      const response = await this.client.get(`${JUP_API_CONFIG.ENDPOINTS.RECURRING}/${userPublicKey}`, {
        params: { limit, offset, status }
      });
      
      return {
        payments: response.data.payments.map(payment => ({
          id: payment.paymentId,
          status: payment.status,
          inputToken: payment.inputMint,
          outputToken: payment.outputMint,
          amount: payment.amount,
          frequency: payment.frequency,
          userPublicKey: payment.userPublicKey,
          startDate: payment.startDate,
          endDate: payment.endDate,
          createdAt: payment.createdAt,
          nextPaymentAt: payment.nextPaymentAt,
          lastPaymentAt: payment.lastPaymentAt,
          cancelledAt: payment.cancelledAt,
          quote: payment.quote
        })),
        total: response.data.total
      };
    } catch (error) {
      if (error.response) {
        throw new ServiceError(`Failed to get recurring payments: ${error.response.data.message || error.message}`, error.response.status);
      }
      throw new ServiceError(`Failed to get recurring payments: ${error.message}`);
    }
  }

  async updateRecurringPayment(paymentId, amount, frequency, endDate) {
    try {
      const response = await this.client.put(`${JUP_API_CONFIG.ENDPOINTS.RECURRING}/${paymentId}`, {
        amount,
        frequency,
        endDate
      });

      return {
        id: paymentId,
        status: 'active',
        inputToken: response.data.inputMint,
        outputToken: response.data.outputMint,
        amount: response.data.amount,
        frequency: response.data.frequency,
        userPublicKey: response.data.userPublicKey,
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response?.data?.message?.includes('not found')) {
        return null;
      }
      if (error.response) {
        throw new ServiceError(`Failed to update recurring payment: ${error.response.data.message || error.message}`, error.response.status);
      }
      throw new ServiceError(`Failed to update recurring payment: ${error.message}`);
    }
  }

  async cancelRecurringPayment(paymentId) {
    try {
      const response = await this.client.post(`${JUP_API_CONFIG.ENDPOINTS.RECURRING}/cancel`, {
        paymentId
      });

      return {
        id: paymentId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response) {
        throw new ServiceError(`Failed to cancel recurring payment: ${error.response.data.message || error.message}`, error.response.status);
      }
      throw new ServiceError(`Failed to cancel recurring payment: ${error.message}`);
    }
  }
}

export default new RecurringService(); 