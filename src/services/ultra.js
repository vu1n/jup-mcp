import axios from 'axios';
import { JUP_API_CONFIG } from '../config/api.js';

class UltraService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_CONFIG.BASE_URL,
      timeout: JUP_API_CONFIG.TIMEOUT,
      headers: JUP_API_CONFIG.HEADERS
    });
  }

  async getQuote(inputToken, outputToken, amount, slippage = 1) {
    try {
      const response = await this.client.post(JUP_API_CONFIG.ENDPOINTS.QUOTE, {
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        slippageBps: slippage * 100, // Convert percentage to basis points
        onlyDirectRoutes: false,
        asLegacyTransaction: false
      });

      return {
        inputToken,
        outputToken,
        amount,
        estimatedOutput: response.data.outAmount,
        price: response.data.price,
        priceImpact: response.data.priceImpactPct,
        route: response.data.routePlan,
        otherAmountThreshold: response.data.otherAmountThreshold,
        swapMode: response.data.swapMode
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get quote: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get quote: ${error.message}`);
    }
  }

  async executeSwap(inputToken, outputToken, amount, slippage, userPublicKey, wrapUnwrapSOL = true) {
    try {
      // First get the quote
      const quoteResponse = await this.client.post(JUP_API_CONFIG.ENDPOINTS.QUOTE, {
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        slippageBps: slippage * 100,
        onlyDirectRoutes: false,
        asLegacyTransaction: false
      });

      // Then get the swap transaction
      const swapResponse = await this.client.post(JUP_API_CONFIG.ENDPOINTS.SWAP, {
        userPublicKey,
        wrapUnwrapSOL,
        computeUnitPriceMicroLamports: 0,
        asLegacyTransaction: false,
        useSharedAccounts: true,
        ...quoteResponse.data
      });

      return {
        transactionId: swapResponse.data.swapTransaction,
        status: 'pending',
        inputToken,
        outputToken,
        amount,
        estimatedOutput: quoteResponse.data.outAmount,
        price: quoteResponse.data.price,
        priceImpact: quoteResponse.data.priceImpactPct
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to execute swap: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }
}

export default new UltraService(); 