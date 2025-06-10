import axios from 'axios';

const JUP_API_BASE_URL = process.env.JUP_API_BASE_URL || 'https://quote-api.jup.ag/v6';

class TokenService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_BASE_URL,
      timeout: parseInt(process.env.JUP_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getTokenInfo(tokenAddress) {
    try {
      // TODO: Implement token info request to jup.ag API
      return {
        address: tokenAddress,
        symbol: 'TOKEN',
        name: 'Token Name',
        decimals: 9,
        logoURI: 'https://example.com/logo.png',
        tags: ['stablecoin', 'defi']
      };
    } catch (error) {
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  async getTokenList(params = {}) {
    try {
      const { tags, search } = params;
      // TODO: Implement token list request to jup.ag API
      return {
        tokens: [
          {
            address: 'TOKEN1',
            symbol: 'TKN1',
            name: 'Token One',
            decimals: 9
          },
          {
            address: 'TOKEN2',
            symbol: 'TKN2',
            name: 'Token Two',
            decimals: 6
          }
        ],
        pagination: {
          total: 2
        }
      };
    } catch (error) {
      throw new Error(`Failed to get token list: ${error.message}`);
    }
  }
}

export default new TokenService(); 