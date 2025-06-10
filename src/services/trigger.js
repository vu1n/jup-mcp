import axios from 'axios';
import { JUP_API_CONFIG } from '../config/api.js';

class TriggerService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_CONFIG.BASE_URL,
      timeout: JUP_API_CONFIG.TIMEOUT,
      headers: JUP_API_CONFIG.HEADERS
    });
  }

  async createTriggerOrder(params) {
    try {
      const { inputToken, outputToken, amount, triggerPrice, walletAddress } = params;
      
      // First get the quote
      const quoteResponse = await this.client.post(JUP_API_CONFIG.ENDPOINTS.QUOTE, {
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        slippageBps: 100, // 1% default slippage
        onlyDirectRoutes: false,
        asLegacyTransaction: false
      });

      // Create trigger order
      const response = await this.client.post(JUP_API_CONFIG.ENDPOINTS.TRIGGER, {
        userPublicKey: walletAddress,
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        triggerPrice,
        quoteResponse: quoteResponse.data,
        wrapUnwrapSOL: true,
        computeUnitPriceMicroLamports: 0,
        asLegacyTransaction: false,
        useSharedAccounts: true
      });

      return {
        orderId: response.data.orderId,
        status: 'pending',
        inputToken,
        outputToken,
        amount,
        triggerPrice,
        walletAddress,
        createdAt: new Date().toISOString(),
        quote: {
          estimatedOutput: quoteResponse.data.outAmount,
          price: quoteResponse.data.price,
          priceImpact: quoteResponse.data.priceImpactPct
        }
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to create trigger order: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to create trigger order: ${error.message}`);
    }
  }

  async getTriggerOrders(walletAddress) {
    try {
      const response = await this.client.get(`${JUP_API_CONFIG.ENDPOINTS.TRIGGER}/${walletAddress}`);
      
      return {
        orders: response.data.orders.map(order => ({
          orderId: order.orderId,
          status: order.status,
          inputToken: order.inputMint,
          outputToken: order.outputMint,
          amount: order.amount,
          triggerPrice: order.triggerPrice,
          walletAddress: order.userPublicKey,
          createdAt: order.createdAt,
          executedAt: order.executedAt,
          cancelledAt: order.cancelledAt,
          quote: order.quote
        }))
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get trigger orders: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get trigger orders: ${error.message}`);
    }
  }

  async cancelTriggerOrder(orderId) {
    try {
      const response = await this.client.post(`${JUP_API_CONFIG.ENDPOINTS.TRIGGER}/cancel`, {
        orderId
      });

      return {
        orderId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        transactionId: response.data.transactionId
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to cancel trigger order: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to cancel trigger order: ${error.message}`);
    }
  }
}

export default new TriggerService(); 