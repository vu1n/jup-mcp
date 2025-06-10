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

  async createTriggerOrder(inputToken, outputToken, amount, triggerPrice, userPublicKey, triggerType, expiryDate) {
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

      // Create trigger order
      const response = await this.client.post(JUP_API_CONFIG.ENDPOINTS.TRIGGER, {
        userPublicKey,
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        triggerPrice,
        triggerType,
        expiryDate,
        quoteResponse: quoteResponse.data,
        wrapUnwrapSOL: true,
        computeUnitPriceMicroLamports: 0,
        asLegacyTransaction: false,
        useSharedAccounts: true
      });

      return {
        id: response.data.orderId,
        status: 'active',
        inputToken,
        outputToken,
        amount,
        triggerPrice,
        triggerType,
        userPublicKey,
        expiryDate,
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

  async getTriggerOrders(userPublicKey, limit, offset, status) {
    try {
      const response = await this.client.get(`${JUP_API_CONFIG.ENDPOINTS.TRIGGER}/${userPublicKey}`, {
        params: { limit, offset, status }
      });
      
      return {
        orders: response.data.orders.map(order => ({
          id: order.orderId,
          status: order.status,
          inputToken: order.inputMint,
          outputToken: order.outputMint,
          amount: order.amount,
          triggerPrice: order.triggerPrice,
          triggerType: order.triggerType,
          userPublicKey: order.userPublicKey,
          expiryDate: order.expiryDate,
          createdAt: order.createdAt,
          executedAt: order.executedAt,
          cancelledAt: order.cancelledAt,
          quote: order.quote
        })),
        total: response.data.total
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get trigger orders: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get trigger orders: ${error.message}`);
    }
  }

  async updateTriggerOrder(orderId, triggerPrice, expiryDate) {
    try {
      const response = await this.client.put(`${JUP_API_CONFIG.ENDPOINTS.TRIGGER}/${orderId}`, {
        triggerPrice,
        expiryDate
      });

      return {
        id: orderId,
        status: 'active',
        inputToken: response.data.inputMint,
        outputToken: response.data.outputMint,
        amount: response.data.amount,
        triggerPrice: response.data.triggerPrice,
        triggerType: response.data.triggerType,
        userPublicKey: response.data.userPublicKey,
        expiryDate: response.data.expiryDate,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response) {
        throw new Error(`Failed to update trigger order: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to update trigger order: ${error.message}`);
    }
  }

  async cancelTriggerOrder(orderId) {
    try {
      const response = await this.client.post(`${JUP_API_CONFIG.ENDPOINTS.TRIGGER}/cancel`, {
        orderId
      });

      return {
        id: orderId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response) {
        throw new Error(`Failed to cancel trigger order: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to cancel trigger order: ${error.message}`);
    }
  }
}

export default new TriggerService(); 