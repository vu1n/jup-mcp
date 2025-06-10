import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';
import ultraRoutes from './routes/ultra.js';
import swapRoutes from './routes/swap.js';
import tokenRoutes from './routes/token.js';
import priceRoutes from './routes/price.js';
import triggerRoutes from './routes/trigger.js';
import recurringRoutes from './routes/recurring.js';

// Load environment variables
dotenv.config();

// Create logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Routes
app.use('/ultra', ultraRoutes);
app.use('/swap', swapRoutes);
app.use('/token', tokenRoutes);
app.use('/price', priceRoutes);
app.use('/trigger', triggerRoutes);
app.use('/recurring', recurringRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 