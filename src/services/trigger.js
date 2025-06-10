import axios from 'axios';

const JUP_API_BASE_URL = process.env.JUP_API_BASE_URL || 'https://quote-api.jup.ag/v6';

class TriggerService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_BASE_URL,
      timeout: parseInt(process.env.JUP_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async createTriggerOrder(params) {
    try {
      const { inputToken, outputToken, amount, triggerPrice, walletAddress } = params;
      // TODO: Implement trigger order creation with jup.ag API
      return {
        orderId: 'ORDER_ID',
        status: 'pending',
        inputToken,
        outputToken,
        amount,
        triggerPrice,
        walletAddress,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to create trigger order: ${error.message}`);
    }
  }

  async getTriggerOrders(walletAddress) {
    try {
      // TODO: Implement trigger orders list request to jup.ag API
      return {
        orders: [
          {
            orderId: 'ORDER_ID',
            status: 'pending',
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: '1',
            triggerPrice: '100',
            walletAddress,
            createdAt: new Date().toISOString()
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get trigger orders: ${error.message}`);
    }
  }

  async cancelTriggerOrder(orderId) {
    try {
      // TODO: Implement trigger order cancellation with jup.ag API
      return {
        orderId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to cancel trigger order: ${error.message}`);
    }
  }
}

export default new TriggerService(); 