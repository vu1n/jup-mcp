import axios from 'axios';
import { JUP_API_CONFIG } from '../config/api.js';

class RecurringService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_CONFIG.BASE_URL,
      timeout: JUP_API_CONFIG.TIMEOUT,
      headers: JUP_API_CONFIG.HEADERS
    });
  }

  async createRecurringPayment(params) {
    try {
      const { inputToken, outputToken, amount, frequency, walletAddress } = params;
      
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
        userPublicKey: walletAddress,
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        frequency,
        quoteResponse: quoteResponse.data,
        wrapUnwrapSOL: true,
        computeUnitPriceMicroLamports: 0,
        asLegacyTransaction: false,
        useSharedAccounts: true
      });

      return {
        paymentId: response.data.paymentId,
        status: 'active',
        inputToken,
        outputToken,
        amount,
        frequency,
        walletAddress,
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
        throw new Error(`Failed to create recurring payment: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to create recurring payment: ${error.message}`);
    }
  }

  async getRecurringPayments(walletAddress) {
    try {
      const response = await this.client.get(`${JUP_API_CONFIG.ENDPOINTS.RECURRING}/${walletAddress}`);
      
      return {
        payments: response.data.payments.map(payment => ({
          paymentId: payment.paymentId,
          status: payment.status,
          inputToken: payment.inputMint,
          outputToken: payment.outputMint,
          amount: payment.amount,
          frequency: payment.frequency,
          walletAddress: payment.userPublicKey,
          createdAt: payment.createdAt,
          nextPaymentAt: payment.nextPaymentAt,
          lastPaymentAt: payment.lastPaymentAt,
          cancelledAt: payment.cancelledAt,
          quote: payment.quote
        }))
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get recurring payments: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get recurring payments: ${error.message}`);
    }
  }

  async cancelRecurringPayment(paymentId) {
    try {
      const response = await this.client.post(`${JUP_API_CONFIG.ENDPOINTS.RECURRING}/cancel`, {
        paymentId
      });

      return {
        paymentId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        transactionId: response.data.transactionId
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to cancel recurring payment: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to cancel recurring payment: ${error.message}`);
    }
  }
}

export default new RecurringService(); 