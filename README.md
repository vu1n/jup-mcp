# MCP Server for jup.ag API

An open-source MCP (Model Context Protocol) server that acts as an intermediary for interacting with the jup.ag API. This server provides a standardized and simplified way for developers to access and utilize various functionalities offered by jup.ag, including its Ultra, Swap, Token, Price, Trigger, and Recurring APIs.

## Features

- 🚀 Easy integration with all jup.ag APIs through a consistent MCP interface
- 🔄 Support for Ultra API (quotes and swaps)
- 💱 Support for Swap API (token lists and transactions)
- 🪙 Support for Token API (token information and lists)
- 💰 Support for Price API (token prices)
- ⏰ Support for Trigger API (limit orders)
- 🔁 Support for Recurring API (recurring payments)
- 🏠 Local development and testing support
- ☁️ Cloudflare deployment support

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Make (optional, for using Makefile commands)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/jup-mcp.git
   cd jup-mcp
   ```

2. Install dependencies:
   ```bash
   make install
   # or
   npm install
   ```

## Development

Start the development server with hot reload:
```bash
make dev
# or
npm run dev
```

The server will be available at `http://localhost:3000`.

## API Usage

### Ultra API

#### Get a swap quote
```bash
curl -X POST http://localhost:3000/ultra/quote \
  -H "Content-Type: application/json" \
  -d '{
    "inputToken": "SOL",
    "outputToken": "USDC",
    "amount": "1",
    "slippage": 1
  }'
```

#### Execute a swap
```bash
curl -X POST http://localhost:3000/ultra/swap \
  -H "Content-Type: application/json" \
  -d '{
    "inputToken": "SOL",
    "outputToken": "USDC",
    "amount": "1",
    "slippage": 1,
    "userPublicKey": "YOUR_SOLANA_PUBLIC_KEY",
    "wrapUnwrapSOL": true
  }'
```

#### Get swap history
```bash
curl -X GET http://localhost:3000/ultra/history \
  -H "Content-Type: application/json" \
  -d '{
    "userPublicKey": "YOUR_SOLANA_PUBLIC_KEY",
    "limit": 10,
    "offset": 0
  }'
```

#### Get swap status
```bash
curl -X GET http://localhost:3000/ultra/status/{swapId}
```

### Swap API

#### Get supported tokens
```bash
curl http://localhost:3000/swap/tokens
```

#### Get recent swap transactions
```bash
curl http://localhost:3000/swap/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "offset": 0
  }'
```

### Token API

#### Get token information
```bash
curl http://localhost:3000/token/info/TOKEN_ADDRESS
```

#### Get token list
```bash
curl http://localhost:3000/token/list
```

### Price API

#### Get token price
```bash
curl http://localhost:3000/price \
  -H "Content-Type: application/json" \
  -d '{
    "tokenA": "SOL",
    "tokenB": "USDC"
  }'
```

### Trigger API

#### Create a limit order
```bash
curl -X POST http://localhost:3000/trigger/create \
  -H "Content-Type: application/json" \
  -d '{
    "inputToken": "SOL",
    "outputToken": "USDC",
    "amount": "1",
    "triggerPrice": "100",
    "userPublicKey": "YOUR_SOLANA_PUBLIC_KEY"
  }'
```

#### Get active trigger orders
```bash
curl http://localhost:3000/trigger/list/YOUR_SOLANA_PUBLIC_KEY
```

#### Cancel trigger order
```bash
curl -X POST http://localhost:3000/trigger/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID"
  }'
```

### Recurring API

#### Create a recurring payment
```bash
curl -X POST http://localhost:3000/recurring/create \
  -H "Content-Type: application/json" \
  -d '{
    "inputToken": "SOL",
    "outputToken": "USDC",
    "amount": "1",
    "frequency": "daily",
    "walletAddress": "YOUR_SOLANA_PUBLIC_KEY"
  }'
```

#### Get active recurring payments
```bash
curl http://localhost:3000/recurring/list/YOUR_SOLANA_PUBLIC_KEY
```

#### Cancel recurring payment
```bash
curl -X POST http://localhost:3000/recurring/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "PAYMENT_ID"
  }'
```

#### Update recurring payment
```bash
curl -X PUT http://localhost:3000/recurring/update \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "PAYMENT_ID",
    "amount": "2",
    "frequency": "weekly"
  }'
```

## Error Handling

The MCP server uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common error codes:
- 400: Bad Request (missing or invalid parameters)
- 401: Unauthorized (authentication required)
- 404: Not Found (resource not found)
- 500: Internal Server Error (server-side error)

## Deployment

### Local Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   make start
   # or
   npm start
   ```

### Cloudflare Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Deploy:
   ```bash
   wrangler publish
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [jup.ag](https://jup.ag) for providing the API
- All contributors who participate in this project

## Using as an MCP Server

The MCP server provides a standardized interface for interacting with the jup.ag API. Here's how to use it in your project:

### Installation

1. Install the package:
   ```bash
   npm install jup-mcp
   ```

2. Import and initialize the client:
   ```javascript
   const JupMCPClient = require('jup-mcp');
   const client = new JupMCPClient('http://localhost:3000');
   ```

### Sample Implementation

We provide sample implementations in the `samples` directory:

- `client.js`: A complete client implementation showing how to interact with all API endpoints
- `usage.js`: Example usage of the client for common operations
- `config.js`: Sample configuration file for customizing the server behavior

To run the samples:

1. Copy the sample files to your project:
   ```bash
   cp -r samples/* your-project/
   ```

2. Install dependencies:
   ```bash
   npm install axios
   ```

3. Run the usage example:
   ```bash
   node usage.js
   ```

### Configuration

The MCP server can be configured using environment variables or a configuration file. Here are the main configuration options:

```javascript
{
  server: {
    port: 3000,              // Server port
    host: 'localhost',       // Server host
    cors: {                  // CORS configuration
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  },
  jupAg: {
    baseUrl: 'https://quote-api.jup.ag/v6',  // jup.ag API base URL
    timeout: 30000,          // Request timeout in milliseconds
    retries: 3,              // Number of retry attempts
    retryDelay: 1000         // Delay between retries in milliseconds
  }
}
```

### Error Handling

The client includes built-in error handling for common scenarios:

```javascript
try {
  const quote = await client.getQuote('SOL', 'USDC', '1');
  console.log('Quote:', quote);
} catch (error) {
  if (error.message.includes('API Error')) {
    // Handle API-specific errors
    console.error('API Error:', error.message);
  } else if (error.message.includes('No response')) {
    // Handle connection errors
    console.error('Connection Error:', error.message);
  } else {
    // Handle other errors
    console.error('Error:', error.message);
  }
}
```

### Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks to handle potential errors gracefully.

2. **Configuration**: Use environment variables for sensitive configuration values and deployment-specific settings.

3. **Rate Limiting**: Be mindful of API rate limits and implement appropriate caching strategies.

4. **Security**: When deploying to production:
   - Configure CORS appropriately
   - Use HTTPS
   - Implement proper authentication if needed
   - Set up rate limiting

5. **Monitoring**: Implement logging and monitoring to track API usage and errors.

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details. 