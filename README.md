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