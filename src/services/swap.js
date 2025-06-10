import axios from 'axios';
import { JUP_API_CONFIG } from '../config/api.js';

class SwapService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_CONFIG.BASE_URL,
      timeout: JUP_API_CONFIG.TIMEOUT,
      headers: JUP_API_CONFIG.HEADERS
    });
  }

  async getTokens() {
    try {
      const response = await this.client.get(JUP_API_CONFIG.ENDPOINTS.TOKENS);
      return {
        tokens: response.data.map(token => ({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
          tags: token.tags || []
        }))
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get tokens: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }

  async getTransactions(params = {}) {
    try {
      const { tokenAddress, limit = 10, offset = 0 } = params;
      
      // TODO: Implement when jup.ag provides a transactions endpoint
      // For now, return empty result as this endpoint is not yet available
      return {
        transactions: [],
        pagination: {
          limit,
          offset,
          total: 0
        }
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get transactions: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }
}

export default new SwapService(); 