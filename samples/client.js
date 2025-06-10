const axios = require('axios');

class JupMCPClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Ultra API Methods
  async getQuote(inputToken, outputToken, amount, slippage = 1) {
    try {
      const response = await this.client.post('/ultra/quote', {
        inputToken,
        outputToken,
        amount,
        slippage
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async executeSwap(inputToken, outputToken, amount, userPublicKey, slippage = 1) {
    try {
      const response = await this.client.post('/ultra/swap', {
        inputToken,
        outputToken,
        amount,
        userPublicKey,
        slippage,
        wrapUnwrapSOL: true
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Token API Methods
  async getTokenInfo(tokenAddress) {
    try {
      const response = await this.client.get(`/token/info/${tokenAddress}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTokenList() {
    try {
      const response = await this.client.get('/token/list');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Price API Methods
  async getTokenPrice(tokenA, tokenB) {
    try {
      const response = await this.client.post('/price', {
        tokenA,
        tokenB
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Recurring API Methods
  async createRecurringPayment(inputToken, outputToken, amount, frequency, walletAddress) {
    try {
      const response = await this.client.post('/recurring/create', {
        inputToken,
        outputToken,
        amount,
        frequency,
        walletAddress
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecurringPayments(walletAddress) {
    try {
      const response = await this.client.get(`/recurring/list/${walletAddress}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return new Error(`API Error: ${error.response.data.message || error.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

module.exports = JupMCPClient; 