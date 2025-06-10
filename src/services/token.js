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
      const response = await this.client.get(`/token/${tokenAddress}`);
      return {
        address: response.data.address,
        symbol: response.data.symbol,
        name: response.data.name,
        decimals: response.data.decimals,
        logoURI: response.data.logoURI,
        tags: response.data.tags,
        verified: response.data.verified
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  async getTokenList(limit, offset, search, tags, verified) {
    try {
      const response = await this.client.get('/tokens', {
        params: {
          limit,
          offset,
          search,
          tags: tags ? JSON.stringify(tags) : undefined,
          verified
        }
      });

      return {
        tokens: response.data.tokens.map(token => ({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
          tags: token.tags,
          verified: token.verified
        })),
        total: response.data.total
      };
    } catch (error) {
      throw new Error(`Failed to get token list: ${error.message}`);
    }
  }
}

export default new TokenService(); 