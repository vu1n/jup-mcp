import axios from 'axios';

const JUP_API_BASE_URL = process.env.JUP_API_BASE_URL || 'https://quote-api.jup.ag/v6';

class RecurringService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_BASE_URL,
      timeout: parseInt(process.env.JUP_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async createRecurringPayment(params) {
    try {
      const { inputToken, outputToken, amount, frequency, walletAddress } = params;
      // TODO: Implement recurring payment creation with jup.ag API
      return {
        paymentId: 'PAYMENT_ID',
        status: 'active',
        inputToken,
        outputToken,
        amount,
        frequency,
        walletAddress,
        createdAt: new Date().toISOString(),
        nextPaymentAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Example: next day
      };
    } catch (error) {
      throw new Error(`Failed to create recurring payment: ${error.message}`);
    }
  }

  async getRecurringPayments(walletAddress) {
    try {
      // TODO: Implement recurring payments list request to jup.ag API
      return {
        payments: [
          {
            paymentId: 'PAYMENT_ID',
            status: 'active',
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: '1',
            frequency: 'daily',
            walletAddress,
            createdAt: new Date().toISOString(),
            nextPaymentAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get recurring payments: ${error.message}`);
    }
  }

  async cancelRecurringPayment(paymentId) {
    try {
      // TODO: Implement recurring payment cancellation with jup.ag API
      return {
        paymentId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to cancel recurring payment: ${error.message}`);
    }
  }
}

export default new RecurringService(); 